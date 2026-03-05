"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface Payment {
  _id: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  referenceType: "application" | "tuition";
  stripePaymentIntentId: string;
  amount: number;
  status: string;
}

interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
}

export function TransactionDetailDialog({
  open,
  onOpenChange,
  payment,
}: TransactionDetailDialogProps) {
  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <dl className="space-y-3">
          {[
            ["Reference", payment.stripePaymentIntentId],
            ["User", `${payment.userName} (${payment.userEmail})`],
            [
              "Type",
              payment.referenceType === "application"
                ? "Application Fee"
                : "Tuition",
            ],
            ["Amount", `₦${payment.amount.toLocaleString()}`],
            [
              "Status",
              payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
            ],
            ["Date", new Date(payment.createdAt).toLocaleString()],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <dt className="font-medium text-gray-500">{label}</dt>
              <dd className="text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
