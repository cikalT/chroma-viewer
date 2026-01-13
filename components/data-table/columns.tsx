"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Search, Eye, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DocumentCell } from "@/components/record/document-cell";
import { MetadataBadges } from "@/components/record/metadata-badges";
import { CopyButton } from "@/components/ui/copy-button";
import type { ChromaRecord } from "@/types";

export interface ColumnsOptions {
  onFindSimilar?: (record: ChromaRecord) => void;
  onViewDetails?: (record: ChromaRecord) => void;
  showDistance?: boolean;
  distances?: number[];
}

/**
 * Creates column definitions for the ChromaRecord data table.
 * Accepts options to enable Find Similar functionality and show distance column.
 */
export function createColumns({
  onFindSimilar,
  onViewDetails,
  showDistance = false,
  distances = [],
}: ColumnsOptions = {}): ColumnDef<ChromaRecord>[] {
  const baseColumns: ColumnDef<ChromaRecord>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const id = row.getValue("id") as string;
        const displayId = id.length > 20 ? `${id.slice(0, 20)}...` : id;

        return (
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <button className="font-mono text-sm text-left hover:underline cursor-pointer">
                  {displayId}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto max-w-md">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm break-all flex-1">{id}</p>
                  <CopyButton value={id} label="ID copied" />
                </div>
              </PopoverContent>
            </Popover>
            <CopyButton
              value={id}
              label="ID copied"
              size="icon-sm"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        );
      },
    },
    {
      accessorKey: "document",
      header: "Document",
      cell: ({ row }) => {
        const document = row.getValue("document") as string | null;
        return (
          <div className="flex items-start gap-1">
            <DocumentCell document={document} />
            {document && (
              <CopyButton
                value={document}
                label="Document copied"
                size="icon-sm"
                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            )}
          </div>
        );
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
      const canFindSimilar = onFindSimilar !== undefined && hasDocument;

      return (
        <div className="flex items-center gap-1">
          {/* View Details button */}
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => onViewDetails(record)}
              title="View record details"
            >
              <Eye className="h-4 w-4" />
              Details
            </Button>
          )}

          {/* Find Similar button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5"
            disabled={!canFindSimilar}
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
            Similar
          </Button>
        </div>
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
