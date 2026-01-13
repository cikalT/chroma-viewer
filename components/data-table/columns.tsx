"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DocumentCell } from "@/components/record/document-cell";
import { MetadataBadges } from "@/components/record/metadata-badges";
import type { ChromaRecord } from "@/types";

export interface ColumnsOptions {
  onFindSimilar?: (record: ChromaRecord) => void;
  showDistance?: boolean;
  distances?: number[];
}

/**
 * Creates column definitions for the ChromaRecord data table.
 * Accepts options to enable Find Similar functionality and show distance column.
 */
export function createColumns({
  onFindSimilar,
  showDistance = false,
  distances = [],
}: ColumnsOptions = {}): ColumnDef<ChromaRecord>[] {
  const baseColumns: ColumnDef<ChromaRecord>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        const id = row.getValue("id") as string;
        const displayId = id.length > 20 ? `${id.slice(0, 20)}...` : id;

        return (
          <Popover>
            <PopoverTrigger asChild>
              <button className="font-mono text-sm text-left hover:underline cursor-pointer">
                {displayId}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto max-w-md">
              <p className="font-mono text-sm break-all">{id}</p>
            </PopoverContent>
          </Popover>
        );
      },
    },
    {
      accessorKey: "document",
      header: "Document",
      cell: ({ row }) => {
        const document = row.getValue("document") as string | null;
        return <DocumentCell document={document} />;
      },
    },
    {
      accessorKey: "metadata",
      header: "Metadata",
      cell: ({ row }) => {
        const metadata = row.getValue("metadata") as Record<string, unknown> | null;
        return <MetadataBadges metadata={metadata} />;
      },
    },
  ];

  // Add distance column if showing search results
  if (showDistance) {
    baseColumns.push({
      id: "distance",
      header: "Distance",
      cell: ({ row }) => {
        const distance = distances[row.index];
        if (distance === undefined) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <span className="font-mono text-sm" title={`Distance: ${distance}`}>
            {distance.toFixed(4)}
          </span>
        );
      },
    });
  }

  // Add actions column
  baseColumns.push({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const record = row.original;
      const hasDocument = record.document !== null && record.document !== "";
      const isEnabled = onFindSimilar !== undefined && hasDocument;

      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          disabled={!isEnabled}
          onClick={() => {
            if (onFindSimilar && record.document) {
              onFindSimilar(record);
            }
          }}
          title={
            !hasDocument
              ? "No document to search"
              : !onFindSimilar
              ? "Search not available"
              : "Find similar documents"
          }
        >
          <Search className="h-4 w-4" />
          Find Similar
        </Button>
      );
    },
  });

  return baseColumns;
}

/**
 * Default columns without any callbacks (for backwards compatibility).
 * Use createColumns() to get columns with Find Similar enabled.
 */
export const columns = createColumns();
