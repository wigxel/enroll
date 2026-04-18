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
import { OnboardingChecklist } from "@/components/student/OnboardingChecklist";
import { api } from "@/convex/_generated/api";

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

function DashboardStats() {
  const enrollmentsResult = useQuery(api.enrollments.getAll);
  const enrollments = enrollmentsResult?.success ? enrollmentsResult.data : [];
  const pendingEnrollments = enrollments.filter((e) => e.status === "pending");
  const completedEnrollments = enrollments.filter(
    (e) => e.status === "completed",
  );

  if (enrollmentsResult === undefined) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pendingEnrollments.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active Courses</p>
              <p className="text-xl font-bold text-gray-900">
                {pendingEnrollments.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {completedEnrollments.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Completed Courses</p>
              <p className="text-xl font-bold text-gray-900">
                {completedEnrollments.length}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
            <GraduationCap className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Enrolled</p>
            <p className="text-xl font-bold text-gray-900">
              {enrollments.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentEnrollments() {
  const enrollmentsResult = useQuery(api.enrollments.getAll);
  const enrollments = enrollmentsResult?.success ? enrollmentsResult.data : [];

  if (enrollmentsResult === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (enrollments.length === 0) return null;

  return (
    <div className="space-y-3">
      {enrollments.slice(0, 3).map((enrollment) => (
        <Link
          key={enrollment._id}
          href={`/student/courses/${enrollment.courseSlug}`}
          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white hover:border-primary/30 transition-colors"
        >
          <div>
            <p className="font-medium text-gray-900">{enrollment.courseName}</p>
            <p className="text-sm text-gray-500">{enrollment.cohortName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${enrollment.status === "completed"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-blue-100 text-blue-700"
                }`}
            >
              {enrollment.status === "completed" ? "Completed" : "In Progress"}
            </span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </div>
        </Link>
      ))}
    </div>
  );
}

function DashboardResources() {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-gray-900">Student Resources</h2>
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
  );
}

export default function StudentDashboardPage() {
  const userResult = useQuery(api.users.getCurrentUser);
  const enrollmentsResult = useQuery(api.enrollments.getAll);

  if (userResult === undefined || enrollmentsResult === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const enrollments = enrollmentsResult?.success ? enrollmentsResult.data : [];

  if (enrollments.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const user = userResult?.success ? userResult.data : null;
  if (!user) return null;

  const pendingEnrollments = enrollments.filter((e) => e.status === "pending");
  const completedEnrollments = enrollments.filter(
    (e) => e.status === "completed",
  );
  const activeEnrollment = pendingEnrollments[0] || completedEnrollments[0];

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

      {activeEnrollment && (
        <OnboardingChecklist enrollment={activeEnrollment} />
      )}

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

      <section className="mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
          <Link
            href="/student/courses"
            className="inline-flex gap-1 items-center"
          >
            <span>View all</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4">
          <DashboardStats />
        </div>

        <div className="mt-8">
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <RecentEnrollments />
        </div>
      </section>

      <DashboardResources />
    </div>
  );
}
