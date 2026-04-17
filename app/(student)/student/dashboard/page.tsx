"use client";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { OnboardingChecklist } from "@/components/student/OnboardingChecklist";

const resourceCards = [
  {
    title: "Course Materials",
    description: "Access your course content, videos, and assignments.",
    icon: BookOpen,
    href: "#",
  },
  {
    title: "Class Schedule",
    description: "View your upcoming classes, exams, and deadlines.",
    icon: CalendarDays,
    href: "#",
  },
  {
    title: "Student Community",
    description: "Connect with fellow students and mentors.",
    icon: GraduationCap,
    href: "#",
  },
];

export default function StudentDashboardPage() {
  const router = useRouter();
  const userResult = useQuery(api.users.getCurrentUser);
  const user = userResult?.success ? userResult.data : null;
  const applicationResult = useQuery(api.applications.getMyApplication);
  const application = applicationResult?.success
    ? applicationResult.data
    : null;
  const enrollmentResult = useQuery(api.enrollments.get);
  const enrollment = enrollmentResult?.success ? enrollmentResult.data : null;

  useEffect(() => {
    if (applicationResult?.success && enrollmentResult?.success) {
      // If no application OR application is not 'approved' OR not enrolled,
      // they should be see the status/pending page instead of the dashboard.
      const isApprovedValue = application?.status === "approved";
      const isEnrolledValue = !!enrollment;

      if (!isApprovedValue || !isEnrolledValue) {
        router.replace("/student/courses");
      }
    }
  }, [applicationResult, enrollmentResult, application, enrollment, router]);

  if (
    userResult === undefined ||
    applicationResult === undefined ||
    enrollmentResult === undefined
  ) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Final safety check to prevent splash of content before redirect
  if (application?.status !== "approved" || !enrollment) {
    return null;
  }

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <title>Student Dashboard - Enrollment System</title>
      <OnboardingChecklist />
      <div className="rounded-2xl bg-linear-to-br from-primary/5 via-primary/2 to-transparent border border-primary/10 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {user.profileImage ? (
              <Image
                src={user.profileImage}
                alt={user.name}
                width={56}
                height={56}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold">{initials}</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              Welcome, {user.name}! 🎉
            </h1>
          </div>
        </div>
      </div>

      {/* Enrollment Summary */}
      {enrollment?.status !== "completed" ? (
        <section className="mt-8">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Enrollment Summary
            </h2>
            <Link
              href="/student/courses"
              className="inline-flex gap-1 items-center"
            >
              <span>View details</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-600">
                    {enrollment.status === "completed"
                      ? "Enrolled"
                      : "In Progress"}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cohort</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {enrollment.cohortName}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                  <CalendarDays className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Enrolled On</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {enrollment.completedAt
                      ? new Date(enrollment.completedAt).toLocaleDateString(
                          "en-NG",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )
                      : "In Progress"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Completion checklist */}
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              All Steps Completed
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Tuition Paid", done: enrollment.steps.tuitionPaid },
                { label: "Quiz Passed", done: enrollment.steps.quizPassed },
                {
                  label: "Documents Signed",
                  done: enrollment.steps.documentsSigned,
                },
              ].map((step) => (
                <div
                  key={step.label}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Student Resources */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">
          Student Resources
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Access your course materials and tools.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {resourceCards.map((card) => {
            const CardIcon = card.icon;
            return (
              <div
                key={card.title}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <CardIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-gray-900">
                  {card.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500">{card.description}</p>
                <p className="mt-3 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Coming soon →
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
