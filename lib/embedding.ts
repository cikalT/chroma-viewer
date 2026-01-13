import type { EmbeddingFunction } from "chromadb";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { EmbeddingConfig, EmbeddingProvider } from "@/types";

export interface EmbeddingFunctionResult {
  success: boolean;
  embeddingFunction?: EmbeddingFunction;
  error?: string;
}

/**
 * Custom OpenAI embedding function implementing Chroma's EmbeddingFunction interface.
 */
class OpenAIEmbeddingFunction implements EmbeddingFunction {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "text-embedding-ada-002") {
    this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    this.model = model;
  }

  async generate(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: texts,
    });
    return response.data.map((item) => item.embedding);
  }
}

/**
 * Custom Google Gemini embedding function implementing Chroma's EmbeddingFunction interface.
 */
class GeminiEmbeddingFunction implements EmbeddingFunction {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = "text-embedding-004") {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generate(texts: string[]): Promise<number[][]> {
    const embeddingModel = this.client.getGenerativeModel({ model: this.model });
    const embeddings: number[][] = [];

    for (const text of texts) {
      const result = await embeddingModel.embedContent(text);
      embeddings.push(result.embedding.values);
    }

    return embeddings;
  }
}

/**
 * Creates an embedding function based on provider configuration.
 * Returns undefined for "none" provider (uses collection's default).
 *
 * @param provider - The embedding provider to use
 * @param apiKey - The API key for the provider
 * @param model - Optional model name override
 * @returns Result object containing the embedding function or error
 */
export function createEmbeddingFunction(
  provider: EmbeddingProvider,
  apiKey: string,
  model?: string
): EmbeddingFunctionResult {
  if (provider === "none" || !apiKey) {
    return { success: true, embeddingFunction: undefined };
  }

  try {
    if (provider === "openai") {
      const embeddingFunction = new OpenAIEmbeddingFunction(
        apiKey,
        model || "text-embedding-ada-002"
      );
      return { success: true, embeddingFunction };
    }

    if (provider === "gemini") {
      const embeddingFunction = new GeminiEmbeddingFunction(
        apiKey,
        model || "text-embedding-004"
      );
      return { success: true, embeddingFunction };
    }

    return { success: false, error: `Unknown provider: ${provider}` };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create embedding function",
    };
  }
}

/**
 * Helper to extract embedding config from request headers.
 *
 * @param headers - The request headers object
 * @returns Embedding config or null if headers are missing/invalid
 */
export function getEmbeddingFromHeaders(headers: Headers): EmbeddingConfig | null {
  const provider = headers.get("X-Embedding-Provider") as EmbeddingProvider | null;
  const apiKey = headers.get("X-Embedding-Api-Key");
  const model = headers.get("X-Embedding-Model");

  if (!provider || provider === "none") {
    return null;
  }

  if (!apiKey) {
    return null;
  }

  return {
    provider,
    apiKey,
    model: model || undefined,
  };
}
