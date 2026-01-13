"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DocumentCellProps {
  document: string | null;
  maxLength?: number;
}

/**
 * Displays document text with truncation and expand/collapse functionality.
 * Shows truncated text by default with a "Show more" button to expand.
 */
export function DocumentCell({
  document,
  maxLength = 200,
}: DocumentCellProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!document) {
    return (
      <span className="text-muted-foreground italic">No document</span>
    );
  }

  const needsTruncation = document.length > maxLength;
  const displayText = isExpanded || !needsTruncation
    ? document
    : document.slice(0, maxLength);

  // Check if content looks like code (contains common code patterns)
  const looksLikeCode =
    /[{}[\];]|function\s|const\s|let\s|var\s|import\s|export\s|class\s|def\s|return\s/.test(
      document
    );

  return (
    <div className="max-w-md">
      <p
        className={cn(
          "whitespace-pre-wrap break-words text-sm",
          looksLikeCode && "font-mono text-xs"
        )}
      >
        {displayText}
        {needsTruncation && !isExpanded && "..."}
      </p>
      {needsTruncation && (
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show less" : "Show more"}
        </Button>
      )}
    </div>
  );
}
