"use client";

import { useState, useCallback } from "react";
import { useConnection } from "./use-connection";
import { useEmbedding } from "./use-embedding";
import type { ChromaRecord } from "@/types";

export type SearchType = "text" | "semantic";

export interface UseSearchOptions {
  collection: string;
  limit?: number;
}

export interface UseSearchReturn {
  results: ChromaRecord[];
  distances: number[];
  isSearching: boolean;
  error: string | null;
  searchQuery: string | null;
  searchType: SearchType | null;
  search: (query: string, type: SearchType) => Promise<void>;
  clearSearch: () => void;
  isSearchActive: boolean;
}

/**
 * Custom hook for searching documents in a ChromaDB collection.
 * Supports both text search (content-based) and semantic search (embedding-based).
 *
 * @param options - Configuration options including collection name and limit
 * @returns Object containing search results, state, and control functions
 */
export function useSearch({
  collection,
  limit = 20,
}: UseSearchOptions): UseSearchReturn {
  const { connection } = useConnection();
  const { embedding } = useEmbedding();
  const [results, setResults] = useState<ChromaRecord[]>([]);
  const [distances, setDistances] = useState<number[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<SearchType | null>(null);

  const search = useCallback(
    async (query: string, type: SearchType) => {
      if (!collection || !connection) {
        setError("No collection or connection available");
        return;
      }

      if (!query.trim()) {
        setError("Search query cannot be empty");
        return;
      }

      setIsSearching(true);
      setError(null);
      setSearchQuery(query);
      setSearchType(type);

      try {
        // Build headers
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "X-Chroma-Host": connection.host,
          "X-Chroma-Port": String(connection.port),
        };

        // Add embedding headers for semantic search
        if (type === "semantic" && embedding && embedding.provider !== "none") {
          headers["X-Embedding-Provider"] = embedding.provider;
          headers["X-Embedding-Api-Key"] = embedding.apiKey;
          if (embedding.model) {
            headers["X-Embedding-Model"] = embedding.model;
          }
        }

        const response = await fetch("/api/search", {
          method: "POST",
          headers,
          body: JSON.stringify({
            collection,
            query,
            type,
            limit,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Search failed");
        }

        const data = await response.json();
        setResults(data.results || []);
        setDistances(data.distances || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred during search";
        setError(errorMessage);
        setResults([]);
        setDistances([]);
      } finally {
        setIsSearching(false);
      }
    },
    [collection, connection, embedding, limit]
  );

  const clearSearch = useCallback(() => {
    setResults([]);
    setDistances([]);
    setSearchQuery(null);
    setSearchType(null);
    setError(null);
  }, []);

  return {
    results,
    distances,
    isSearching,
    error,
    searchQuery,
    searchType,
    search,
    clearSearch,
    isSearchActive: searchQuery !== null,
  };
}
