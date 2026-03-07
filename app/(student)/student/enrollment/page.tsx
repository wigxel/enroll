"use client";

import Link from "next/link";
import {
  CreditCard,
  BookOpen,
  FileSignature,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";

interface EnrollmentStep {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: typeof CreditCard;
  href: string;
  completed: boolean;
}

// TODO: Replace with Convex hook e.g. useQuery(api.enrollments.getOwnEnrollment)
function useOwnEnrollment() {
  return {
    id: "enr_001",
    status: "pending" as "pending" | "completed",
    steps: {
      tuitionPaid: true,
      quizPassed: false,
      documentsSigned: false,
    },
  };
}

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
  const enrollment = useOwnEnrollment();

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
      href: "/enrollment/tuition",
    },
    {
      id: "quiz",
      number: 2,
      title: "Complete Orientation Quiz",
      description:
        "Take the orientation assessment to demonstrate your readiness.",
      icon: BookOpen,
      href: "/enrollment/quiz",
    },
    {
      id: "documents",
      number: 3,
      title: "Sign Documents",
      description:
        "Review and sign the enrollment agreement and policy documents.",
      icon: FileSignature,
      href: "/enrollment/documents",
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
              className={`rounded-xl border p-5 transition-all ${
                isCompleted
                  ? "border-emerald-200 bg-emerald-50/50"
                  : isCurrent
                    ? "border-primary/30 bg-white shadow-sm ring-1 ring-primary/10"
                    : "border-gray-200 bg-gray-50/50 opacity-60"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    isCompleted
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
                    className={`mt-1 text-sm font-semibold ${
                      isLocked ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`mt-0.5 text-xs ${
                      isLocked ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>

                {/* CTA */}
                {isCurrent && (
                  <Link
                    href={step.href}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                  >
                    Continue
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
