"use client";

import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

// TODO: Replace with Convex hook e.g. useQuery(api.applications.getOwnApplication)
function usePaymentInfo() {
  return {
    applicationId: "app_001",
    applicantName: "Jane Doe",
    reference: "ENR-2026-001",
    feeAmount: 15000,
    currency: "₦",
    status: "unpaid" as "unpaid" | "paid",
  };
}

export default function ApplicationPaymentPage() {
  const payment = usePaymentInfo();

  const handlePayNow = () => {
    // TODO: Integrate with Paystack inline popup
    // PaystackPop.setup({ key, email, amount, callback, onClose })
    console.log("Paystack payment initiated for", payment.applicationId);
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        {/* Progress breadcrumb */}
        <div className="mb-8 flex items-center justify-center gap-2 text-sm">
          <span className="text-gray-400">Application</span>
          <span className="text-gray-300">→</span>
          <span className="font-semibold text-primary">Payment</span>
          <span className="text-gray-300">→</span>
          <span className="text-gray-400">Under Review</span>
        </div>

        {/* Payment Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            Application Fee
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Complete payment to submit your application for review.
          </p>

          {/* Summary */}
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Applicant</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {payment.applicantName}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Reference</dt>
                <dd className="text-sm font-mono text-gray-900">
                  {payment.reference}
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <dt className="text-sm font-medium text-gray-900">Total Due</dt>
                <dd className="text-lg font-bold text-gray-900">
                  {payment.currency}
                  {payment.feeAmount.toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Pay Button */}
          <button
            type="button"
            onClick={handlePayNow}
            className="mt-6 flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            Pay Now — {payment.currency}
            {payment.feeAmount.toLocaleString()}
          </button>

          {/* Security note */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <Shield className="h-3.5 w-3.5" />
            <span>Secured by Paystack</span>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/application"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Application
          </Link>
        </div>
      </div>
    </div>
  );
}
