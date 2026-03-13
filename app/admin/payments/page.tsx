"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Search, Loader2, TrendingUp, CreditCard, Wallet } from "lucide-react";
import { TransactionDetailDialog } from "~/components/admin/dialogs/TransactionDetailDialog";
import { RefundDialog } from "~/components/admin/dialogs/RefundDialog";
import { AreaChart, Card, Metric, Text, Flex, Grid, Badge, TabGroup, TabList, Tab } from "@tremor/react";
import { motion, AnimatePresence } from "framer-motion";

type PaymentStatus = "succeeded" | "pending" | "failed" | "refunded";
type PaymentType = "application" | "tuition";

const statusBadge: Record<PaymentStatus, { color: any; text: string }> = {
  succeeded: { color: "emerald", text: "Successful" },
  pending: { color: "amber", text: "Pending" },
  failed: { color: "rose", text: "Failed" },
  refunded: { color: "slate", text: "Refunded" },
};

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PaymentStatus>("All");
  const [typeFilter, setTypeFilter] = useState<"All" | PaymentType>("All");
  const [detailPayment, setDetailPayment] = useState<any | null>(null);
  const [refundPayment, setRefundPayment] = useState<any | null>(null);
  const [chartDays, setChartDays] = useState(30);

  const paymentsResultRaw = useQuery(api.payments.list, {
    search: search || undefined,
    status: statusFilter === "All" ? undefined : statusFilter,
    referenceType: typeFilter === "All" ? undefined : typeFilter,
  });

  const statsResult = useQuery(api.payments.getStats, {});
  const trendsResult = useQuery(api.payments.getRevenueTrends, { days: chartDays });

  const payments = paymentsResultRaw?.success ? paymentsResultRaw.data.payments : [];
  const stats = statsResult?.success ? statsResult.data : null;
  const trends = trendsResult?.success ? trendsResult.data : [];
  const isLoading = paymentsResultRaw === undefined;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-8 space-y-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Financial Overview</h1>
            <p className="text-gray-500 mt-1">Monitor revenue, track transactions, and manage refunds.</p>
          </div>
        </div>

        {/* Revenue Summary Cards */}
        <Grid numItemsSm={2} numItemsLg={3} className="mt-8 gap-6">
          <Card decoration="top" decorationColor="indigo" className="hover:shadow-lg transition-shadow">
            <Flex alignItems="start">
              <div className="space-y-2">
                <Text className="text-gray-500 font-medium">Total Revenue</Text>
                <Metric className="text-indigo-600 font-bold">₦{(stats?.totalCollected ?? 0).toLocaleString()}</Metric>
              </div>
              <Badge icon={TrendingUp} color="indigo" size="sm">Overall</Badge>
            </Flex>
          </Card>
          <Card decoration="top" decorationColor="blue" className="hover:shadow-lg transition-shadow">
            <Flex alignItems="start">
              <div className="space-y-2">
                <Text className="text-gray-500 font-medium">Application Fees</Text>
                <Metric className="text-blue-600 font-bold">₦{(stats?.applicationFees ?? 0).toLocaleString()}</Metric>
              </div>
              <Badge icon={Wallet} color="blue" size="sm">Enrollment</Badge>
            </Flex>
          </Card>
          <Card decoration="top" decorationColor="purple" className="hover:shadow-lg transition-shadow">
            <Flex alignItems="start">
              <div className="space-y-2">
                <Text className="text-gray-500 font-medium">Tuition Collected</Text>
                <Metric className="text-purple-600 font-bold">₦{(stats?.tuitionCollected ?? 0).toLocaleString()}</Metric>
              </div>
              <Badge icon={CreditCard} color="purple" size="sm">Academic</Badge>
            </Flex>
          </Card>
        </Grid>

        {/* Revenue Chart */}
        <Card className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <Text className="text-lg font-bold text-gray-900">Revenue Trends</Text>
              <Text className="text-gray-500">Daily revenue breakdown</Text>
            </div>
            <TabGroup index={chartDays === 7 ? 0 : chartDays === 30 ? 1 : 2} onIndexChange={(i) => setChartDays(i === 0 ? 7 : i === 1 ? 30 : 90)}>
              <TabList variant="solid">
                <Tab>7D</Tab>
                <Tab>30D</Tab>
                <Tab>90D</Tab>
              </TabList>
            </TabGroup>
          </div>
          <AreaChart
            className="h-72 mt-4"
            data={trends}
            index="date"
            categories={["App Fees", "Tuition"]}
            colors={["blue", "purple"]}
            valueFormatter={(v) => `₦${v.toLocaleString()}`}
            showAnimation={true}
            curveType="monotone"
          />
        </Card>

        {/* Search & Filters */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by name, email, or reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "All" | PaymentStatus)}
            className="rounded-lg border-gray-200 py-2.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
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
            className="rounded-lg border-gray-200 py-2.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
          >
            <option value="All">All Types</option>
            <option value="application">Application Fee</option>
            <option value="tuition">Tuition Building</option>
          </select>
        </div>

        {/* Transactions Table */}
        <div className="mt-6 overflow-hidden bg-white shadow-sm border border-gray-100 rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="py-4 pl-6 pr-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">User</th>
                <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Type</th>
                <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Reference</th>
                <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Amount</th>
                <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="relative py-4 pl-3 pr-6 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={7} className="py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                        <span className="font-medium">Loading transactions...</span>
                      </div>
                    </td>
                  </motion.tr>
                ) : (paymentsResultRaw.success === false) ? (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={7} className="py-12 text-center text-sm text-red-600 font-medium">
                      {paymentsResultRaw.error}
                    </td>
                  </motion.tr>
                ) : payments.length === 0 ? (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={7} className="py-12 text-center text-sm text-gray-500">
                      No transactions found for the selected filters.
                    </td>
                  </motion.tr>
                ) : (
                  payments.map((payment: any, idx: number) => (
                    <motion.tr
                      key={payment._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setDetailPayment(payment)}
                      className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="whitespace-nowrap py-5 pl-6 pr-3 text-sm text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm">
                        <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {payment.userName}
                        </div>
                        <div className="text-gray-400 text-xs">{payment.userEmail}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm">
                        <Badge color={payment.referenceType === "application" ? "blue" : "purple"} size="xs">
                          {payment.referenceType === "application" ? "Application" : "Tuition"}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm font-mono text-gray-400 text-xs">
                        {payment.stripePaymentIntentId}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-900 font-bold text-right">
                        ₦{payment.amount.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm">
                        <Badge color={statusBadge[payment.status as PaymentStatus].color} size="xs">
                          {statusBadge[payment.status as PaymentStatus].text}
                        </Badge>
                      </td>
                      <td className="relative whitespace-nowrap py-5 pl-3 pr-6 text-right text-sm font-semibold space-x-4">
                        <button
                          type="button"
                          onClick={() => setDetailPayment(payment)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          Details
                        </button>
                        {payment.status === "succeeded" && (
                          <button
                            type="button"
                            onClick={() => setRefundPayment(payment)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
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

      <AnimatePresence>
        {refundPayment && (
          <RefundDialog
            open={!!refundPayment}
            onOpenChange={(open) => {
              if (!open) setRefundPayment(null);
            }}
            payment={refundPayment}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
