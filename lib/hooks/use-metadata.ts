"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection } from "./use-connection";
import type { MetadataField } from "@/types";

export interface UseMetadataOptions {
  collection: string;
}

export interface UseMetadataReturn {
  fields: MetadataField[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Custom hook for fetching metadata fields from a ChromaDB collection.
 * Auto-discovers field names, types, and sample values.
 *
 * @param options - Configuration options including collection name
 * @returns Object containing fields, loading state, error, and refresh function
 */
export function useMetadata({
  collection,
}: UseMetadataOptions): UseMetadataReturn {
  const { connection } = useConnection();
  const [fields, setFields] = useState<MetadataField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = useCallback(async () => {
    if (!collection || !connection) {
      setFields([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/metadata?collection=${encodeURIComponent(collection)}`,
        {
          headers: {
            "X-Chroma-Host": connection.host,
            "X-Chroma-Port": String(connection.port),
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch metadata");
      }

      const data = await response.json();
      setFields(data.fields || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setFields([]);
    } finally {
      setIsLoading(false);
    }
  }, [collection, connection]);

  // Fetch metadata when dependencies change
  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return {
    fields,
    isLoading,
    error,
    refresh: fetchMetadata,
  };
}
