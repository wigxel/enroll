"use client";
import { useUser } from "@clerk/nextjs";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import TuitionPaymentButton from "@/components/payments/TuitionPaymentButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { safeObj } from "~/lib/data.helpers";

interface EnrollmentStep {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: typeof CreditCard;
  href: string;
  completed: boolean;
}

function getStepStatus(
  steps: {
    tuitionPaid: boolean;
    quizPassed: boolean;
    documentsSigned: boolean;
  },
  stepIndex: number,
  quizRequired: boolean,
): "completed" | "current" | "locked" {
  const stepKeys = quizRequired
    ? (["tuitionPaid", "quizPassed", "documentsSigned"] as const)
    : (["tuitionPaid", "documentsSigned"] as const);

  if (stepKeys[stepIndex] && steps[stepKeys[stepIndex]]) return "completed";

  const firstIncompleteIndex = stepKeys.findIndex((key) => !steps[key]);
  if (firstIncompleteIndex === stepIndex) return "current";

  return "locked";
}

export default function EnrollmentChecklistPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseIdParam = searchParams.get("courseId");
  const { user } = useUser();

  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const enrollmentsResult = useQuery(api.enrollments.getAll);
  const updateStep = useMutation(api.enrollments.updateStep);
  const completeEnrollment = useMutation(api.enrollments.complete);

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  // Process enrollments after data is loaded
  const allEnrollments = enrollmentsResult?.success
    ? enrollmentsResult.data
    : [];

  const pendingEnrollments = allEnrollments.filter(
    (e) => e.status === "pending",
  );

  const targetEnrollment = courseIdParam
    ? pendingEnrollments.find((e) => e.courseId === courseIdParam)
    : pendingEnrollments[0];

  // Handle redirects
  useEffect(() => {
    if (enrollmentsResult === undefined) return;

    // No pending enrollments -> go to courses
    if (pendingEnrollments.length === 0) {
      router.replace("/student/courses");
      return;
    }

    // Invalid courseId param provided -> go to courses
    if (courseIdParam && !targetEnrollment) {
      router.replace("/student/courses");
      return;
    }

    // Already completed -> go to course page
    if (
      targetEnrollment &&
      targetEnrollment.status === "completed" &&
      targetEnrollment.courseSlug
    ) {
      const slug = String(targetEnrollment.courseSlug);
      router.replace(`/student/courses/${slug}`);
      return;
    }
  }, [
    enrollmentsResult,
    pendingEnrollments,
    courseIdParam,
    targetEnrollment,
    router,
  ]);

  if (enrollmentsResult === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!targetEnrollment) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const enrollment = safeObj(targetEnrollment);
  const enrollment_steps = {
    tuitionPaid: false,
    quizPassed: false,
    ...safeObj(enrollment.steps),
  };

  const handleSignDocuments = async () => {
    setIsSigning(true);

    try {
      const stepRes = await updateStep({
        enrollmentId: enrollment._id,
        step: "documentsSigned",
        value: true,
      });

      if (!stepRes.success) throw new Error(stepRes.error);

      if (enrollment_steps.tuitionPaid && enrollment_steps.quizPassed) {
        await completeEnrollment({ enrollmentId: enrollment._id });
        setIsSignModalOpen(false);
        if (enrollment.courseSlug) {
          router.push(`/student/courses/${enrollment.courseSlug}`);
        } else {
          router.push("/student/courses");
        }
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

  const quizRequired = (enrollment as any)?.quizRequired ?? false;

  const stepsToComplete = [
    enrollment_steps.tuitionPaid,
    quizRequired && enrollment_steps.quizPassed,
    enrollment_steps.documentsSigned,
  ].filter(Boolean).length;

  const completedCount = stepsToComplete;
  const totalSteps = quizRequired ? 3 : 2;
  const progressPercent = (completedCount / totalSteps) * 100;

  const stepDefinitions: Omit<EnrollmentStep, "completed">[] = [
    {
      id: "tuition",
      number: 1,
      title: "Pay Tuition",
      description:
        "Complete your tuition payment to secure your spot in the program.",
      icon: CreditCard,
      href: "/students/courses#pending",
    },
    ...(quizRequired
      ? [
          {
            id: "quiz",
            number: 2,
            title: "Complete Orientation Quiz",
            description:
              "Take the orientation assessment to demonstrate your readiness.",
            icon: BookOpen,
            href: `/student/enrollment/quiz?courseId=${enrollment.courseId}`,
          },
        ]
      : []),
    {
      id: "documents",
      number: quizRequired ? 3 : 2,
      title: "Sign Documents",
      description:
        "Review and sign the enrollment agreement and policy documents.",
      icon: FileSignature,
      href: `/student/enrollment/documents?courseId=${enrollment.courseId}`,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Complete Your Enrollment
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Congratulations on your approval! Complete the steps below to finalize
          your enrollment.
        </p>
      </div>

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

      <div className="mt-8 space-y-4">
        {stepDefinitions.map((step, index) => {
          const status = getStepStatus(enrollment_steps, index, quizRequired);
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

                {isCurrent &&
                  (step.id === "documents" ? (
                    <button
                      type="button"
                      onClick={() => setIsSignModalOpen(true)}
                      className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    >
                      Sign Now
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : step.id === "tuition" ? (
                    <TuitionPaymentButton
                      enrollment={{
                        _id: enrollment._id,
                        courseId: enrollment.courseId,
                        steps: enrollment_steps,
                      }}
                      userEmail={userEmail}
                    />
                  ) : (
                    <Link
                      // @ts-expect-error Not a problem
                      href={step.href}
                      className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    >
                      Continue
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Section - Show when all steps are done */}
      {completedCount === totalSteps && (
        <div className="mt-8 p-6 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
            <h3 className="mt-4 text-lg font-semibold text-emerald-900">
              You're all set!
            </h3>
            <p className="mt-2 text-sm text-emerald-700">
              You've completed all enrollment steps.
            </p>
            <Link
              href={
                enrollment.courseSlug
                  ? `/student/courses/${enrollment.courseSlug}`
                  : "/student/courses"
              }
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
            >
              Go to Course
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <Dialog open={isSignModalOpen} onOpenChange={setIsSignModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <ScrollText className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">
              Enrollment Agreement
            </DialogTitle>
            <DialogDescription className="text-center">
              Please review the terms and conditions carefully before signing.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/50 p-6 my-4 text-sm text-gray-600 space-y-4">
            <h4 className="font-semibold text-gray-900">
              1. Program Commitment
            </h4>
            <p>
              By signing this agreement, you commit to actively participating in
              the Enrolled curriculum, including all mandatory sessions,
              assessments, and capstone projects.
            </p>

            <h4 className="font-semibold text-gray-900">2. Code of Conduct</h4>
            <p>
              We maintain a rigorous standard of academic integrity. Plagiarism,
              cheating, or disruptive behavior may result in immediate
              termination from the program without refund.
            </p>

            <h4 className="font-semibold text-gray-900">
              3. Tuition & Refund Policy
            </h4>
            <p>
              Tuition is non-refundable after the first 14 days of the cohort
              start date. If you opt for an installments plan, failure to meet
              deadlines will result in temporary suspension of LMS access.
            </p>

            <h4 className="font-semibold text-gray-900">
              4. Intellectual Property
            </h4>
            <p>
              Any curriculum materials, LMS access, and recorded lectures are
              the intellectual property of Enrollment Platform. You may not
              distribute or replicate them externally.
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
