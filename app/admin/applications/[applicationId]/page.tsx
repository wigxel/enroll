"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { DeclineApplicationDialog } from "~/components/admin/dialogs/DeclineApplicationDialog";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

export default function ApplicationDetailPage() {
  const params = useParams();
  const _router = useRouter();
  const applicationId = params.applicationId as Id<"applications">;

  const applicationResult = useQuery(api.applications.getById, { applicationId });
  const application = applicationResult?.success ? applicationResult.data : null;
  const approveMutation = useMutation(api.applications.approve);

  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    submitted: "bg-blue-100 text-blue-800",
    under_review: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
    enrolled: "bg-purple-100 text-purple-800",
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await approveMutation({ applicationId });
      if (!res.success) {
        throw new Error(res.error);
      }
    } catch (error: any) {
      console.error("Failed to approve application:", error);
      alert(error.message || "Failed to approve application");
    } finally {
      setIsApproving(false);
    }
  };

  // Loading state
  if (applicationResult === undefined) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Not found state
  if (!application) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Application Not Found
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {applicationResult?.success === false
              ? applicationResult.error
              : "The application you are looking for does not exist or has been removed."}
          </p>
          <Link
            href="/admin/applications"
            className="mt-4 inline-flex items-center text-sm text-primary hover:text-primary/80"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const canTakeAction =
    application.status === "submitted" || application.status === "under_review";
  const applicantName = `${application.data.firstName} ${application.data.lastName}`;
  const initials = `${application.data.firstName[0]}${application.data.lastName[0]}`;

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
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {applicantName}
              </h1>
              <p className="text-sm text-gray-500">{application.data.email}</p>
              <p className="mt-1 text-xs text-gray-400">
                Course: {application.courseName} • Submitted:{" "}
                {application.submittedAt
                  ? new Date(application.submittedAt).toLocaleDateString()
                  : "Not yet"}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[application.status] ?? "bg-gray-100 text-gray-800"}`}
          >
            {application.status
              .replace("_", " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        </div>

        {/* Detail Sections */}
        <div className="mt-8 space-y-6">
          {/* Application Details */}
          <section className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Application Details
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Course Applied For
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {application.courseName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Date Submitted
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.submittedAt
                    ? new Date(application.submittedAt).toLocaleDateString()
                    : "Not yet submitted"}
                </dd>
              </div>
            </dl>
          </section>

          {/* Personal Information */}
          <section className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Personal Information
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  First Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.data.firstName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.data.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Date of Birth
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.data.dateOfBirth}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Phone Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.data.phoneNumber}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.data.address}
                </dd>
              </div>
            </dl>
          </section>

          {/* Educational Background */}
          <section className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Educational Background
            </h2>
            <p className="text-sm text-gray-900">
              {application.data.educationalBackground}
            </p>
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
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${application.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {application.paymentStatus.charAt(0).toUpperCase() +
                      application.paymentStatus.slice(1)}
                  </span>
                </dd>
              </div>
              {application.payment && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Amount
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      ₦{application.payment.amount.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Reference
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">
                      {application.payment.stripePaymentIntentId}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Paid At
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(application.payment.createdAt).toLocaleString()}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </section>

          {/* Rejection Reason (if declined) */}
          {application.status === "declined" && application.rejectionReason && (
            <section className="rounded-lg border border-red-200 bg-red-50 p-6">
              <h2 className="text-lg font-medium text-red-900 mb-2">
                Rejection Reason
              </h2>
              <p className="text-sm text-red-800">
                {application.rejectionReason}
              </p>
            </section>
          )}
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
              disabled={isApproving}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {isApproving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Approve
            </button>
          </div>
        )}
      </div>

      <DeclineApplicationDialog
        open={showDeclineDialog}
        onOpenChange={setShowDeclineDialog}
        applicationId={applicationId}
        applicantName={applicantName}
      />
    </div>
  );
}
