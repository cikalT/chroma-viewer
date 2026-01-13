"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Database, AlertCircle, X } from "lucide-react";
import { useConnection } from "@/lib/hooks/use-connection";
import { useRecords } from "@/lib/hooks/use-records";
import { useSearch } from "@/lib/hooks/use-search";
import { ConnectionStatus } from "@/components/connection/connection-status";
import { CollectionSelector } from "@/components/connection/collection-selector";
import { DataTable } from "@/components/data-table/data-table";
import { createColumns } from "@/components/data-table/columns";
import { Pagination } from "@/components/data-table/pagination";
import { SearchBar } from "@/components/search/search-bar";
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
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Redirect to settings if not connected (after hydration)
  useEffect(() => {
    if (isHydrated && !isConnected) {
      router.push("/settings");
    }
  }, [isHydrated, isConnected, router]);

  // Clear search when collection changes
  useEffect(() => {
    clearSearch();
  }, [selectedCollection, clearSearch]);

  // Handle Find Similar action
  const handleFindSimilar = useCallback(
    (record: ChromaRecord) => {
      if (record.document) {
        search(record.document, "semantic");
      }
    },
    [search]
  );

  // Create columns with proper callbacks
  const tableColumns = useMemo(
    () =>
      createColumns({
        onFindSimilar: selectedCollection ? handleFindSimilar : undefined,
        showDistance: isSearchActive,
        distances: distances,
      }),
    [selectedCollection, handleFindSimilar, isSearchActive, distances]
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
      <header className="border-b bg-white dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Chroma DB Viewer</h1>
          </div>
          <ConnectionStatus />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8">
        {/* Collection selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            Collection:
          </span>
          <CollectionSelector
            value={selectedCollection}
            onSelect={setSelectedCollection}
          />
        </div>

        {/* Content area */}
        {selectedCollection ? (
          <div className="flex flex-1 flex-col gap-4">
            {/* Search bar */}
            <SearchBar
              onSearch={search}
              onClear={clearSearch}
              isSearching={isSearching}
              disabled={!selectedCollection}
            />

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
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed bg-white p-12 dark:bg-zinc-950">
            <div className="text-center">
              <Database className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-semibold">
                Select a Collection
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a collection from the dropdown above to view its records
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
