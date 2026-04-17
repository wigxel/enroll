"use client";
import { useAction, useQuery } from "convex/react";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { usePaystackPayment } from "react-paystack";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "~/lib/utils";

export default function PaymentComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitAppId = searchParams.get("reference");

  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch application using the ID given in the reference
  const applicationResult = useQuery(
    api.applications.getApplicationForPayment,
    explicitAppId ? { applicationId: explicitAppId as any } : "skip",
  );

  // Fetch application fee from settings
  const appStatusResult = useQuery(api.settings.getAppStatus);

  const application_fee = appStatusResult?.success
    ? (appStatusResult.data?.applicationFeeAmount ?? 0)
    : 0;
  const formatted_fee: string = formatCurrency(application_fee);

  const application = applicationResult?.success
    ? applicationResult.data
    : null;

  const createIntent = useAction(api.payments.createIntent);

  const config = {
    reference: "",
    email: application?.applicantEmail ?? "",
    amount: application_fee * 100,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
  };
  const initializePayment = usePaystackPayment(config as any);

  // Loading states
  const isLoading = explicitAppId
    ? applicationResult === undefined || appStatusResult === undefined
    : false;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if application fee is configured - skip payment if no fee
  if (application_fee === 0) {
    router.push("/application/under-review");
    return null;
  }

  // Not found
  if (
    applicationResult?.success === false ||
    (applicationResult !== undefined && !application)
  ) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-gray-500">
        {applicationResult?.success === false
          ? applicationResult.error
          : "No pending application found or invalid reference."}
      </div>
    );
  }

  if (application.paymentStatus === "paid" || application.status !== "draft") {
    router.push("/application/under-review");
    return null;
  }

  const handlePayNow = async () => {
    try {
      setIsProcessing(true);

      const intentResponse = await createIntent({
        referenceId: application._id,
        referenceType: "application",
        amount: application_fee,
        currency: "NGN",
        email: application?.applicantEmail,
      });

      if (!intentResponse.success) {
        throw new Error(intentResponse.error);
      }

      const { paystackReference } = intentResponse.data;

      initializePayment({
        config: {
          ...config,
          reference: paystackReference,
        },
        onSuccess: () => {
          toast.success("Payment successful! Redirecting...", {
            id: "payment-confirm",
          });
          router.push("/application/under-review");
        },
        onClose: () => {
          toast("Payment cancelled");
          setIsProcessing(false);
        },
      });
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
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
        <h1 className="text-xl font-semibold text-gray-900">Application Fee</h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete payment to submit your application for review.
        </p>

        {/* Summary */}
        <div className="mt-6 rounded-xl bg-gray-50 p-4">
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Applicant</dt>
              <dd className="text-sm font-medium text-gray-900">
                {application.applicantName}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Application Number</dt>
              <dd className="text-sm font-mono text-gray-900">
                {application._id.slice(-8).toUpperCase()}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <dt className="text-sm font-medium text-gray-900">Total Due</dt>
              <dd className="text-lg font-bold text-gray-900">
                {formatted_fee}
              </dd>
            </div>
          </dl>
        </div>

        {/* Pay Button */}
        <button
          type="button"
          onClick={handlePayNow}
          disabled={isProcessing}
          className="mt-6 flex w-full flex-row items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
        >
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isProcessing ? "Processing..." : `Pay Now — ${formatted_fee}`}
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
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          onClick={(e) => {
            if (isProcessing) e.preventDefault();
          }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Application
        </Link>
      </div>
    </div>
  );
}
