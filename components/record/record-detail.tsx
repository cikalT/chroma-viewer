"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ChromaRecord } from "@/types";

interface RecordDetailProps {
  /** The record to display */
  record: ChromaRecord | null;
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when the dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Callback when delete is requested */
  onDelete?: (record: ChromaRecord) => void;
}

/**
 * Dialog component showing full record details.
 * Displays document text, metadata table, and collapsible embedding.
 */
export function RecordDetail({
  record,
  open,
  onOpenChange,
  onDelete,
}: RecordDetailProps) {
  const [embeddingExpanded, setEmbeddingExpanded] = useState(false);

  if (!record) return null;

  const metadataEntries = record.metadata
    ? Object.entries(record.metadata)
    : [];

  const embeddingPreviewCount = 50;
  const hasMoreEmbedding =
    record.embedding && record.embedding.length > embeddingPreviewCount;
  const embeddingToShow = embeddingExpanded
    ? record.embedding
    : record.embedding?.slice(0, embeddingPreviewCount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none w-[98vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <span>Record Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-4 min-h-0">
          <div className="space-y-6">
            {/* ID Section */}
            <Section
              title="ID"
              copyValue={record.id}
              copyLabel="ID copied to clipboard"
            >
              <code className="block font-mono text-sm break-all bg-muted p-3 rounded-md">
                {record.id}
              </code>
            </Section>

            <Separator />

            {/* Document Section */}
            <Section
              title="Document"
              copyValue={record.document || ""}
              copyLabel="Document copied to clipboard"
              showCopy={!!record.document}
            >
              {record.document ? (
                <div className="bg-muted p-3 rounded-md">
                  <p className="whitespace-pre-wrap text-sm break-words">
                    {record.document}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No document content
                </p>
              )}
            </Section>

            <Separator />

            {/* Metadata Section */}
            <Section
              title="Metadata"
              copyValue={JSON.stringify(record.metadata, null, 2)}
              copyLabel="Metadata copied to clipboard"
              showCopy={metadataEntries.length > 0}
            >
              {metadataEntries.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-3 py-2 text-left font-medium">Key</th>
                        <th className="px-3 py-2 text-left font-medium">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {metadataEntries.map(([key, value], index) => (
                        <tr
                          key={key}
                          className={cn(
                            "border-b last:border-b-0",
                            index % 2 === 0 ? "bg-background" : "bg-muted/20"
                          )}
                        >
                          <td className="px-3 py-2 font-mono text-xs">
                            {key}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs break-all">
                            {formatMetadataValue(value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No metadata
                </p>
              )}
            </Section>

            <Separator />

            {/* Embedding Section */}
            <Section
              title="Embedding"
              copyValue={JSON.stringify(record.embedding)}
              copyLabel="Embedding copied to clipboard"
              showCopy={!!record.embedding && record.embedding.length > 0}
            >
              {record.embedding && record.embedding.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {record.embedding.length} dimensions
                    </span>
                    {hasMoreEmbedding && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEmbeddingExpanded(!embeddingExpanded)}
                        className="gap-1 h-7"
                      >
                        {embeddingExpanded ? (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            Collapse
                          </>
                        ) : (
                          <>
                            <ChevronRight className="h-3 w-3" />
                            Show all
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-xs font-mono break-all">
                      [{embeddingToShow?.join(", ")}
                      {hasMoreEmbedding && !embeddingExpanded && (
                        <span className="text-muted-foreground">
                          {" "}
                          ... {record.embedding.length - embeddingPreviewCount}{" "}
                          more
                        </span>
                      )}
                      ]
                    </code>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No embedding data
                </p>
              )}
            </Section>
          </div>
        </div>

        {onDelete && (
          <DialogFooter className="flex-shrink-0 border-t pt-4">
            <Button
              variant="destructive"
              onClick={() => onDelete(record)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Record
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Section wrapper with title and optional copy button.
 */
function Section({
  title,
  children,
  copyValue,
  copyLabel,
  showCopy = true,
}: {
  title: string;
  children: React.ReactNode;
  copyValue: string;
  copyLabel: string;
  showCopy?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {showCopy && copyValue && (
          <CopyButton value={copyValue} label={copyLabel} size="icon-sm" />
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Formats a metadata value for display.
 */
function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
