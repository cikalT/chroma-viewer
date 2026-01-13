"use client";

import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectionForm } from "@/components/connection/connection-form";
import { useConnection } from "@/lib/hooks/use-connection";

/**
 * Settings page for managing ChromaDB connection.
 * Shows current connection status and allows connecting/disconnecting.
 */
export default function SettingsPage() {
  const router = useRouter();
  const { connection, clearConnection, isConnected } = useConnection();

  const handleDisconnect = () => {
    clearConnection();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="border-b bg-white dark:bg-zinc-950">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <h1 className="text-xl font-semibold">Chroma DB Viewer - Settings</h1>
          </div>
          {isConnected && (
            <Button variant="outline" size="sm" onClick={handleGoHome}>
              Back to Viewer
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
        {/* Connection status */}
        {isConnected && connection && (
          <div className="flex flex-col items-center gap-4 rounded-lg border bg-white p-6 dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              </span>
              <span className="font-medium">Currently connected</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {connection.host}:{connection.port}
              </Badge>
            </div>
            <Button variant="destructive" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        )}

        {/* Connection form */}
        <ConnectionForm redirectOnSuccess={true} />
      </main>
    </div>
  );
}
