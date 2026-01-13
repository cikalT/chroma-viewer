"use client";

import { useState, useEffect } from "react";
import { Database } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useConnection } from "@/lib/hooks/use-connection";
import type { CollectionInfo } from "@/types";

interface CollectionSelectorProps {
  /** Currently selected collection name */
  value?: string;
  /** Callback when selection changes */
  onSelect: (collectionName: string) => void;
  /** Placeholder text when no collection is selected */
  placeholder?: string;
}

/**
 * Dropdown component for selecting a ChromaDB collection.
 * Fetches collections from the API and displays them with record counts.
 */
export function CollectionSelector({
  value,
  onSelect,
  placeholder = "Select a collection",
}: CollectionSelectorProps) {
  const { connection, isConnected } = useConnection();
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch collections when connected
  useEffect(() => {
    if (!isConnected || !connection) {
      setCollections([]);
      return;
    }

    const fetchCollections = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/collections", {
          headers: {
            "X-Chroma-Host": connection.host,
            "X-Chroma-Port": String(connection.port),
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch collections");
        }

        const data = await response.json();
        setCollections(data.collections || []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch collections";
        setError(message);
        setCollections([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, [connection, isConnected]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-[200px]" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-sm text-destructive">
        Error loading collections: {error}
      </div>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="text-sm text-muted-foreground">
        Connect to ChromaDB to view collections
      </div>
    );
  }

  // Empty state
  if (collections.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Database className="h-4 w-4" />
        No collections found
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] overflow-y-auto">
        {collections.map((collection) => (
          <SelectItem key={collection.name} value={collection.name}>
            <div className="flex items-center justify-between gap-3">
              <span>{collection.name}</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                {collection.count.toLocaleString()} records
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
