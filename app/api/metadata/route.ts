import { NextResponse } from "next/server";
import { getConnectionFromHeaders, getCollection } from "@/lib/chroma";
import { metadataQuerySchema } from "@/lib/validations";

/**
 * Metadata field information with detected type and sample values.
 */
interface MetadataField {
  name: string;
  type: string;
  sampleValues: unknown[];
}

/**
 * Detects the type of a value for metadata analysis.
 *
 * @param value - The value to analyze
 * @returns A string representing the detected type
 */
function detectType(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/**
 * GET /api/metadata
 *
 * Analyzes metadata fields from a ChromaDB collection.
 * Samples the first 100 records to detect unique fields and their types.
 * Requires X-Chroma-Host and X-Chroma-Port headers for connection.
 *
 * Query params:
 * - collection (required): Name of the collection
 *
 * @returns JSON response with fields array containing name, type, and sampleValues
 */
export async function GET(request: Request) {
  // Get connection info from headers
  const connection = getConnectionFromHeaders(request.headers);

  if (!connection) {
    return NextResponse.json(
      { error: "Missing or invalid X-Chroma-Host and/or X-Chroma-Port headers" },
      { status: 400 }
    );
  }

  // Parse and validate query parameters
  const { searchParams } = new URL(request.url);
  const rawParams = {
    collection: searchParams.get("collection") || "",
  };

  const parseResult = metadataQuerySchema.safeParse(rawParams);

  if (!parseResult.success) {
    const errorMessage = parseResult.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  const { collection: collectionName } = parseResult.data;

  // Get the collection
  const collectionResult = await getCollection(
    connection.host,
    connection.port,
    collectionName
  );

  if (!collectionResult.success || !collectionResult.data) {
    return NextResponse.json(
      { error: collectionResult.error || "Collection not found" },
      { status: 404 }
    );
  }

  const collection = collectionResult.data;

  try {
    // Sample first 100 records to analyze metadata
    const result = await collection.get({
      limit: 100,
      include: ["metadatas"],
    });

    // Analyze metadata fields
    const fieldMap = new Map<
      string,
      { types: Set<string>; sampleValues: Set<unknown> }
    >();

    for (const metadata of result.metadatas || []) {
      if (!metadata) continue;

      for (const [key, value] of Object.entries(metadata)) {
        if (!fieldMap.has(key)) {
          fieldMap.set(key, { types: new Set(), sampleValues: new Set() });
        }

        const field = fieldMap.get(key)!;
        field.types.add(detectType(value));

        // Keep up to 5 sample values per field
        if (field.sampleValues.size < 5) {
          field.sampleValues.add(value);
        }
      }
    }

    // Convert to response format
    const fields: MetadataField[] = Array.from(fieldMap.entries()).map(
      ([name, data]) => {
        // If multiple types exist, join them
        const typeArray = Array.from(data.types);
        const type = typeArray.length === 1 ? typeArray[0] : typeArray.join(" | ");

        return {
          name,
          type,
          sampleValues: Array.from(data.sampleValues),
        };
      }
    );

    // Sort fields alphabetically by name
    fields.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      fields,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to analyze metadata";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
