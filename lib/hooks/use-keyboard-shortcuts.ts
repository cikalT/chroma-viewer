"use client";

import { useEffect, useCallback } from "react";

export interface KeyboardShortcutsOptions {
  /** Callback when "/" is pressed - focus search */
  onFocusSearch?: () => void;
  /** Callback when Escape is pressed - clear search/filters */
  onClear?: () => void;
  /** Callback when left arrow is pressed - previous page */
  onPreviousPage?: () => void;
  /** Callback when right arrow is pressed - next page */
  onNextPage?: () => void;
  /** Whether shortcuts are enabled */
  enabled?: boolean;
}

/**
 * Hook for global keyboard shortcuts.
 * - "/" - Focus search input
 * - "Escape" - Clear search/filters
 * - "ArrowLeft" - Navigate to previous page
 * - "ArrowRight" - Navigate to next page
 */
export function useKeyboardShortcuts({
  onFocusSearch,
  onClear,
  onPreviousPage,
  onNextPage,
  enabled = true,
}: KeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      const target = event.target as HTMLElement;
      const isInputElement =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Handle "/" for focus search (always, even in input)
      if (event.key === "/" && !isInputElement) {
        event.preventDefault();
        onFocusSearch?.();
        return;
      }

      // Handle Escape (also in inputs to allow clearing)
      if (event.key === "Escape") {
        // If in an input, blur it first
        if (isInputElement) {
          target.blur();
        }
        onClear?.();
        return;
      }

      // Don't trigger navigation shortcuts if in input
      if (isInputElement) return;

      // Handle arrow keys for pagination
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPreviousPage?.();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNextPage?.();
        return;
      }
    },
    [onFocusSearch, onClear, onPreviousPage, onNextPage]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
