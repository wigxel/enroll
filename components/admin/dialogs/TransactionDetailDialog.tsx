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
    id: string;
    date: string;
    userName: string;
    userEmail: string;
    type: "application_fee" | "tuition";
    reference: string;
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
                        ["Reference", payment.reference],
                        ["User", `${payment.userName} (${payment.userEmail})`],
                        [
                            "Type",
                            payment.type === "application_fee"
                                ? "Application Fee"
                                : "Tuition",
                        ],
                        ["Amount", `₦${payment.amount.toLocaleString()}`],
                        ["Status", payment.status],
                        ["Date", new Date(payment.date).toLocaleString()],
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
