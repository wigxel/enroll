"use client";

import { useAction, useQuery } from "convex/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { usePaystackPayment } from "react-paystack";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { formatCurrency } from "~/lib/utils";

interface TuitionPaymentButtonProps {
  enrollment: {
    _id: string;
    courseId: Id<"courses">;
    steps: {
      tuitionPaid: boolean;
    };
  };
  userEmail?: string;
}

export default function TuitionPaymentButton({
  enrollment,
  userEmail,
}: TuitionPaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const toastId = "tuition-payment";
  const interval = useRef<NodeJS.Timeout>(null);

  const courseResult = useQuery(api.courses.getById, {
    courseId: enrollment.courseId,
  });

  const createIntent = useAction(api.payments.createIntent);

  const course = courseResult?.success ? courseResult.data : null;
  const tuitionFee = course?.tuitionFee ?? 0;
  const formattedFee = formatCurrency(tuitionFee);
  const config = {
    reference: "",
    email: userEmail ?? "",
    amount: tuitionFee * 100,
  };
  const initializePayment = usePaystackPayment(config as any);

  const handlePayNow = useCallback(async () => {
    try {
      setIsProcessing(true);

      const intentResult = await createIntent({
        referenceId: enrollment._id,
        referenceType: "tuition",
        amount: tuitionFee,
        currency: "NGN",
        email: userEmail,
      });

      if (!intentResult.success) {
        throw new Error(intentResult.error);
      }

      const { paystackReference } = intentResult.data;

      initializePayment({
        config: {
          reference: paystackReference,
          email: userEmail ?? "",
          publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          amount: tuitionFee * 100,
        } as any,
        onSuccess: () => {
          let count = 30;

          toast.loading(`Processing payment... (${count}s)`, { id: toastId });

          interval.current = setInterval(() => {
            // Check if tuitionPaid already became true
            count--;
            if (count > 0) {
              toast.loading(`Processing payment... (${count}s)`, {
                id: toastId,
              });
            } else {
              // @ts-expect-error Interval timer
              clearInterval(interval.current);
              toast(
                "Confirmation is taking longer than expected. Please contact support or try refreshing.",
                { id: toastId, duration: 8000 },
              );
            }
          }, 1000);

          // Note: No confirmPayment call here!
          // Webhook will update tuitionPaid reactively
          // Convex useQuery will auto-update the button state
        },
        onClose: () => {
          toast("Payment cancelled");
          setIsProcessing(false);
        },
      });
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to initiate payment. Please try again.",
      );
      setIsProcessing(false);
    }
  }, [createIntent, enrollment._id, tuitionFee, userEmail, initializePayment]);

  React.useEffect(() => {
    if (enrollment.steps.tuitionPaid) {
      // @ts-expect-error Interval timer
      clearInterval(interval.current);
      toast.success("Payment successful!", { id: toastId });
      setIsProcessing(false);
      return;
    }
  }, [enrollment]);

  if (enrollment.steps.tuitionPaid) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 font-medium">
        <CheckCircle2 className="h-4 w-4" />
        <span>Tuition Paid</span>
      </div>
    );
  }

  if (courseResult !== undefined && !courseResult.success) {
    return <span className="text-xs text-red-500">Failed to load fee</span>;
  }

  if (courseResult === undefined || isProcessing) {
    return (
      <Button disabled className="w-full sm:w-auto">
        <Loader2 className="h-4 w-4 animate-spin" />
        {courseResult === undefined ? "Loading..." : "Processing..."}
      </Button>
    );
  }

  return (
    <Button onClick={handlePayNow} className="w-full sm:w-auto">
      <span>Pay Now — {formattedFee}</span>
    </Button>
  );
}
