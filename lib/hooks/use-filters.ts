"use client";

import { useState, useCallback, useMemo } from "react";
import type { Filter, FilterOperator } from "@/types";

export interface UseFiltersReturn {
  filters: Filter[];
  addFilter: (filter: Omit<Filter, "id">) => void;
  removeFilter: (id: string) => void;
  updateFilter: (id: string, updates: Partial<Omit<Filter, "id">>) => void;
  clearFilters: () => void;
  setFiltersFromWhere: (where: Record<string, unknown> | null) => void;
  whereClause: Record<string, unknown> | null;
}

/**
 * Generates a unique ID for filters
 */
function generateId(): string {
  return `filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Converts an array of filters to a Chroma-compatible where clause
 */
function filtersToWhereClause(
  filters: Filter[]
): Record<string, unknown> | null {
  if (filters.length === 0) {
    return null;
  }

  if (filters.length === 1) {
    const filter = filters[0];
    return {
      [filter.field]: { [filter.operator]: filter.value },
    };
  }

  // Multiple filters use $and
  return {
    $and: filters.map((filter) => ({
      [filter.field]: { [filter.operator]: filter.value },
    })),
  };
}

/**
 * Parses a Chroma where clause back into Filter array
 */
function parseWhereClause(where: Record<string, unknown>): Filter[] {
  const filters: Filter[] = [];

  // Handle $and array
  if ("$and" in where && Array.isArray(where.$and)) {
    for (const condition of where.$and) {
      const parsed = parseSingleCondition(condition as Record<string, unknown>);
      if (parsed) {
        filters.push(parsed);
      }
    }
    return filters;
  }

  // Handle single condition
  const parsed = parseSingleCondition(where);
  if (parsed) {
    filters.push(parsed);
  }

  return filters;
}

/**
 * Parses a single filter condition
 */
function parseSingleCondition(
  condition: Record<string, unknown>
): Filter | null {
  const keys = Object.keys(condition);
  if (keys.length !== 1) return null;

  const field = keys[0];
  const operatorObj = condition[field];

  if (typeof operatorObj !== "object" || operatorObj === null) return null;

  const operators = Object.keys(operatorObj as Record<string, unknown>);
  if (operators.length !== 1) return null;

  const operator = operators[0] as FilterOperator;
  const validOperators: FilterOperator[] = ["$eq", "$ne", "$gt", "$lt", "$in"];
  if (!validOperators.includes(operator)) return null;

  const value = (operatorObj as Record<string, unknown>)[operator] as
    | string
    | number
    | string[];

  return {
    id: generateId(),
    field,
    operator,
    value,
  };
}

/**
 * Custom hook for managing filter state.
 * Provides CRUD operations for filters and generates Chroma-compatible where clauses.
 *
 * @returns Object containing filters, management functions, and whereClause
 */
export function useFilters(): UseFiltersReturn {
  const [filters, setFilters] = useState<Filter[]>([]);

  const addFilter = useCallback((filter: Omit<Filter, "id">) => {
    const newFilter: Filter = {
      ...filter,
      id: generateId(),
    };
    setFilters((prev) => [...prev, newFilter]);
  }, []);

  const removeFilter = useCallback((id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFilter = useCallback(
    (id: string, updates: Partial<Omit<Filter, "id">>) => {
      setFilters((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
      );
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const setFiltersFromWhere = useCallback(
    (where: Record<string, unknown> | null) => {
      if (!where) {
        setFilters([]);
        return;
      }
      const parsed = parseWhereClause(where);
      setFilters(parsed);
    },
    []
  );

  const whereClause = useMemo(() => filtersToWhereClause(filters), [filters]);

  return {
    filters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    setFiltersFromWhere,
    whereClause,
  };
}
