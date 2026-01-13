"use client";

import { useCallback } from "react";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ChromaRecord } from "@/types";

interface ExportButtonProps {
  /** Records to export */
  data: ChromaRecord[];
  /** Collection name for the filename */
  collectionName?: string;
  /** Whether button is disabled */
  disabled?: boolean;
}

/**
 * Dropdown button for exporting data as JSON or CSV.
 * Respects current filters/search by exporting only the provided data.
 */
export function ExportButton({
  data,
  collectionName = "records",
  disabled = false,
}: ExportButtonProps) {
  const downloadFile = useCallback(
    (content: string, filename: string, mimeType: string) => {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    []
  );

  const handleExportJSON = useCallback(() => {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const filename = `${collectionName}-${getTimestamp()}.json`;
      downloadFile(jsonContent, filename, "application/json");
      toast.success(`Exported ${data.length} records as JSON`);
    } catch {
      toast.error("Failed to export as JSON");
    }
  }, [data, collectionName, downloadFile]);

  const handleExportCSV = useCallback(() => {
    try {
      const csvContent = convertToCSV(data);
      const filename = `${collectionName}-${getTimestamp()}.csv`;
      downloadFile(csvContent, filename, "text/csv");
      toast.success(`Exported ${data.length} records as CSV`);
    } catch {
      toast.error("Failed to export as CSV");
    }
  }, [data, collectionName, downloadFile]);

  const isDisabled = disabled || data.length === 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isDisabled}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson className="h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Generates a timestamp string for filenames.
 */
function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace(/[T:]/g, "-");
}

/**
 * Converts records to CSV format.
 * Handles nested metadata by flattening to JSON strings.
 */
function convertToCSV(data: ChromaRecord[]): string {
  if (data.length === 0) return "";

  // Get all unique metadata keys across all records
  const metadataKeys = new Set<string>();
  data.forEach((record) => {
    if (record.metadata) {
      Object.keys(record.metadata).forEach((key) => metadataKeys.add(key));
    }
  });

  // Build headers
  const headers = ["id", "document", ...Array.from(metadataKeys), "embedding"];

  // Build rows
  const rows = data.map((record) => {
    const row: string[] = [];

    // ID
    row.push(escapeCSV(record.id));

    // Document
    row.push(escapeCSV(record.document || ""));

    // Metadata fields
    metadataKeys.forEach((key) => {
      const value = record.metadata?.[key];
      row.push(escapeCSV(formatCSVValue(value)));
    });

    // Embedding (as JSON array string, truncated for readability)
    if (record.embedding && record.embedding.length > 0) {
      // Include first 10 values for CSV readability
      const preview = record.embedding.slice(0, 10);
      const suffix =
        record.embedding.length > 10
          ? `... (${record.embedding.length} total)`
          : "";
      row.push(escapeCSV(`[${preview.join(", ")}${suffix}]`));
    } else {
      row.push("");
    }

    return row.join(",");
  });

  return [headers.map(escapeCSV).join(","), ...rows].join("\n");
}

/**
 * Escapes a value for CSV format.
 */
function escapeCSV(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Formats a value for CSV output.
 */
function formatCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
