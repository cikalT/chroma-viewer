"use client";

import { useState, FormEvent, useEffect } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmbedding } from "@/lib/hooks/use-embedding";
import type { EmbeddingProvider } from "@/types";

const OPENAI_MODELS = [
  { value: "text-embedding-ada-002", label: "Ada 002 (Legacy)" },
  { value: "text-embedding-3-small", label: "Embedding 3 Small" },
  { value: "text-embedding-3-large", label: "Embedding 3 Large" },
];

const GEMINI_MODELS = [
  { value: "text-embedding-004", label: "Text Embedding 004" },
];

interface EmbeddingFormProps {
  /** Callback when configuration is saved */
  onSuccess?: () => void;
}

/**
 * Form component for configuring embedding providers.
 * Supports OpenAI and Google Gemini embedding APIs.
 */
export function EmbeddingForm({ onSuccess }: EmbeddingFormProps) {
  const { embedding, setEmbedding } = useEmbedding();

  const [provider, setProvider] = useState<EmbeddingProvider>(
    embedding?.provider ?? "none"
  );
  const [apiKey, setApiKey] = useState(embedding?.apiKey ?? "");
  const [model, setModel] = useState(embedding?.model ?? "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update form when embedding config changes
  useEffect(() => {
    if (embedding) {
      setProvider(embedding.provider);
      setApiKey(embedding.apiKey);
      setModel(embedding.model ?? "");
    }
  }, [embedding]);

  // Set default model when provider changes
  useEffect(() => {
    if (provider === "openai" && !model) {
      setModel("text-embedding-ada-002");
    } else if (provider === "gemini" && !model) {
      setModel("text-embedding-004");
    } else if (provider === "none") {
      setModel("");
    }
  }, [provider, model]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (provider === "none") {
        setEmbedding({ provider: "none", apiKey: "", model: undefined });
        toast.success("Embedding configuration cleared");
      } else {
        if (!apiKey.trim()) {
          throw new Error("API key is required");
        }

        setEmbedding({
          provider,
          apiKey: apiKey.trim(),
          model: model || undefined,
        });

        const providerName = provider === "openai" ? "OpenAI" : "Google Gemini";
        toast.success(`${providerName} embedding configured`);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save configuration";
      toast.error("Configuration failed", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const models = provider === "openai" ? OPENAI_MODELS : GEMINI_MODELS;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Embedding Configuration</CardTitle>
        <CardDescription>
          Configure an embedding provider for semantic search. API keys are
          stored locally in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="provider"
              className="text-sm font-medium leading-none"
            >
              Provider
            </label>
            <Select
              value={provider}
              onValueChange={(value) => setProvider(value as EmbeddingProvider)}
              disabled={isLoading}
            >
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Disabled)</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {provider !== "none" && (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="apiKey"
                  className="text-sm font-medium leading-none"
                >
                  API Key
                </label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    placeholder={
                      provider === "openai"
                        ? "sk-..."
                        : "AIza..."
                    }
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                    tabIndex={-1}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="model"
                  className="text-sm font-medium leading-none"
                >
                  Model
                </label>
                <Select
                  value={model}
                  onValueChange={setModel}
                  disabled={isLoading}
                >
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Configuration"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
