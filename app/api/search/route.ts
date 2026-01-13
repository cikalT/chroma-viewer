import { NextResponse } from "next/server";
import type { Where } from "chromadb";
import { getConnectionFromHeaders, getCollection } from "@/lib/chroma";
import { searchBodySchema } from "@/lib/validations";
import type { ChromaRecord } from "@/types";

/**
 * POST /api/search
 *
 * Performs text or semantic search on a ChromaDB collection.
 * Requires X-Chroma-Host and X-Chroma-Port headers for connection.
 *
 * Request body:
 * - collection (required): Name of the collection
 * - query (required): Search query text
 * - type (required): "text" or "semantic"
 * - limit (default: 10): Maximum number of results
 * - where (optional): Metadata filter object
 *
 * @returns JSON response with results and distances (for semantic search)
 */
export async function POST(request: Request) {
  // Get connection info from headers
  const connection = getConnectionFromHeaders(request.headers);

  if (!connection) {
    return NextResponse.json(
      { error: "Missing or invalid X-Chroma-Host and/or X-Chroma-Port headers" },
      { status: 400 }
    );
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const parseResult = searchBodySchema.safeParse(body);

  if (!parseResult.success) {
    const errorMessage = parseResult.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  const { collection: collectionName, query, type, limit, where } =
    parseResult.data;

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
    if (type === "text") {
      // Text search using document content filter
      const result = await collection.get({
        where: where as Where | undefined,
        whereDocument: { $contains: query },
        limit,
        include: ["documents", "metadatas", "embeddings"],
      });

      // Transform results into ChromaRecord format
      const results: ChromaRecord[] = result.ids.map((id, index) => ({
        id,
        document: result.documents?.[index] ?? null,
        metadata: result.metadatas?.[index] ?? null,
        embedding: result.embeddings?.[index] ?? null,
      }));

      return NextResponse.json({
        results,
        distances: [], // Text search doesn't return distances
      });
    } else {
      // Semantic search using query embeddings
      const result = await collection.query({
        queryTexts: [query],
        nResults: limit,
        where: where as Where | undefined,
        include: ["documents", "metadatas", "distances"],
      });

      // Query returns nested arrays (one per query text), flatten them
      const ids = result.ids[0] || [];
      const documents = result.documents?.[0] || [];
      const metadatas = result.metadatas?.[0] || [];
      const distances = result.distances?.[0] || [];

      // Transform results into ChromaRecord format
      const results: ChromaRecord[] = ids.map((id, index) => ({
        id,
        document: documents[index] ?? null,
        metadata: metadatas[index] ?? null,
        embedding: null, // Query doesn't return embeddings by default
      }));

      return NextResponse.json({
        results,
        distances,
      });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
