"use client";

import { useQuery } from "convex/react";
import { ArrowRight, Filter, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api } from "~/convex/_generated/api";

type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "declined";
type StatusFilter = "all" | ApplicationStatus;

const statusBadge: Record<ApplicationStatus, { bg: string; label: string }> = {
  draft: { bg: "bg-gray-100 text-gray-600", label: "Draft" },
  submitted: { bg: "bg-blue-100 text-blue-800", label: "Submitted" },
  under_review: { bg: "bg-yellow-100 text-yellow-800", label: "Under Review" },
  approved: { bg: "bg-green-100 text-green-800", label: "Approved" },
  declined: { bg: "bg-red-100 text-red-800", label: "Declined" },
};

const paymentBadge: Record<string, string> = {
  paid: "text-green-700",
  unpaid: "text-yellow-700",
};

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const resultRaw = useQuery(api.applications.listAll, {
    statusFilter: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
  });

  const isLoading = resultRaw === undefined;
  const applications = resultRaw?.success ? resultRaw.data.applications : [];
  const counts = resultRaw?.success
    ? resultRaw.data.counts
    : {
        all: 0,
        submitted: 0,
        under_review: 0,
        approved: 0,
        declined: 0,
        draft: 0,
      };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
          <p className="mt-1 text-sm text-gray-500">
            {counts.all} total · {counts.submitted + counts.under_review}{" "}
            pending review
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              "all",
              "submitted",
              "under_review",
              "approved",
              "declined",
              "draft",
            ] as const
          ).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status === "all"
                ? "All"
                : status === "under_review"
                  ? "Under Review"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                {counts[status]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Applications Table */}
        {isLoading ? (
          <div className="mt-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : resultRaw.success === false ? (
          <div className="mt-12 p-4 text-center text-red-600 bg-red-50 rounded-lg">
            {resultRaw.error}
          </div>
        ) : applications.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <Filter className="h-8 w-8 text-gray-300" />
            <h3 className="mt-3 text-sm font-medium text-gray-900">
              No applications found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Applicant
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Course
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Payment
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Submitted
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {app.applicantName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">
                            {app.applicantName}
                          </div>
                          <div className="text-gray-500">
                            {app.applicantEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                      {app.courseName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusBadge[app.status].bg}`}
                      >
                        {statusBadge[app.status].label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`font-medium capitalize ${paymentBadge[app.paymentStatus] ?? "text-gray-500"}`}
                      >
                        {app.paymentStatus}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {app.submittedAt
                        ? new Date(app.submittedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link
                        href={`/admin/applications/${app._id}`}
                        className="group inline-flex items-center text-primary hover:text-primary/80"
                      >
                        Review
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
