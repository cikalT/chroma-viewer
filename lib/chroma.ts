import { ChromaClient, type Collection, type EmbeddingFunction } from "chromadb";
import type {
  ChromaConnection,
  CollectionInfo,
  ChromaResult,
} from "@/types";

/**
 * Creates a ChromaDB client instance for the given host and port.
 * Does not store any state - creates a fresh client each time.
 *
 * @param host - The hostname of the ChromaDB server
 * @param port - The port number of the ChromaDB server
 * @returns A new ChromaClient instance
 */
export function getChromaClient(host: string, port: number): ChromaClient {
  return new ChromaClient({
    host,
    port,
    ssl: false,
  });
}

/**
 * Lists all collections in the ChromaDB instance with their record counts.
 *
 * @param host - The hostname of the ChromaDB server
 * @param port - The port number of the ChromaDB server
 * @returns A result object containing an array of collection info or an error
 */
export async function listCollections(
  host: string,
  port: number
): Promise<ChromaResult<CollectionInfo[]>> {
  try {
    const client = getChromaClient(host, port);
    const collections = await client.listCollections();

    // Get counts for each collection
    const collectionsWithCounts: CollectionInfo[] = await Promise.all(
      collections.map(async (collection) => {
        const count = await collection.count();
        return {
          name: collection.name,
          count,
        };
      })
    );

    return {
      success: true,
      data: collectionsWithCounts,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Gets a specific collection by name.
 *
 * @param host - The hostname of the ChromaDB server
 * @param port - The port number of the ChromaDB server
 * @param name - The name of the collection to retrieve
 * @param embeddingFunction - Optional embedding function for query operations
 * @returns A result object containing the collection or an error
 */
export async function getCollection(
  host: string,
  port: number,
  name: string,
  embeddingFunction?: EmbeddingFunction
): Promise<ChromaResult<Collection>> {
  try {
    const client = getChromaClient(host, port);
    const collection = await client.getCollection({ name, embeddingFunction });

    return {
      success: true,
      data: collection,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Tests if a connection to the ChromaDB server is valid.
 *
 * @param host - The hostname of the ChromaDB server
 * @param port - The port number of the ChromaDB server
 * @returns true if the connection is successful, false otherwise
 */
export async function testConnection(
  host: string,
  port: number
): Promise<boolean> {
  try {
    const client = getChromaClient(host, port);
    await client.heartbeat();
    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts a meaningful error message from an unknown error type.
 *
 * @param error - The error to extract a message from
 * @returns A string error message
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred";
}

/**
 * Helper to extract connection info from request headers.
 * Used by API routes to get ChromaDB connection details.
 *
 * @param headers - The request headers object
 * @returns Connection info or null if headers are missing/invalid
 */
export function getConnectionFromHeaders(
  headers: Headers
): ChromaConnection | null {
  const host = headers.get("X-Chroma-Host");
  const portStr = headers.get("X-Chroma-Port");

  if (!host || !portStr) {
    return null;
  }

  const port = parseInt(portStr, 10);
  if (isNaN(port)) {
    return null;
  }

  return { host, port };
}
