"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

export type ApplicationStatus = "draft" | "submitted" | "under_review" | "approved" | "declined" | "enrolled";

export interface DashboardApplication {
    id: string;
    applicantName: string;
    email: string;
    submittedAt: string | null;
    paymentStatus: "pending" | "paid" | "failed" | "refunded";
    status: ApplicationStatus;
}

interface ApplicationsTableProps {
    applications: DashboardApplication[];
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
    if (applications.length === 0) {
        return (
            <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No pending applications
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    You&apos;re all caught up! There are no applications waiting for review
                    right now.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300 bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                    >
                                        Applicant
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                    >
                                        Submitted At
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                    >
                                        Payment
                                    </th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span className="sr-only">Action</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {applications.map((app) => (
                                    <tr key={app.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="font-medium text-gray-900">
                                                {app.applicantName}
                                            </div>
                                            <div className="text-gray-500">{app.email}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {app.submittedAt
                                                ? format(new Date(app.submittedAt), "MMM d, yyyy")
                                                : "N/A"}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            <span
                                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${app.status === "under_review"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-blue-100 text-blue-800"
                                                    }`}
                                            >
                                                {app.status === "under_review"
                                                    ? "Under Review"
                                                    : "Submitted"}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            <span
                                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${app.paymentStatus === "paid"
                                                        ? "bg-green-100 text-green-800"
                                                        : app.paymentStatus === "pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {app.paymentStatus.charAt(0).toUpperCase() +
                                                    app.paymentStatus.slice(1)}
                                            </span>
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <Link
                                                href={`/admin/applications/${app.id}`}
                                                className="group inline-flex items-center text-primary hover:text-primary/80"
                                            >
                                                Review
                                                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                <span className="sr-only">, {app.applicantName}</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
