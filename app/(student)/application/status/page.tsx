"use client";

import Link from "next/link";
import { Clock, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

// TODO: Replace with Convex hook e.g. useQuery(api.applications.getOwnApplication)
function useOwnApplication() {
  return {
    id: "app_001",
    status: "approved" as
      | "submitted"
      | "under_review"
      | "approved"
      | "declined",
    paymentStatus: "paid" as "unpaid" | "paid",
    rejectionReason: null as string | null,
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    data: {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      dateOfBirth: "1998-04-15",
      phoneNumber: "+234 800 123 4567",
      address: "12 Marina Street, Lagos",
      educationalBackground: "B.Sc Computer Science, University of Lagos",
      course: "Full-Stack Web Development",
    },
  };
}

const statusConfig = {
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

export default function ApplicationStatusPage() {
  const application = useOwnApplication();
  const [showSummary, setShowSummary] = useState(false);
  const config = statusConfig[application.status];
  const StatusIcon = config.icon;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-lg">
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
            {application.status === "under_review" && (
              <p className="text-xs text-gray-500">
                Reviews typically take 3–5 business days. You'll be notified
                once a decision has been made.
              </p>
            )}

            {application.status === "approved" && (
              <Link
                href="/enrollment"
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
                      💰 Your application fee has been refunded. Please allow
                      5–10 business days for processing.
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
                {Object.entries(application.data).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2.5">
                    <dt className="text-sm text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Submitted info */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Submitted on{" "}
          {new Date(application.submittedAt).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
