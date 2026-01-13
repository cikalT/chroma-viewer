"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Database } from "lucide-react";
import { useConnection } from "@/lib/hooks/use-connection";
import { ConnectionStatus } from "@/components/connection/connection-status";
import { CollectionSelector } from "@/components/connection/collection-selector";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Main page component.
 * Redirects to settings if not connected.
 * Shows collection selector and placeholder when connected.
 */
export default function Home() {
  const router = useRouter();
  const { isConnected } = useConnection();
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [isHydrated, setIsHydrated] = useState(false);

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

        {/* Placeholder content */}
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed bg-white p-12 dark:bg-zinc-950">
          {selectedCollection ? (
            <div className="text-center">
              <Database className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-semibold">
                Collection: {selectedCollection}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Records viewer will be implemented in the next phase
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Database className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-semibold">
                Select a Collection
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a collection from the dropdown above to view its records
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
