"use client";

import {
  CheckCircle2,
  ChevronDown,
  Clock,
  PlusCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";

interface ApplicationStatusViewProps {
  application: any; // Using any for brevity or specific type if needed
}

const statusConfig: Record<string, any> = {
  draft: {
    icon: Clock,
    iconColor: "text-gray-400",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    badgeColor: "bg-gray-100 text-gray-700",
    title: "Draft Application",
    message: "You have an application in progress. Complete it to submit.",
  },
  submitted: {
    icon: Clock,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeColor: "bg-blue-100 text-blue-700",
    title: "Application Submitted",
    message: "Your application has been submitted and is awaiting review.",
  },
  under_review: {
    icon: Clock,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    badgeColor: "bg-amber-100 text-amber-700",
    title: "Under Review",
    message:
      "Your application is currently being reviewed by our admissions team.",
  },
  approved: {
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    badgeColor: "bg-emerald-100 text-emerald-700",
    title: "Application Approved",
    message:
      "Congratulations! Your application has been approved. You can now begin your enrollment.",
  },
  declined: {
    icon: XCircle,
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeColor: "bg-red-100 text-red-700",
    title: "Application Declined",
    message: "Unfortunately, your application was not successful.",
  },
};

export function ApplicationStatusView({
  application,
}: ApplicationStatusViewProps) {
  const [showSummary, setShowSummary] = useState(false);
  const appStatusResult = useQuery(api.settings.getAppStatus);
  const hasApplicationFee = appStatusResult?.success
    ? (appStatusResult.data?.applicationFeeAmount ?? 0) > 0
    : false;
  const isLoadingAppStatus = appStatusResult === undefined;

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <PlusCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          No Application Found
        </h2>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          It looks like you haven&apos;t started an application yet. Apply now
          to join our next cohort!
        </p>
        <Link
          href="/application"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Start Application
        </Link>
      </div>
    );
  }

  const config = statusConfig[application.status] || statusConfig.submitted;
  const StatusIcon = config.icon;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Status Card */}
      <div
        className={`rounded-2xl border ${config.borderColor} ${config.bgColor} p-8 text-center shadow-sm`}
      >
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm`}
        >
          <StatusIcon className={`h-8 w-8 ${config.iconColor}`} />
        </div>

        <span
          className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${config.badgeColor}`}
        >
          {config.title}
        </span>

        <p className="mt-3 text-sm text-gray-600">{config.message}</p>

        {/* Details panel */}
        <div className="mt-6">
          {application.status === "draft" && !isLoadingAppStatus && (
            <Link
              href={
                application.paymentStatus === "unpaid" && hasApplicationFee
                  ? `/application/pay?applicationId=${application._id}`
                  : "/application"
              }
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              {application.paymentStatus === "unpaid" && hasApplicationFee
                ? "Pay Application Fee"
                : "Continue Application"}
            </Link>
          )}

          {application.status === "under_review" && (
            <p className="text-xs text-gray-500">
              Reviews typically take 3–5 business days. You&apos;ll be notified
              once a decision has been made.
            </p>
          )}

          {application.status === "approved" && (
            <Link
              href="/student/enrollment"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Begin Enrollment →
            </Link>
          )}

          {application.status === "declined" && (
            <div className="space-y-3">
              {application.rejectionReason && (
                <div className="rounded-lg bg-white/60 px-4 py-3 text-left">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    {application.rejectionReason}
                  </p>
                </div>
              )}
              {application.paymentStatus === "paid" && (
                <div className="rounded-lg bg-white/60 px-4 py-3 text-left">
                  <p className="text-xs font-medium text-emerald-600">
                    💰 Your application fee has been refunded. Please allow 5–10
                    business days for processing.
                  </p>
                </div>
              )}
              <a
                href="mailto:support@enrollment.com"
                className="inline-block text-sm font-medium text-primary hover:underline"
              >
                Contact Us
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Application Summary */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowSummary(!showSummary)}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 text-left shadow-sm transition-colors hover:bg-gray-50"
        >
          <span className="text-sm font-medium text-gray-900">
            Application Summary
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${
              showSummary ? "rotate-180" : ""
            }`}
          />
        </button>

        {showSummary && (
          <div className="mt-2 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <dl className="divide-y divide-gray-100">
              <div className="flex justify-between py-2.5">
                <dt className="text-sm text-gray-500 capitalize">Course</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {application.courseName}
                </dd>
              </div>
              {Object.entries(application.data)
                .filter(([key]) => key !== "courseId")
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2.5">
                    <dt className="text-sm text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {value as string}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>
        )}
      </div>

      {/* Submitted info */}
      <p className="mt-4 text-center text-xs text-gray-400">
        {application.submittedAt ? (
          <>
            Submitted on{" "}
            {new Date(application.submittedAt).toLocaleDateString("en-NG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </>
        ) : (
          "Application not yet submitted"
        )}
      </p>
    </div>
  );
}
