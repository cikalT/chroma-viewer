// Chroma DB Viewer Types

/**
 * Connection configuration for ChromaDB
 */
export interface ChromaConnection {
  host: string;
  port: number;
}

/**
 * Information about a collection including its name and record count
 */
export interface CollectionInfo {
  name: string;
  count: number;
}

/**
 * A record from a ChromaDB collection
 */
export interface ChromaRecord {
  id: string;
  document: string | null;
  metadata: Record<string, unknown> | null;
  embedding: number[] | null;
}

/**
 * Result wrapper for Chroma operations
 */
export interface ChromaResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
