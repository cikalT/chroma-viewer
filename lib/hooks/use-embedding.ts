"use client";

import { useState, useEffect, useCallback } from "react";
import type { EmbeddingConfig } from "@/types";

const STORAGE_KEY = "chroma-embedding";

export interface UseEmbeddingReturn {
  embedding: EmbeddingConfig | null;
  setEmbedding: (config: EmbeddingConfig) => void;
  clearEmbedding: () => void;
  isConfigured: boolean;
}

/**
 * Custom hook for managing embedding provider configuration.
 * Persists embedding configuration to localStorage.
 *
 * @returns Object containing embedding state and management functions
 */
export function useEmbedding(): UseEmbeddingReturn {
  const [embedding, setEmbeddingState] = useState<EmbeddingConfig | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load embedding config from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as EmbeddingConfig;
        // Validate the parsed data has required fields
        if (
          typeof parsed.provider === "string" &&
          typeof parsed.apiKey === "string" &&
          ["none", "openai", "gemini"].includes(parsed.provider)
        ) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setEmbeddingState(parsed);
        }
      }
    } catch {
      // Invalid stored data, ignore
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsHydrated(true);
  }, []);

  const setEmbedding = useCallback((config: EmbeddingConfig) => {
    setEmbeddingState(config);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, []);

  const clearEmbedding = useCallback(() => {
    setEmbeddingState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Only consider configured after hydration and when provider is not "none" with a valid apiKey
  const isConfigured =
    isHydrated &&
    embedding !== null &&
    embedding.provider !== "none" &&
    embedding.apiKey.length > 0;

  return {
    embedding,
    setEmbedding,
    clearEmbedding,
    isConfigured,
  };
}
