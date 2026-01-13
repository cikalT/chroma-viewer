import { NextResponse } from "next/server";
import { getConnectionFromHeaders, listCollections } from "@/lib/chroma";

/**
 * GET /api/collections
 *
 * Lists all collections in the ChromaDB instance with their record counts.
 * Requires X-Chroma-Host and X-Chroma-Port headers for connection.
 *
 * @returns JSON response with collections array or error
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

  // Fetch collections from ChromaDB
  const result = await listCollections(connection.host, connection.port);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Failed to fetch collections" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    collections: result.data,
  });
}
