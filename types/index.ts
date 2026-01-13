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

/**
 * Filter operator types supported by Chroma
 */
export type FilterOperator = '$eq' | '$ne' | '$gt' | '$lt' | '$in';

/**
 * A filter for querying records by metadata
 */
export interface Filter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string | number | string[];
}

/**
 * Metadata field information from API
 */
export interface MetadataField {
  name: string;
  type: string;
  sampleValues: unknown[];
}

/**
 * Supported embedding providers
 */
export type EmbeddingProvider = "none" | "openai" | "gemini";

/**
 * Configuration for embedding provider
 */
export interface EmbeddingConfig {
  provider: EmbeddingProvider;
  apiKey: string;
  model?: string;
}
