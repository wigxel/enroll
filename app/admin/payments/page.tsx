"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Search, Loader2 } from "lucide-react";
import { TransactionDetailDialog } from "~/components/admin/dialogs/TransactionDetailDialog";
import { RefundDialog } from "~/components/admin/dialogs/RefundDialog";

type PaymentStatus = "succeeded" | "pending" | "failed" | "refunded";
type PaymentType = "application" | "tuition";

const statusBadge: Record<PaymentStatus, string> = {
  succeeded: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const typeBadge: Record<PaymentType, string> = {
  application: "bg-blue-100 text-blue-800",
  tuition: "bg-purple-100 text-purple-800",
};

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PaymentStatus>(
    "All",
  );
  const [typeFilter, setTypeFilter] = useState<"All" | PaymentType>("All");
  const [detailPayment, setDetailPayment] = useState<any | null>(null);
  const [refundPayment, setRefundPayment] = useState<any | null>(null);

  const paymentsResult = useQuery(api.payments.list, {
    search: search || undefined,
    status: statusFilter === "All" ? undefined : statusFilter,
    referenceType: typeFilter === "All" ? undefined : typeFilter,
  });

  const stats = useQuery(api.payments.getStats, {});

  const payments = paymentsResult?.payments ?? [];
  const isLoading = paymentsResult === undefined;

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Payments &amp; Transactions
        </h1>

        {/* Revenue Summary Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { label: "Total Collected", value: stats?.totalCollected ?? 0 },
            { label: "Application Fees", value: stats?.applicationFees ?? 0 },
            { label: "Tuition Collected", value: stats?.tuitionCollected ?? 0 },
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
            onChange={(e) =>
              setStatusFilter(e.target.value as "All" | PaymentStatus)
            }
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
            onChange={(e) =>
              setTypeFilter(e.target.value as "All" | PaymentType)
            }
            className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Types</option>
            <option value="application">Application Fee</option>
            <option value="tuition">Tuition</option>
          </select>
        </div>

        {/* Transactions Table */}
        <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Date
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  User
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Type
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Reference
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Amount
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" />
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="font-medium text-gray-900">
                        {payment.userName}
                      </div>
                      <div className="text-gray-500">{payment.userEmail}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${typeBadge[payment.referenceType]}`}
                      >
                        {payment.referenceType === "application"
                          ? "App Fee"
                          : "Tuition"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono">
                      {payment.stripePaymentIntentId}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                      ₦{payment.amount.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusBadge[payment.status]}`}
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionDetailDialog
        open={!!detailPayment}
        onOpenChange={(open) => {
          if (!open) setDetailPayment(null);
        }}
        payment={detailPayment}
      />

      <RefundDialog
        open={!!refundPayment}
        onOpenChange={(open) => {
          if (!open) setRefundPayment(null);
        }}
        payment={refundPayment}
      />
    </div>
  );
}
