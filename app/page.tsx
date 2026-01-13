"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Database, AlertCircle, X } from "lucide-react";
import { useConnection } from "@/lib/hooks/use-connection";
import { useRecords } from "@/lib/hooks/use-records";
import { useSearch } from "@/lib/hooks/use-search";
import { useFilters } from "@/lib/hooks/use-filters";
import { useMetadata } from "@/lib/hooks/use-metadata";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";
import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/data-table/data-table";
import { createColumns } from "@/components/data-table/columns";
import { Pagination } from "@/components/data-table/pagination";
import { ExportButton } from "@/components/data-table/export-button";
import { SearchBar } from "@/components/search/search-bar";
import { FilterBar } from "@/components/filters/filter-bar";
import { RecordDetail } from "@/components/record/record-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { ChromaRecord } from "@/types";

/**
 * Main page component.
 * Redirects to settings if not connected.
 * Shows collection selector, search bar, and data table when connected.
 */
export default function Home() {
  const router = useRouter();
  const { isConnected } = useConnection();
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ChromaRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filters hook
  const {
    filters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    setFiltersFromWhere,
    whereClause,
  } = useFilters();

  // Metadata hook for auto-discovering fields
  const { fields: metadataFields } = useMetadata({
    collection: selectedCollection,
  });

  const {
    records,
    total,
    page,
    pageSize,
    setPage,
    setPageSize,
    isLoading,
    error: recordsError,
  } = useRecords({
    collection: selectedCollection,
    where: whereClause,
  });

  const {
    results: searchResults,
    distances,
    isSearching,
    error: searchError,
    searchQuery,
    search,
    clearSearch,
    isSearchActive,
  } = useSearch({
    collection: selectedCollection,
  });

  // Wait for hydration before checking connection
  // This is a valid pattern for detecting client-side hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  // Redirect to settings if not connected (after hydration)
  useEffect(() => {
    if (isHydrated && !isConnected) {
      router.push("/settings");
    }
  }, [isHydrated, isConnected, router]);

  // Clear search and filters when collection changes
  useEffect(() => {
    clearSearch();
    clearFilters();
  }, [selectedCollection, clearSearch, clearFilters]);

  // Handle Find Similar action
  const handleFindSimilar = useCallback(
    (record: ChromaRecord) => {
      if (record.document) {
        search(record.document, "semantic");
      }
    },
    [search]
  );

  // Handle View Details action
  const handleViewDetails = useCallback((record: ChromaRecord) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  }, []);

  // Keyboard shortcut handlers
  const handleFocusSearch = useCallback(() => {
    // Find the search input and focus it
    const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  const handleClearAll = useCallback(() => {
    clearSearch();
    clearFilters();
  }, [clearSearch, clearFilters]);

  const handlePreviousPage = useCallback(() => {
    if (page > 1 && !isSearchActive) {
      setPage(page - 1);
    }
  }, [page, isSearchActive, setPage]);

  const handleNextPage = useCallback(() => {
    const totalPages = Math.ceil(total / pageSize);
    if (page < totalPages && !isSearchActive) {
      setPage(page + 1);
    }
  }, [page, total, pageSize, isSearchActive, setPage]);

  // Enable keyboard shortcuts
  useKeyboardShortcuts({
    onFocusSearch: handleFocusSearch,
    onClear: handleClearAll,
    onPreviousPage: handlePreviousPage,
    onNextPage: handleNextPage,
    enabled: isHydrated && isConnected,
  });

  // Create columns with proper callbacks
  const tableColumns = useMemo(
    () =>
      createColumns({
        onFindSimilar: selectedCollection ? handleFindSimilar : undefined,
        onViewDetails: handleViewDetails,
        showDistance: isSearchActive,
        distances: distances,
      }),
    [selectedCollection, handleFindSimilar, handleViewDetails, isSearchActive, distances]
  );

  // Determine which data to show
  const displayData = isSearchActive ? searchResults : records;
  const displayError = isSearchActive ? searchError : recordsError;

  // Show loading skeleton while hydrating
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
        <header className="border-b bg-white dark:bg-zinc-950">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-32" />
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  // If not connected, show nothing while redirecting
  if (!isConnected) {
    return null;
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      {/* Header */}
      <Header
        selectedCollection={selectedCollection}
        onCollectionChange={setSelectedCollection}
        showCollectionSelector={true}
        showSettingsButton={true}
      />

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8">
        {/* Content area */}
        {selectedCollection ? (
          <div className="flex flex-1 flex-col gap-4">
            {/* Search bar and export button */}
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <SearchBar
                  onSearch={search}
                  onClear={clearSearch}
                  isSearching={isSearching}
                  disabled={!selectedCollection}
                />
              </div>
              <ExportButton
                data={displayData}
                collectionName={selectedCollection}
                disabled={displayData.length === 0}
              />
            </div>

            {/* Filter bar */}
            <FilterBar
              filters={filters}
              fields={metadataFields}
              onAddFilter={addFilter}
              onRemoveFilter={removeFilter}
              onUpdateFilter={updateFilter}
              onClearFilters={clearFilters}
              onApplyAdvancedFilter={setFiltersFromWhere}
              whereClause={whereClause}
              disabled={!selectedCollection}
            />

            {/* Filter info */}
            {filters.length > 0 && !isSearchActive && (
              <div className="flex items-center justify-between rounded-lg border bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Showing {total} filtered record{total !== 1 ? "s" : ""} ({filters.length} filter{filters.length !== 1 ? "s" : ""} active)
                  </span>
                </div>
              </div>
            )}

            {/* Search results info */}
            {isSearchActive && (
              <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{searchQuery && searchQuery.length > 50
                      ? `${searchQuery.slice(0, 50)}...`
                      : searchQuery}&rdquo;
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Clear search
                </Button>
              </div>
            )}

            {/* Error state */}
            {displayError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{displayError}</p>
              </div>
            )}

            {/* Data table */}
            <DataTable
              columns={tableColumns}
              data={displayData}
              isLoading={isLoading || isSearching}
              pageCount={isSearchActive ? 1 : totalPages}
            />

            {/* Pagination (only show when not searching) */}
            {!isSearchActive && (
              <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            )}

            {/* Keyboard shortcuts hint */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span><kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">/</kbd> Search</span>
              <span><kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Esc</kbd> Clear</span>
              <span><kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">←</kbd> <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">→</kbd> Navigate pages</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed bg-white p-12 dark:bg-zinc-950">
            <div className="text-center">
              <Database className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-semibold">
                Select a Collection
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a collection from the header dropdown to view its records
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Record detail dialog */}
      <RecordDetail
        record={selectedRecord}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
