import { NextResponse } from "next/server";
import type { Where, WhereDocument } from "chromadb";
import { getConnectionFromHeaders, getCollection } from "@/lib/chroma";
import { recordsQuerySchema, deleteRecordsBodySchema } from "@/lib/validations";
import type { ChromaRecord } from "@/types";

/**
 * GET /api/records
 *
 * Fetches paginated records from a ChromaDB collection.
 * Requires X-Chroma-Host and X-Chroma-Port headers for connection.
 *
 * Query params:
 * - collection (required): Name of the collection
 * - page (default: 1): Page number
 * - pageSize (default: 10): Number of records per page
 * - sortBy (optional): Field to sort by
 * - sortOrder (optional): "asc" or "desc"
 * - where (optional): JSON string for metadata filter
 * - whereDocument (optional): JSON string for document filter
 *
 * @returns JSON response with records, total count, page, and pageSize
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
    page: searchParams.get("page") || undefined,
    pageSize: searchParams.get("pageSize") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
    where: searchParams.get("where") || undefined,
    whereDocument: searchParams.get("whereDocument") || undefined,
  };

  const parseResult = recordsQuerySchema.safeParse(rawParams);

  if (!parseResult.success) {
    const errorMessage = parseResult.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  const { collection: collectionName, page, pageSize, where, whereDocument } =
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
    // Get total count for pagination info
    const total = await collection.count();

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Fetch records with pagination
    const result = await collection.get({
      offset,
      limit: pageSize,
      where: where as Where | undefined,
      whereDocument: whereDocument as WhereDocument | undefined,
      include: ["documents", "metadatas", "embeddings"],
    });

    // Transform results into ChromaRecord format
    const records: ChromaRecord[] = result.ids.map((id, index) => ({
      id,
      document: result.documents?.[index] ?? null,
      metadata: result.metadatas?.[index] ?? null,
      embedding: result.embeddings?.[index] ?? null,
    }));

    return NextResponse.json({
      records,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch records";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE /api/records
 *
 * Deletes records from a ChromaDB collection by their IDs.
 * Requires X-Chroma-Host and X-Chroma-Port headers for connection.
 *
 * Request body:
 * - collection (required): Name of the collection
 * - ids (required): Array of record IDs to delete
 *
 * @returns JSON response with deleted count or error
 */
export async function DELETE(request: Request) {
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

  const parseResult = deleteRecordsBodySchema.safeParse(body);

  if (!parseResult.success) {
    const errorMessage = parseResult.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  const { collection: collectionName, ids } = parseResult.data;

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
    // Delete records by IDs
    await collection.delete({ ids });

    return NextResponse.json({
      success: true,
      deletedCount: ids.length,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete records";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
