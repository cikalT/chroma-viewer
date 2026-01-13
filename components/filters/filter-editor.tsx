"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Filter, FilterOperator, MetadataField } from "@/types";

/**
 * Operator options with display labels
 */
const OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: "$eq", label: "= (equals)" },
  { value: "$ne", label: "\u2260 (not equals)" },
  { value: "$gt", label: "> (greater than)" },
  { value: "$lt", label: "< (less than)" },
  { value: "$in", label: "in (contains)" },
];

export interface FilterEditorProps {
  fields: MetadataField[];
  initialFilter?: Filter;
  onApply: (filter: Omit<Filter, "id">) => void;
  onCancel: () => void;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Parses the value string based on operator type.
 * For $in operator, splits comma-separated values into an array.
 */
function parseValue(
  value: string,
  operator: FilterOperator
): string | number | string[] {
  const trimmed = value.trim();

  // Handle $in operator - split by comma
  if (operator === "$in") {
    return trimmed.split(",").map((v) => v.trim());
  }

  // Try to parse as number
  const num = Number(trimmed);
  if (!isNaN(num) && trimmed !== "") {
    return num;
  }

  return trimmed;
}

/**
 * Converts filter value back to string for the input
 */
function valueToString(value: string | number | string[] | undefined): string {
  if (value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

/**
 * Popover component for creating/editing filters.
 * Provides field selector, operator selector, and value input.
 */
export function FilterEditor({
  fields,
  initialFilter,
  onApply,
  onCancel,
  trigger,
  open,
  onOpenChange,
}: FilterEditorProps) {
  const [field, setField] = useState(initialFilter?.field || "");
  const [operator, setOperator] = useState<FilterOperator>(
    initialFilter?.operator || "$eq"
  );
  const [value, setValue] = useState(valueToString(initialFilter?.value));

  // Reset form when filter changes or popover opens
  useEffect(() => {
    if (open) {
      setField(initialFilter?.field || "");
      setOperator(initialFilter?.operator || "$eq");
      setValue(valueToString(initialFilter?.value));
    }
  }, [open, initialFilter]);

  const handleApply = () => {
    if (!field || !value.trim()) return;

    onApply({
      field,
      operator,
      value: parseValue(value, operator),
    });
  };

  const isValid = field && value.trim();

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              {initialFilter ? "Edit Filter" : "Add Filter"}
            </h4>
            <p className="text-sm text-muted-foreground">
              Filter records by metadata field
            </p>
          </div>

          <div className="grid gap-3">
            {/* Field selector */}
            <div className="grid gap-1.5">
              <label htmlFor="filter-field" className="text-sm font-medium">
                Field
              </label>
              <Select value={field} onValueChange={setField}>
                <SelectTrigger id="filter-field">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((f) => (
                    <SelectItem key={f.name} value={f.name}>
                      <span>{f.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({f.type})
                      </span>
                    </SelectItem>
                  ))}
                  {fields.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No fields available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Operator selector */}
            <div className="grid gap-1.5">
              <label htmlFor="filter-operator" className="text-sm font-medium">
                Operator
              </label>
              <Select
                value={operator}
                onValueChange={(v) => setOperator(v as FilterOperator)}
              >
                <SelectTrigger id="filter-operator">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Value input */}
            <div className="grid gap-1.5">
              <label htmlFor="filter-value" className="text-sm font-medium">
                Value
                {operator === "$in" && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    (comma-separated)
                  </span>
                )}
              </label>
              <Input
                id="filter-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={
                  operator === "$in" ? "value1, value2, value3" : "Enter value"
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isValid) {
                    handleApply();
                  }
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleApply} disabled={!isValid}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
