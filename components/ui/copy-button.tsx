"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  /** The value to copy to clipboard */
  value: string;
  /** Optional label for the toast notification */
  label?: string;
  /** Button variant */
  variant?: "default" | "ghost" | "outline";
  /** Button size */
  size?: "default" | "sm" | "icon" | "icon-sm";
  /** Additional class names */
  className?: string;
}

/**
 * Reusable copy button that copies text to clipboard.
 * Shows a checkmark icon on success and displays a toast notification.
 * Returns to copy icon after 2 seconds.
 */
export function CopyButton({
  value,
  label = "Copied to clipboard",
  variant = "ghost",
  size = "icon-sm",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(label);

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, [value, label]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn("shrink-0", className)}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
