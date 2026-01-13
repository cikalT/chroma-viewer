"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection } from "./use-connection";
import type { ChromaRecord } from "@/types";

export interface UseRecordsOptions {
  collection: string;
  initialPage?: number;
  initialPageSize?: number;
}

export interface UseRecordsReturn {
  records: ChromaRecord[];
  total: number;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching paginated records from a ChromaDB collection.
 *
 * @param options - Configuration options including collection name and pagination
 * @returns Object containing records, pagination state, and control functions
 */
export function useRecords({
  collection,
  initialPage = 1,
  initialPageSize = 10,
}: UseRecordsOptions): UseRecordsReturn {
  const { connection } = useConnection();
  const [records, setRecords] = useState<ChromaRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!collection || !connection) {
      setRecords([]);
      setTotal(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/records?collection=${encodeURIComponent(collection)}&page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            "X-Chroma-Host": connection.host,
            "X-Chroma-Port": String(connection.port),
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch records");
      }

      const data = await response.json();
      setRecords(data.records);
      setTotal(data.total);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setRecords([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [collection, connection, page, pageSize]);

  // Fetch records when dependencies change
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Reset to page 1 when collection or pageSize changes
  useEffect(() => {
    setPage(1);
  }, [collection, pageSize]);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSetPageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
  }, []);

  return {
    records,
    total,
    page,
    pageSize,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    isLoading,
    error,
    refetch: fetchRecords,
  };
}
