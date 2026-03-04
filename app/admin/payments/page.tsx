"use client";

import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { TransactionDetailDialog } from "~/components/admin/dialogs/TransactionDetailDialog";
import { RefundDialog } from "~/components/admin/dialogs/RefundDialog";

type PaymentStatus = "succeeded" | "pending" | "failed" | "refunded";
type PaymentType = "application_fee" | "tuition";

interface Payment {
    id: string;
    date: string;
    userName: string;
    userEmail: string;
    type: PaymentType;
    reference: string;
    amount: number;
    status: PaymentStatus;
}

// Mock data
const mockPayments: Payment[] = [
    { id: "p1", date: "2026-02-28T10:30:00Z", userName: "Jane Doe", userEmail: "jane@example.com", type: "application_fee", reference: "PSK_ref_abc123", amount: 15000, status: "succeeded" },
    { id: "p2", date: "2026-02-27T08:15:00Z", userName: "John Smith", userEmail: "john@example.com", type: "application_fee", reference: "PSK_ref_def456", amount: 15000, status: "pending" },
    { id: "p3", date: "2026-02-25T14:00:00Z", userName: "Alice Johnson", userEmail: "alice@example.com", type: "tuition", reference: "PSK_ref_ghi789", amount: 250000, status: "succeeded" },
    { id: "p4", date: "2026-02-24T11:00:00Z", userName: "Bob Williams", userEmail: "bob@example.com", type: "application_fee", reference: "PSK_ref_jkl012", amount: 15000, status: "failed" },
    { id: "p5", date: "2026-02-20T09:00:00Z", userName: "Carol Martinez", userEmail: "carol@example.com", type: "tuition", reference: "PSK_ref_mno345", amount: 250000, status: "refunded" },
];

const mockStats = {
    totalCollected: 530000,
    applicationFees: 30000,
    tuitionCollected: 500000,
};

const statusBadge: Record<PaymentStatus, string> = {
    succeeded: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
};

const typeBadge: Record<PaymentType, string> = {
    application_fee: "bg-blue-100 text-blue-800",
    tuition: "bg-purple-100 text-purple-800",
};

export default function PaymentsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"All" | PaymentStatus>("All");
    const [typeFilter, setTypeFilter] = useState<"All" | PaymentType>("All");
    const [detailPayment, setDetailPayment] = useState<Payment | null>(null);
    const [refundPayment, setRefundPayment] = useState<Payment | null>(null);

    const filteredPayments = useMemo(() => {
        return mockPayments.filter((p) => {
            const matchesSearch =
                p.userName.toLowerCase().includes(search.toLowerCase()) ||
                p.userEmail.toLowerCase().includes(search.toLowerCase()) ||
                p.reference.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "All" || p.status === statusFilter;
            const matchesType = typeFilter === "All" || p.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [search, statusFilter, typeFilter]);

    return (
        <div className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Payments &amp; Transactions
                </h1>

                {/* Revenue Summary Cards */}
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {[
                        { label: "Total Collected", value: mockStats.totalCollected },
                        { label: "Application Fees", value: mockStats.applicationFees },
                        { label: "Tuition Collected", value: mockStats.tuitionCollected },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-lg bg-white px-4 py-5 shadow sm:p-6"
                        >
                            <dt className="truncate text-sm font-medium text-gray-500">
                                {stat.label}
                            </dt>
                            <dd className="mt-1 text-2xl font-semibold text-gray-900">
                                ₦{stat.value.toLocaleString()}
                            </dd>
                        </div>
                    ))}
                </div>

                {/* Search & Filters */}
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or reference..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as "All" | PaymentStatus)}
                        className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="All">All Statuses</option>
                        <option value="succeeded">Succeeded</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as "All" | PaymentType)}
                        className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="All">All Types</option>
                        <option value="application_fee">Application Fee</option>
                        <option value="tuition">Tuition</option>
                    </select>
                </div>

                {/* Transactions Table */}
                <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300 bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">User</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Reference</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPayments.map((payment) => (
                                <tr key={payment.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                                        {new Date(payment.date).toLocaleDateString()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <div className="font-medium text-gray-900">{payment.userName}</div>
                                        <div className="text-gray-500">{payment.userEmail}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${typeBadge[payment.type]}`}>
                                            {payment.type === "application_fee" ? "App Fee" : "Tuition"}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono">
                                        {payment.reference}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                                        ₦{payment.amount.toLocaleString()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusBadge[payment.status]}`}>
                                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setDetailPayment(payment)}
                                            className="text-primary hover:text-primary/80"
                                        >
                                            View
                                        </button>
                                        {payment.status === "succeeded" && (
                                            <button
                                                type="button"
                                                onClick={() => setRefundPayment(payment)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Refund
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <TransactionDetailDialog
                open={!!detailPayment}
                onOpenChange={(open) => { if (!open) setDetailPayment(null); }}
                payment={detailPayment}
            />

            <RefundDialog
                open={!!refundPayment}
                onOpenChange={(open) => { if (!open) setRefundPayment(null); }}
                payment={refundPayment}
            />
        </div>
    );
}
