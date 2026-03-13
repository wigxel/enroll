"use client";

import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CreditCard,
  FileSignature,
  Loader2,
  Lock,
  ScrollText,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";

interface EnrollmentStep {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: typeof CreditCard;
  href: string;
  completed: boolean;
}

// We will use the live Convex query `api.enrollments.get` inside the component instead of this mock.

function getStepStatus(
  steps: {
    tuitionPaid: boolean;
    quizPassed: boolean;
    documentsSigned: boolean;
  },
  stepIndex: number,
): "completed" | "current" | "locked" {
  const stepKeys = ["tuitionPaid", "quizPassed", "documentsSigned"] as const;
  if (steps[stepKeys[stepIndex]]) return "completed";

  // Current step is the first incomplete step
  const firstIncompleteIndex = stepKeys.findIndex((key) => !steps[key]);
  if (firstIncompleteIndex === stepIndex) return "current";

  return "locked";
}

export default function EnrollmentChecklistPage() {
  const enrollmentResult = useQuery(api.enrollments.get);
  const updateStep = useMutation(api.enrollments.updateStep);
  const completeEnrollment = useMutation(api.enrollments.complete);

  const enrollment = enrollmentResult?.success ? enrollmentResult.data : null;

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  if (enrollmentResult === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-gray-500">
        {enrollmentResult?.success === false ? enrollmentResult.error : "No enrollment record found."}
      </div>
    );
  }

  const handleSignDocuments = async () => {
    setIsSigning(true);
    try {
      // Mark step as complete
      const stepRes = await updateStep({
        enrollmentId: enrollment._id,
        step: "documentsSigned",
        value: true,
      });

      if (!stepRes.success) throw new Error(stepRes.error);

      // Check if this was the last step
      if (enrollment.steps.tuitionPaid && enrollment.steps.quizPassed) {
        toast.promise(
          async () => {
            const res = await completeEnrollment({ enrollmentId: enrollment._id });
            if (!res.success) throw new Error(res.error);
            return res.data;
          },
          {
            loading: "Finalizing enrollment...",
            success: () => {
              setIsSignModalOpen(false);
              return "Enrollment complete! Welcome aboard 🎉";
            },
            error: (err) => err.message || "Failed to finalize enrollment.",
          }
        );
      } else {
        toast.success("Documents signed successfully!");
        setIsSignModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to sign documents:", error);
      toast.error("Failed to sign documents.");
    } finally {
      setIsSigning(false);
    }
  };

  const completedCount = Object.values(enrollment.steps).filter(Boolean).length;
  const totalSteps = 3;
  const progressPercent = (completedCount / totalSteps) * 100;

  const stepDefinitions: Omit<EnrollmentStep, "completed">[] = [
    {
      id: "tuition",
      number: 1,
      title: "Pay Tuition",
      description:
        "Complete your tuition payment to secure your spot in the program.",
      icon: CreditCard,
      href: "/student/enrollment/tuition",
    },
    {
      id: "quiz",
      number: 2,
      title: "Complete Orientation Quiz",
      description:
        "Take the orientation assessment to demonstrate your readiness.",
      icon: BookOpen,
      href: "/student/enrollment/quiz",
    },
    {
      id: "documents",
      number: 3,
      title: "Sign Documents",
      description:
        "Review and sign the enrollment agreement and policy documents.",
      icon: FileSignature,
      href: "/student/enrollment/documents",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Complete Your Enrollment
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Congratulations on your approval! Complete the steps below to finalize
          your enrollment.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-8">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Progress</span>
          <span className="text-gray-500">
            {completedCount} of {totalSteps} steps complete
          </span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step cards */}
      <div className="mt-8 space-y-4">
        {stepDefinitions.map((step, index) => {
          const status = getStepStatus(enrollment.steps, index);
          const StepIcon = step.icon;
          const isLocked = status === "locked";
          const isCompleted = status === "completed";
          const isCurrent = status === "current";

          return (
            <div
              key={step.id}
              className={`rounded-xl border p-5 transition-all ${isCompleted
                ? "border-emerald-200 bg-emerald-50/50"
                : isCurrent
                  ? "border-primary/30 bg-white shadow-sm ring-1 ring-primary/10"
                  : "border-gray-200 bg-gray-50/50 opacity-60"
                }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isCompleted
                    ? "bg-emerald-100 text-emerald-600"
                    : isCurrent
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-200 text-gray-400"
                    }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isLocked ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">
                      Step {step.number}
                    </span>
                    {isCompleted && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Completed
                      </span>
                    )}
                    {isCurrent && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        Start Now
                      </span>
                    )}
                    {isLocked && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                        Locked
                      </span>
                    )}
                  </div>
                  <h3
                    className={`mt-1 text-sm font-semibold ${isLocked ? "text-gray-400" : "text-gray-900"
                      }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`mt-0.5 text-xs ${isLocked ? "text-gray-400" : "text-gray-500"
                      }`}
                  >
                    {step.description}
                  </p>
                </div>

                {/* CTA */}
                {isCurrent && (
                  step.id === "documents" ? (
                      <button
                        type="button"
                        onClick={() => setIsSignModalOpen(true)}
                        className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                      >
                        Sign Now
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <Link
                        href={step.href}
                        className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                      >
                        Continue
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Signature Modal */}
      <Dialog open={isSignModalOpen} onOpenChange={setIsSignModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <ScrollText className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">Enrollment Agreement</DialogTitle>
            <DialogDescription className="text-center">
              Please review the terms and conditions carefully before signing.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/50 p-6 my-4 text-sm text-gray-600 space-y-4">
            <h4 className="font-semibold text-gray-900">1. Program Commitment</h4>
            <p>
              By signing this agreement, you commit to actively participating in the Enrolled curriculum, including all mandatory sessions, assessments, and capstone projects.
            </p>

            <h4 className="font-semibold text-gray-900">2. Code of Conduct</h4>
            <p>
              We maintain a rigorous standard of academic integrity. Plagiarism, cheating, or disruptive behavior may result in immediate termination from the program without refund.
            </p>

            <h4 className="font-semibold text-gray-900">3. Tuition & Refund Policy</h4>
            <p>
              Tuition is non-refundable after the first 14 days of the cohort start date. If you opt for an installments plan, failure to meet deadlines will result in temporary suspension of LMS access.
            </p>

            <h4 className="font-semibold text-gray-900">4. Intellectual Property</h4>
            <p>
              Any curriculum materials, LMS access, and recorded lectures are the intellectual property of Enrollment Platform. You may not distribute or replicate them externally.
            </p>
          </div>

          <DialogFooter className="sm:justify-between items-center bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg border-t border-gray-200">
            <p className="text-xs text-gray-500">
              By clicking agree, you acknowledge these legally binding terms.
            </p>
            <button
              type="button"
              disabled={isSigning}
              onClick={handleSignDocuments}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSigning ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSigning ? "Signing..." : "I Agree & Sign"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
