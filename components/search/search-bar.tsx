"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SearchModeToggle,
  type SearchMode,
} from "@/components/search/search-mode-toggle";

export interface SearchBarProps {
  onSearch: (query: string, mode: SearchMode) => void;
  onClear: () => void;
  isSearching?: boolean;
  initialQuery?: string;
  initialMode?: SearchMode;
  disabled?: boolean;
}

/**
 * Search bar with text input, mode toggle, and search/clear buttons.
 * Supports Enter key to search.
 */
export function SearchBar({
  onSearch,
  onClear,
  isSearching = false,
  initialQuery = "",
  initialMode = "text",
  disabled = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<SearchMode>(initialMode);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      onSearch(query.trim(), mode);
    }
  }, [query, mode, onSearch]);

  const handleClear = useCallback(() => {
    setQuery("");
    onClear();
  }, [onClear]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const isDisabled = disabled || isSearching;

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          className="pl-10 pr-10"
        />
        {query && !isSearching && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isDisabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      <SearchModeToggle
        mode={mode}
        onModeChange={setMode}
        disabled={isDisabled}
      />

      <Button
        onClick={handleSearch}
        disabled={isDisabled || !query.trim()}
        className="gap-2"
      >
        {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        Search
      </Button>
    </div>
  );
}
