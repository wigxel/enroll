"use client";

import React, { useState } from "react";
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
    payment: { id: string; userName: string; amount: number } | null;
    onSuccess?: () => void;
}

export function RefundDialog({
    open,
    onOpenChange,
    payment,
    onSuccess,
}: RefundDialogProps) {
    const [reason, setReason] = useState("");

    const handleRefund = () => {
        // TODO: call payments.refund({ paymentId: payment.id, reason })
        console.log("Refund", payment?.id, reason);
        setReason("");
        onOpenChange(false);
        onSuccess?.();
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
                        disabled={reason.length < 10}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        Confirm Refund
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
