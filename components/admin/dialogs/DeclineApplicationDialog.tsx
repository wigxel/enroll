"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface DeclineApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: Id<"applications">;
  applicantName: string;
  onSuccess?: () => void;
}

export function DeclineApplicationDialog({
  open,
  onOpenChange,
  applicationId,
  applicantName,
  onSuccess,
}: DeclineApplicationDialogProps) {
  const [reason, setReason] = useState("");
  const [isPending, setIsPending] = useState(false);

  const declineMutation = useMutation(api.applications.decline);

  const handleDecline = async () => {
    setIsPending(true);
    try {
      await declineMutation({
        applicationId,
        rejectionReason: reason,
      });
      setReason("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to decline application:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Decline Application</DialogTitle>
          <DialogDescription>
            This action is permanent. <strong>{applicantName}</strong> will be
            notified of the decision.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700">
            Reason for declining
          </label>
          <textarea
            className="mt-1 w-full rounded-md border border-gray-300 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            rows={4}
            placeholder="Enter reason for declining (min 20 characters)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDecline}
            disabled={reason.length < 20 || isPending}
            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Decline
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
