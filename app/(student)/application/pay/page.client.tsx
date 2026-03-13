"use client";
import Link from "next/link";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePaystackPayment } from "react-paystack";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

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

  const application = applicationResult?.success ? applicationResult.data : null;

  const createIntent = useAction(api.payments.createIntent);
  const confirmPayment = useMutation(api.payments.confirm);

  const config = {
    reference: "", // Will be set dynamically before initialization
    email: application?.applicantEmail ?? "",
    amount: 15000 * 100, // 15,000 NGN in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
  };
  const initializePayment = usePaystackPayment(config as any);

  // Loading states
  const isLoading = explicitAppId ? applicationResult === undefined : false;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not found
  if (applicationResult?.success === false || (applicationResult !== undefined && !application)) {
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

      // 1. Create intent via Convex
      const intentResponse = await createIntent({
        referenceId: application._id,
        referenceType: "application",
        amount: 15000,
        currency: "NGN",
      });

      if (!intentResponse.success) {
        throw new Error(intentResponse.error);
      }

      // 2. Setup dynamic config for this transaction
      const dynamicConfig = {
        ...config,
        reference: intentResponse.data.stripePaymentIntentId, // Using this as our Paystack reference
      };

      // 3. Initialize Paystack
      initializePayment({
        config: dynamicConfig,
        onSuccess: async (referenceData: any) => {
          try {
            toast.loading("Confirming payment...", { id: "payment-confirm" });
            const confirmRes = await confirmPayment({
              stripePaymentIntentId: referenceData.reference,
              status: "succeeded",
            });
            if (!confirmRes.success) {
              throw new Error(confirmRes.error);
            }
            toast.success("Payment successful!", { id: "payment-confirm" });
            // Assuming this automatically gets submitted or we just redirect
            router.push("/application/under-review");
          } catch (error) {
            console.error("Confirmation error:", error);
            toast.error("Failed to confirm payment status.", {
              id: "payment-confirm",
            });
          } finally {
            setIsProcessing(false);
          }
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
              <dd className="text-lg font-bold text-gray-900">₦15,000</dd>
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
          {isProcessing ? "Processing..." : "Pay Now — ₦15,000"}
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
