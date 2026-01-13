"use client";

import { cn } from "@/lib/utils";

export type SearchMode = "text" | "semantic";

export interface SearchModeToggleProps {
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  disabled?: boolean;
}

/**
 * Toggle between text and semantic search modes.
 * Text search finds documents containing the query.
 * Semantic search finds similar documents by meaning.
 */
export function SearchModeToggle({
  mode,
  onModeChange,
  disabled = false,
}: SearchModeToggleProps) {
  return (
    <div className="flex rounded-md border bg-muted p-1">
      <button
        type="button"
        onClick={() => onModeChange("text")}
        disabled={disabled}
        className={cn(
          "rounded px-3 py-1.5 text-sm font-medium transition-colors",
          mode === "text"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
          disabled && "pointer-events-none opacity-50"
        )}
        title="Search in document content"
      >
        Text
      </button>
      <button
        type="button"
        onClick={() => onModeChange("semantic")}
        disabled={disabled}
        className={cn(
          "rounded px-3 py-1.5 text-sm font-medium transition-colors",
          mode === "semantic"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
          disabled && "pointer-events-none opacity-50"
        )}
        title="Find similar by meaning"
      >
        Semantic
      </button>
    </div>
  );
}
