"use client";

import { useState } from "react";
import { Plus, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterChip } from "./filter-chip";
import { FilterEditor } from "./filter-editor";
import { AdvancedFilter } from "./advanced-filter";
import type { Filter, MetadataField } from "@/types";

export interface FilterBarProps {
  filters: Filter[];
  fields: MetadataField[];
  onAddFilter: (filter: Omit<Filter, "id">) => void;
  onRemoveFilter: (id: string) => void;
  onUpdateFilter: (id: string, updates: Partial<Omit<Filter, "id">>) => void;
  onClearFilters: () => void;
  onApplyAdvancedFilter: (where: Record<string, unknown> | null) => void;
  whereClause: Record<string, unknown> | null;
  disabled?: boolean;
}

/**
 * Container component for filters.
 * Displays active filter chips, "+ Add Filter" button, "Clear all" button,
 * and "Advanced" button for JSON editing.
 */
export function FilterBar({
  filters,
  fields,
  onAddFilter,
  onRemoveFilter,
  onUpdateFilter,
  onClearFilters,
  onApplyAdvancedFilter,
  whereClause,
  disabled = false,
}: FilterBarProps) {
  const [addFilterOpen, setAddFilterOpen] = useState(false);
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);

  const editingFilter = editingFilterId
    ? filters.find((f) => f.id === editingFilterId)
    : undefined;

  const handleAddFilter = (filter: Omit<Filter, "id">) => {
    onAddFilter(filter);
    setAddFilterOpen(false);
  };

  const handleUpdateFilter = (filter: Omit<Filter, "id">) => {
    if (editingFilterId) {
      onUpdateFilter(editingFilterId, filter);
      setEditingFilterId(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Active filter chips */}
      {filters.map((filter) => (
        <FilterEditor
          key={filter.id}
          fields={fields}
          initialFilter={filter}
          onApply={handleUpdateFilter}
          onCancel={() => setEditingFilterId(null)}
          open={editingFilterId === filter.id}
          onOpenChange={(open) => {
            if (open) {
              setEditingFilterId(filter.id);
            } else {
              setEditingFilterId(null);
            }
          }}
          trigger={
            <div>
              <FilterChip
                filter={filter}
                onRemove={() => onRemoveFilter(filter.id)}
                onClick={() => setEditingFilterId(filter.id)}
              />
            </div>
          }
        />
      ))}

      {/* Add Filter button */}
      <FilterEditor
        fields={fields}
        onApply={handleAddFilter}
        onCancel={() => setAddFilterOpen(false)}
        open={addFilterOpen}
        onOpenChange={setAddFilterOpen}
        trigger={
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || fields.length === 0}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Filter
          </Button>
        }
      />

      {/* Clear all button - only show when filters exist */}
      {filters.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Clear all
        </Button>
      )}

      {/* Advanced button */}
      <AdvancedFilter
        whereClause={whereClause}
        onApply={onApplyAdvancedFilter}
        trigger={
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Settings2 className="h-4 w-4" />
            Advanced
          </Button>
        }
      />
    </div>
  );
}
