"use client";

import { Settings } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectionForm } from "@/components/connection/connection-form";
import { Header } from "@/components/layout/header";
import { useConnection } from "@/lib/hooks/use-connection";

/**
 * Settings page for managing ChromaDB connection.
 * Shows current connection status and allows connecting/disconnecting.
 */
export default function SettingsPage() {
  const { connection, clearConnection, isConnected } = useConnection();

  const handleDisconnect = () => {
    clearConnection();
    toast.success("Disconnected from ChromaDB");
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      {/* Header */}
      <Header
        showCollectionSelector={false}
        showSettingsButton={false}
      />

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
        {/* Page title */}
        <div className="flex items-center gap-2 text-center">
          <Settings className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Connection Settings</h2>
        </div>

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
