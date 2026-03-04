"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { DeclineApplicationDialog } from "~/components/admin/dialogs/DeclineApplicationDialog";

// Mock data — TODO: Replace with useQuery(api.applications.getById, { applicationId })
function useApplication(id: string) {
    return {
        id,
        status: "under_review" as const,
        applicantName: "Jane Doe",
        email: "jane.doe@example.com",
        phone: "+234 812 345 6789",
        submittedAt: "2026-02-28T10:30:00Z",
        profileImage: null as string | null,
        personalInfo: {
            firstName: "Jane",
            lastName: "Doe",
            dateOfBirth: "1998-05-15",
            phone: "+234 812 345 6789",
            address: "12 Marina Road, Lagos, Nigeria",
        },
        educationalBackground: {
            highestQualification: "Bachelor's Degree",
            institution: "University of Lagos",
            graduationYear: "2020",
            fieldOfStudy: "Computer Science",
        },
        payment: {
            status: "paid" as const,
            amount: 15000,
            reference: "PSK_ref_abc123xyz",
            paidAt: "2026-02-27T08:15:00Z",
        },
    };
}

export default function ApplicationDetailPage() {
    const params = useParams();
    const applicationId = params.applicationId as string;
    const application = useApplication(applicationId);
    const [showDeclineDialog, setShowDeclineDialog] = useState(false);

    const canTakeAction = application.status === "under_review";

    const statusColors: Record<string, string> = {
        draft: "bg-gray-100 text-gray-800",
        submitted: "bg-blue-100 text-blue-800",
        under_review: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        declined: "bg-red-100 text-red-800",
        enrolled: "bg-purple-100 text-purple-800",
    };

    const handleApprove = () => {
        // TODO: call applications.approve(applicationId)
        console.log("Approve", applicationId);
    };

    return (
        <div className="py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                {/* Back link */}
                <Link
                    href="/admin/applications"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Applications
                </Link>

                {/* Header */}
                <div className="mt-6 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-semibold">
                            {application.personalInfo.firstName[0]}
                            {application.personalInfo.lastName[0]}
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                {application.applicantName}
                            </h1>
                            <p className="text-sm text-gray-500">{application.email}</p>
                            <p className="mt-1 text-xs text-gray-400">
                                Application ID: {application.id} • Submitted:{" "}
                                {new Date(application.submittedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[application.status] ?? "bg-gray-100 text-gray-800"}`}
                    >
                        {application.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                </div>

                {/* Detail Sections */}
                <div className="mt-8 space-y-6">
                    {/* Personal Information */}
                    <section className="rounded-lg bg-white p-6 shadow">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Personal Information
                        </h2>
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {Object.entries(application.personalInfo).map(([key, value]) => (
                                <div key={key}>
                                    <dt className="text-sm font-medium text-gray-500 capitalize">
                                        {key.replace(/([A-Z])/g, " $1")}
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    {/* Educational Background */}
                    <section className="rounded-lg bg-white p-6 shadow">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Educational Background
                        </h2>
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {Object.entries(application.educationalBackground).map(
                                ([key, value]) => (
                                    <div key={key}>
                                        <dt className="text-sm font-medium text-gray-500 capitalize">
                                            {key.replace(/([A-Z])/g, " $1")}
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">{value}</dd>
                                    </div>
                                ),
                            )}
                        </dl>
                    </section>

                    {/* Payment Details */}
                    <section className="rounded-lg bg-white p-6 shadow">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Payment Details
                        </h2>
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                <dd className="mt-1">
                                    <span
                                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${application.payment.status === "paid"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                            }`}
                                    >
                                        {application.payment.status.charAt(0).toUpperCase() +
                                            application.payment.status.slice(1)}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    ₦{application.payment.amount.toLocaleString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Reference</dt>
                                <dd className="mt-1 text-sm text-gray-900 font-mono">
                                    {application.payment.reference}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Paid At</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {new Date(application.payment.paidAt).toLocaleString()}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </div>

                {/* Action Bar */}
                {canTakeAction && (
                    <div className="mt-8 flex items-center justify-end gap-3 rounded-lg bg-white p-4 shadow">
                        <button
                            type="button"
                            onClick={() => setShowDeclineDialog(true)}
                            className="inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Decline
                        </button>
                        <button
                            type="button"
                            onClick={handleApprove}
                            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                        </button>
                    </div>
                )}
            </div>

            <DeclineApplicationDialog
                open={showDeclineDialog}
                onOpenChange={setShowDeclineDialog}
                applicationId={applicationId}
                applicantName={application.applicantName}
            />
        </div>
    );
}
