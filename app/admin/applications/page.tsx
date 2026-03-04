"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowRight, Filter } from "lucide-react";

type ApplicationStatus = "draft" | "submitted" | "under_review" | "approved" | "declined";

interface Application {
    id: string;
    applicantName: string;
    email: string;
    status: ApplicationStatus;
    submittedAt: string;
    paymentStatus: "paid" | "unpaid" | "refunded";
    course: string;
}

// Mock data — TODO: Replace with useQuery(api.applications.list)
const mockApplications: Application[] = [
    { id: "app_1", applicantName: "Jane Doe", email: "jane@example.com", status: "submitted", submittedAt: "2026-02-20T10:00:00Z", paymentStatus: "paid", course: "Software Engineering" },
    { id: "app_2", applicantName: "John Smith", email: "john@example.com", status: "under_review", submittedAt: "2026-02-22T10:00:00Z", paymentStatus: "paid", course: "Data Science" },
    { id: "app_3", applicantName: "Eva Chen", email: "eva@example.com", status: "declined", submittedAt: "2026-02-10T10:00:00Z", paymentStatus: "paid", course: "Software Engineering" },
    { id: "app_4", applicantName: "Michael Brown", email: "michael@example.com", status: "approved", submittedAt: "2026-01-28T10:00:00Z", paymentStatus: "paid", course: "Product Design" },
    { id: "app_5", applicantName: "Sarah Wilson", email: "sarah@example.com", status: "submitted", submittedAt: "2026-02-25T10:00:00Z", paymentStatus: "unpaid", course: "Data Science" },
    { id: "app_6", applicantName: "David Lee", email: "david@example.com", status: "approved", submittedAt: "2026-01-15T10:00:00Z", paymentStatus: "paid", course: "Software Engineering" },
    { id: "app_7", applicantName: "Anna Kim", email: "anna@example.com", status: "draft", submittedAt: "2026-03-01T10:00:00Z", paymentStatus: "unpaid", course: "Product Design" },
];

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
    refunded: "text-gray-500",
};

export default function ApplicationsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>("all");

    const filteredApplications = useMemo(() => {
        return mockApplications.filter((app) => {
            const matchesSearch =
                app.applicantName.toLowerCase().includes(search.toLowerCase()) ||
                app.email.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || app.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [search, statusFilter]);

    const counts = useMemo(() => ({
        all: mockApplications.length,
        submitted: mockApplications.filter((a) => a.status === "submitted").length,
        under_review: mockApplications.filter((a) => a.status === "under_review").length,
        approved: mockApplications.filter((a) => a.status === "approved").length,
        declined: mockApplications.filter((a) => a.status === "declined").length,
        draft: mockApplications.filter((a) => a.status === "draft").length,
    }), []);

    return (
        <div className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {counts.all} total · {counts.submitted + counts.under_review} pending review
                    </p>
                </div>

                {/* Status Filter Tabs */}
                <div className="mt-6 flex flex-wrap gap-2">
                    {(["all", "submitted", "under_review", "approved", "declined", "draft"] as const).map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() => setStatusFilter(status)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === status
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {status === "all" ? "All" : status === "under_review" ? "Under Review" : status.charAt(0).toUpperCase() + status.slice(1)}
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
                {filteredApplications.length === 0 ? (
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
                                {filteredApplications.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="flex items-center">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                                    {app.applicantName.split(" ").map((n) => n[0]).join("")}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="font-medium text-gray-900">
                                                        {app.applicantName}
                                                    </div>
                                                    <div className="text-gray-500">{app.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                            {app.course}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusBadge[app.status].bg}`}>
                                                {statusBadge[app.status].label}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            <span className={`font-medium capitalize ${paymentBadge[app.paymentStatus]}`}>
                                                {app.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {new Date(app.submittedAt).toLocaleDateString()}
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <Link
                                                href={`/admin/applications/${app.id}`}
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
