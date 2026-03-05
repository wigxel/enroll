"use client";

import { useEffect } from "react";

import {
  GraduationCap,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  User,
} from "lucide-react";

// TODO: Replace with Convex hook e.g. useQuery(api.users.getCurrentUserWithRole)
function useCurrentStudent() {
  return {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    profileImage: null as string | null,
    initials: "JD",
  };
}

// TODO: Replace with Convex hook e.g. useQuery(api.enrollments.getOwnEnrollment)
function useStudentEnrollment() {
  return {
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    course: "Full-Stack Web Development",
    cohort: "Spring 2026",
    steps: {
      tuitionPaid: true,
      quizPassed: true,
      documentsSigned: true,
    },
  };
}

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
  const student = useCurrentStudent();
  const enrollment = useStudentEnrollment();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <title>Student Dashboard - Enrollment System</title>
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent border border-primary/10 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {student.profileImage ? (
              <img
                src={student.profileImage}
                alt={student.name}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold">{student.initials}</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              Welcome, {student.name}! 🎉
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              You are now enrolled in{" "}
              <span className="font-medium text-gray-700">
                {enrollment.course}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Enrollment Summary */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">
          Enrollment Summary
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Enrollment Status</p>
                <p className="text-sm font-semibold text-emerald-600">
                  Completed
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
                  {enrollment.cohort}
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
                  {new Date(enrollment.completedAt).toLocaleDateString(
                    "en-NG",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
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

      {/* Profile Preview */}
      <section className="mt-10">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {student.profileImage ? (
                <img
                  src={student.profileImage}
                  alt={student.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {student.name}
              </p>
              <p className="text-xs text-gray-500">{student.email}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
