"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MetadataBadgesProps {
  metadata: Record<string, unknown> | null;
  maxVisible?: number;
}

/**
 * Gets the appropriate badge class based on the value type.
 */
function getBadgeClass(value: unknown): string {
  if (typeof value === "string") {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800";
  }
  if (typeof value === "number") {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800";
  }
  if (typeof value === "boolean") {
    return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800";
  }
  // Default for other types (object, array, null, undefined)
  return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800";
}

/**
 * Formats a value for display in the badge.
 */
function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Displays metadata as color-coded badges.
 * Shows first N fields by default with a "+N more" button to expand.
 */
export function MetadataBadges({
  metadata,
  maxVisible = 3,
}: MetadataBadgesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <span className="text-muted-foreground italic text-sm">No metadata</span>
    );
  }

  const entries = Object.entries(metadata);
  const visibleEntries = isExpanded ? entries : entries.slice(0, maxVisible);
  const hiddenCount = entries.length - maxVisible;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visibleEntries.map(([key, value]) => (
        <Badge
          key={key}
          variant="outline"
          className={cn(
            "text-xs font-normal",
            getBadgeClass(value)
          )}
        >
          <span className="font-medium">{key}:</span>
          <span className="ml-1 max-w-[120px] truncate">
            {formatValue(value)}
          </span>
        </Badge>
      ))}
      {hiddenCount > 0 && !isExpanded && (
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-1.5 text-xs text-muted-foreground"
          onClick={() => setIsExpanded(true)}
        >
          +{hiddenCount} more
        </Button>
      )}
      {isExpanded && entries.length > maxVisible && (
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-1.5 text-xs text-muted-foreground"
          onClick={() => setIsExpanded(false)}
        >
          Show less
        </Button>
      )}
    </div>
  );
}
