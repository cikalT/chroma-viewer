"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Filter, FilterOperator } from "@/types";

/**
 * Maps operator symbols to display names
 */
const OPERATOR_DISPLAY: Record<FilterOperator, string> = {
  $eq: "=",
  $ne: "\u2260", // Unicode not equal sign
  $gt: ">",
  $lt: "<",
  $in: "in",
};

/**
 * Color variants based on field type (detected from value type)
 */
function getVariantFromValue(
  value: string | number | string[]
): "default" | "secondary" | "outline" {
  if (Array.isArray(value)) {
    return "outline";
  }
  if (typeof value === "number") {
    return "secondary";
  }
  return "default";
}

/**
 * Formats the value for display
 */
function formatValue(value: string | number | string[]): string {
  if (Array.isArray(value)) {
    return `[${value.join(", ")}]`;
  }
  return String(value);
}

export interface FilterChipProps {
  filter: Filter;
  onRemove: () => void;
  onClick?: () => void;
}

/**
 * Individual filter display component.
 * Shows: "field operator value" (e.g., "type = text")
 * With X button to remove and click to edit support.
 */
export function FilterChip({ filter, onRemove, onClick }: FilterChipProps) {
  const operatorDisplay = OPERATOR_DISPLAY[filter.operator];
  const valueDisplay = formatValue(filter.value);
  const variant = getVariantFromValue(filter.value);

  return (
    <Badge
      variant={variant}
      className="cursor-pointer gap-1.5 pr-1 hover:opacity-80"
      onClick={onClick}
    >
      <span className="font-medium">{filter.field}</span>
      <span className="opacity-70">{operatorDisplay}</span>
      <span className="max-w-[100px] truncate">{valueDisplay}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
        aria-label={`Remove ${filter.field} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
