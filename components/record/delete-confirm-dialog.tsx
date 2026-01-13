"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when the dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Number of records to delete */
  count: number;
  /** Record ID if deleting a single record */
  recordId?: string;
  /** Callback when delete is confirmed */
  onConfirm: () => void;
  /** Whether delete is in progress */
  isDeleting?: boolean;
}

/**
 * Confirmation dialog for deleting records.
 * Shows different messages for single vs bulk delete.
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  count,
  recordId,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  const isSingle = count === 1;
  const title = isSingle ? "Delete Record" : `Delete ${count} Records`;
  const description = isSingle
    ? `Are you sure you want to delete record "${recordId}"? This action cannot be undone.`
    : `Are you sure you want to delete ${count} records? This action cannot be undone.`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
