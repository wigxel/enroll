"use client";

import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface RefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: { _id: string; userName: string; amount: number } | null;
}

export function RefundDialog({
  open,
  onOpenChange,
  payment,
}: RefundDialogProps) {
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const refundPayment = useAction(api.payments.refund);

  const handleRefund = async () => {
    if (!payment) return;
    setIsProcessing(true);
    try {
      await refundPayment({
        paymentId: payment._id as Id<"payments">,
        reason,
      });
      setReason("");
      onOpenChange(false);
    } catch (error) {
      console.error("Refund failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Issue Refund</DialogTitle>
          <DialogDescription>
            Refund ₦{payment.amount.toLocaleString()} to{" "}
            <strong>{payment.userName}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div>
          <textarea
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            rows={3}
            placeholder="Reason for refund (min 10 characters)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              setReason("");
            }}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRefund}
            disabled={reason.length < 10 || isProcessing}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Confirm Refund"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
