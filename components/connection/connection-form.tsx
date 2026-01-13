"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useConnection } from "@/lib/hooks/use-connection";

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = 8000;

interface ConnectionFormProps {
  /** Whether to redirect to main page on successful connection */
  redirectOnSuccess?: boolean;
  /** Callback when connection is successful */
  onSuccess?: () => void;
}

/**
 * Form component for connecting to a ChromaDB instance.
 * Tests the connection before saving and optionally redirects on success.
 */
export function ConnectionForm({
  redirectOnSuccess = true,
  onSuccess,
}: ConnectionFormProps) {
  const router = useRouter();
  const { connection, setConnection } = useConnection();

  const [host, setHost] = useState(connection?.host ?? DEFAULT_HOST);
  const [port, setPort] = useState(connection?.port ?? DEFAULT_PORT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Test the connection by calling the collections API
      const response = await fetch("/api/collections", {
        headers: {
          "X-Chroma-Host": host,
          "X-Chroma-Port": String(port),
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to connect to ChromaDB");
      }

      // Connection successful - save it
      setConnection({ host, port });

      if (onSuccess) {
        onSuccess();
      }

      if (redirectOnSuccess) {
        router.push("/");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to connect to ChromaDB server";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Connect to ChromaDB</CardTitle>
        <CardDescription>
          Enter the host and port of your ChromaDB server
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="host"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Host
            </label>
            <Input
              id="host"
              type="text"
              placeholder="localhost"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="port"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Port
            </label>
            <Input
              id="port"
              type="number"
              placeholder="8000"
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value, 10) || 0)}
              disabled={isLoading}
              min={1}
              max={65535}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
