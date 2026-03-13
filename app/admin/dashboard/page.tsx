"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Users, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import {
  DateRangePicker,
  type DateRange,
} from "~/components/tremor/date-range-filter";
import { startOfMonth } from "date-fns";

export default function AdminDashboardPage() {
  // Default to 'This Month'
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const statsResult = useQuery(api.applications.getDashboardStats, {
    from: dateRange?.from?.toISOString(),
    to: dateRange?.to?.toISOString(),
  });

  // Pending applications table remains unfiltered by date, representing the current backlog
  const pendingResultRaw = useQuery(api.applications.listPending, {});

  const stats = statsResult?.success ? statsResult.data : null;
  const pendingResult = pendingResultRaw?.success ? pendingResultRaw.data : { applications: [] };

  const isLoading = statsResult === undefined || pendingResultRaw === undefined;

  const statCards = [
    {
      name: "Total Applications",
      value: stats?.total ?? "—",
      icon: Users,
    },
    {
      name: "Pending Review",
      value: stats?.pendingReview ?? "—",
      icon: FileText,
    },
    {
      name: "Approved",
      value: stats?.approved ?? "—",
      icon: CheckCircle,
    },
    {
      name: "Declined",
      value: stats?.declined ?? "—",
      icon: XCircle,
    },
  ];

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        {/* Date Filter */}
        <div className="flex justify-end mb-4">
          <DateRangePicker
            value={dateRange}
            onChange={(range) => range && setDateRange(range)}
            className="w-full sm:w-72"
          />
        </div>

        {/* Stats Row */}
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((item) => (
            <StatCard key={item.name} {...item} />
          ))}
        </dl>

        {/* Pending Applications Section */}
        <div className="mt-10">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <h2 className="text-xl font-semibold text-gray-900">
                Pending Applications
              </h2>
              <p className="mt-2 text-sm text-gray-700">
                A prioritized list of submitted and under-review applications
                awaiting your action.
              </p>
            </div>
            <Link
              href="/admin/applications"
              className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 sm:mt-0"
            >
              View All Applications →
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <ApplicationsTable
              applications={pendingResult.applications.map((app) => ({
                id: app._id,
                applicantName: app.applicantName,
                email: app.applicantEmail,
                submittedAt: app.submittedAt ?? null,
                paymentStatus:
                  app.paymentStatus === "paid" ? "paid" : "pending",
                status: app.status,
              }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
