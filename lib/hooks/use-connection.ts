"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChromaConnection } from "@/types";

const STORAGE_KEY = "chroma-connection";

export interface UseConnectionReturn {
  connection: ChromaConnection | null;
  setConnection: (connection: ChromaConnection) => void;
  clearConnection: () => void;
  isConnected: boolean;
}

/**
 * Custom hook for managing ChromaDB connection state.
 * Persists connection information to localStorage.
 *
 * @returns Object containing connection state and management functions
 */
export function useConnection(): UseConnectionReturn {
  const [connection, setConnectionState] = useState<ChromaConnection | null>(
    null
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Load connection from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ChromaConnection;
        // Validate the parsed data has required fields
        if (
          typeof parsed.host === "string" &&
          typeof parsed.port === "number"
        ) {
          setConnectionState(parsed);
        }
      }
    } catch {
      // Invalid stored data, ignore
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsHydrated(true);
  }, []);

  const setConnection = useCallback((newConnection: ChromaConnection) => {
    setConnectionState(newConnection);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConnection));
  }, []);

  const clearConnection = useCallback(() => {
    setConnectionState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    connection,
    setConnection,
    clearConnection,
    // Only consider connected after hydration to avoid hydration mismatch
    isConnected: isHydrated && connection !== null,
  };
}
