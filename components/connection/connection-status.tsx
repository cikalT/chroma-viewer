"use client";

import { useRouter } from "next/navigation";
import { useConnection } from "@/lib/hooks/use-connection";

/**
 * Small indicator component showing connection status.
 * Clicking navigates to the settings page.
 */
export function ConnectionStatus() {
  const router = useRouter();
  const { connection, isConnected } = useConnection();

  const handleClick = () => {
    router.push("/settings");
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent"
      type="button"
    >
      {isConnected && connection ? (
        <>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
          </span>
          <span className="text-muted-foreground">
            Connected to {connection.host}:{connection.port}
          </span>
        </>
      ) : (
        <>
          <span className="relative flex h-2.5 w-2.5">
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
          </span>
          <span className="text-muted-foreground">Not connected</span>
        </>
      )}
    </button>
  );
}
