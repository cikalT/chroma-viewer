"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface AdvancedFilterProps {
  whereClause: Record<string, unknown> | null;
  onApply: (where: Record<string, unknown> | null) => void;
  trigger: React.ReactNode;
}

/**
 * Dialog component for editing raw JSON filters.
 * Provides a monospace textarea with JSON validation.
 */
export function AdvancedFilter({
  whereClause,
  onApply,
  trigger,
}: AdvancedFilterProps) {
  const [open, setOpen] = useState(false);
  const [jsonValue, setJsonValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Initialize JSON value when dialog opens
  useEffect(() => {
    if (open) {
      setJsonValue(
        whereClause ? JSON.stringify(whereClause, null, 2) : ""
      );
      setError(null);
    }
  }, [open, whereClause]);

  // Validate JSON on blur
  const handleBlur = () => {
    if (!jsonValue.trim()) {
      setError(null);
      return;
    }

    try {
      JSON.parse(jsonValue);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const handleApply = () => {
    if (!jsonValue.trim()) {
      onApply(null);
      setOpen(false);
      return;
    }

    try {
      const parsed = JSON.parse(jsonValue) as Record<string, unknown>;
      onApply(parsed);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const handleClear = () => {
    setJsonValue("");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Advanced Filter</DialogTitle>
          <DialogDescription>
            Edit the raw Chroma where clause as JSON. Leave empty to clear
            filters.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* JSON textarea */}
          <textarea
            value={jsonValue}
            onChange={(e) => setJsonValue(e.target.value)}
            onBlur={handleBlur}
            className="min-h-[200px] w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
            placeholder={`{\n  "field_name": { "$eq": "value" }\n}`}
            spellCheck={false}
          />

          {/* Validation error */}
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Help text */}
          <div className="text-xs text-muted-foreground">
            <p className="font-medium">Supported operators:</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>
                <code className="rounded bg-muted px-1">$eq</code> - equals
              </li>
              <li>
                <code className="rounded bg-muted px-1">$ne</code> - not equals
              </li>
              <li>
                <code className="rounded bg-muted px-1">$gt</code> - greater
                than
              </li>
              <li>
                <code className="rounded bg-muted px-1">$lt</code> - less than
              </li>
              <li>
                <code className="rounded bg-muted px-1">$in</code> - in array
              </li>
              <li>
                <code className="rounded bg-muted px-1">$and</code> - combine
                multiple filters
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleApply} disabled={!!error}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
