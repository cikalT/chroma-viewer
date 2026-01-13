"use client";

import { useRouter } from "next/navigation";
import { Database, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectionStatus } from "@/components/connection/connection-status";
import { CollectionSelector } from "@/components/connection/collection-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { useConnection } from "@/lib/hooks/use-connection";

interface HeaderProps {
  /** Currently selected collection name */
  selectedCollection?: string;
  /** Callback when collection selection changes */
  onCollectionChange?: (collection: string) => void;
  /** Whether to show the collection selector */
  showCollectionSelector?: boolean;
  /** Whether to show the settings button */
  showSettingsButton?: boolean;
}

/**
 * Shared header component for consistent navigation across pages.
 * Includes logo, connection status, collection selector, theme toggle, and settings.
 */
export function Header({
  selectedCollection,
  onCollectionChange,
  showCollectionSelector = false,
  showSettingsButton = true,
}: HeaderProps) {
  const router = useRouter();
  const { isConnected } = useConnection();

  const handleSettingsClick = () => {
    router.push("/settings");
  };

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    <header className="border-b bg-white dark:bg-zinc-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Left side: Logo and collection selector */}
        <div className="flex items-center gap-6">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            type="button"
          >
            <Database className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Chroma DB Viewer</h1>
          </button>

          {/* Collection selector (when connected and enabled) */}
          {showCollectionSelector && isConnected && onCollectionChange && (
            <div className="flex items-center gap-3 border-l pl-6">
              <span className="text-sm font-medium text-muted-foreground">
                Collection:
              </span>
              <CollectionSelector
                value={selectedCollection}
                onSelect={onCollectionChange}
              />
            </div>
          )}
        </div>

        {/* Right side: Connection status, theme toggle, settings */}
        <div className="flex items-center gap-2">
          <ConnectionStatus />
          <ThemeToggle />
          {showSettingsButton && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleSettingsClick}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
