"use client";

import { useQuery } from "convex/react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileCheck,
  GraduationCap,
  Loader2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { cn } from "~/lib/utils";

interface EnrollmentCard {
  _id: string;
  courseId: string;
  courseSlug: string | null;
  courseName: string;
  cohortName: string;
  status: "pending" | "completed";
  completedAt: string | null;
  createdAt: string;
}

interface ApplicationCard {
  _id: string;
  courseName: string;
  courseId: string;
  courseSlug: string | null;
  status: "draft" | "submitted" | "under_review" | "approved" | "declined";
  paymentStatus: "unpaid" | "paid";
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

const gradientBackgrounds = [
  "from-primary/20 via-primary/10 to-indigo-50",
  "from-emerald-100/80 via-teal-50 to-cyan-50",
  "from-violet-100/80 via-purple-50 to-fuchsia-50",
  "from-amber-100/80 via-orange-50 to-yellow-50",
  "from-rose-100/80 via-pink-50 to-red-50",
];

function EnrollmentCardComponent({
  enrollment,
  index,
}: {
  enrollment: EnrollmentCard;
  index: number;
}) {
  const isCompleted = enrollment.status === "completed";
  const bgGradient = gradientBackgrounds[index % gradientBackgrounds.length];

  return (
    <div
      className={cn(
        bgGradient,
        `relative overflow-hidden rounded-xl border border-gray-200 bg-linear-to-br p-6 shadow-sm transition-shadow hover:shadow-md`,
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/60">
          <GraduationCap className="h-5 w-5 text-primary" />
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isCompleted
              ? "bg-emerald-100 text-emerald-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Completed
            </>
          ) : (
            <>In Progress</>
          )}
        </span>
      </div>
      <h3 className="mb-1 text-lg font-semibold text-gray-900">
        {enrollment.courseName}
      </h3>
      <p className="mb-4 text-sm text-gray-500">{enrollment.cohortName}</p>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <CalendarDays className="h-3.5 w-3.5" />
        <span>
          {enrollment.completedAt
            ? `Completed ${new Date(enrollment.completedAt).toLocaleDateString(
                "en-NG",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                },
              )}`
            : `Started ${new Date(enrollment.createdAt).toLocaleDateString(
                "en-NG",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                },
              )}`}
        </span>
      </div>
      <div className="mt-6 flex flex-col gap-2">
        <Link href={`/student/courses/${enrollment.courseSlug}`}>
          <Button variant="outline" className="w-full">
            View Course
          </Button>
        </Link>
        {isCompleted && (
          <Link href="/student/certifications">
            <Button variant="default" className="w-full">
              View Certificate
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function ApplicationCardComponent({
  application,
  index,
}: {
  application: ApplicationCard;
  index: number;
}) {
  const isDeclined = application.status === "declined";
  const isApproved = application.status === "approved";
  const bgGradient = gradientBackgrounds[index % gradientBackgrounds.length];

  const statusConfig = {
    draft: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: Clock },
    submitted: {
      label: "Submitted",
      color: "bg-blue-100 text-blue-700",
      icon: FileCheck,
    },
    under_review: {
      label: "Under Review",
      color: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    },
    approved: {
      label: "Approved",
      color: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle2,
    },
    declined: {
      label: "Declined",
      color: "bg-red-100 text-red-700",
      icon: XCircle,
    },
  };

  const config = statusConfig[application.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-gray-200 bg-linear-to-br ${bgGradient} p-6 shadow-sm transition-shadow hover:shadow-md`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/60">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
        >
          <StatusIcon className="mr-1 h-3 w-3" />
          {config.label}
        </span>
      </div>

      <h3 className="mb-1 text-lg font-semibold text-gray-900">
        {application.courseName}
      </h3>
      <p className="mb-4 text-sm text-gray-500">
        {application.paymentStatus === "paid" ? "Paid" : "Payment pending"}
      </p>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <CalendarDays className="h-3.5 w-3.5" />
        <span>
          {application.submittedAt
            ? `Applied ${new Date(application.submittedAt).toLocaleDateString(
                "en-NG",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                },
              )}`
            : "Not submitted"}
        </span>
      </div>

      {isDeclined && application.courseSlug && (
        <Link
          href={`/courses/${application.courseSlug}`}
          className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Reapply
        </Link>
      )}

      {isApproved && (
        <div className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
          Enrollment Approved
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  const enrollmentsResult = useQuery(api.enrollments.getAll);
  const applicationsResult = useQuery(api.applications.getAll);

  const isLoading =
    enrollmentsResult === undefined || applicationsResult === undefined;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const enrollments: EnrollmentCard[] = enrollmentsResult?.success
    ? enrollmentsResult.data
    : [];
  const applications: ApplicationCard[] = applicationsResult?.success
    ? applicationsResult.data
    : [];

  const ongoing = enrollments.filter((e) => e.status === "pending");
  const completed = enrollments.filter((e) => e.status === "completed");

  const pendingApps = applications.filter((a) =>
    ["draft", "submitted", "under_review"].includes(a.status),
  );
  const processedApps = applications.filter((a) => a.status === "declined");

  if (enrollments.length === 0 && applications.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">My Courses</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your course enrollments
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No courses yet
          </h3>
          <p className="mb-4 max-w-sm text-sm text-gray-500">
            You haven&apos;t enrolled in any courses yet. Browse our catalog to
            find the right course for you.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">My Courses</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your course enrollments
        </p>
      </div>

      {ongoing.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Ongoing Courses
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ongoing.map((enrollment, index) => (
              <EnrollmentCardComponent
                key={enrollment._id}
                enrollment={enrollment}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {pendingApps.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Applied Courses
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pendingApps.map((application, index) => (
              <ApplicationCardComponent
                key={application._id}
                application={application}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {processedApps.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Application Status
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {processedApps.map((application, index) => (
              <ApplicationCardComponent
                key={application._id}
                application={application}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Completed Courses
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((enrollment, index) => (
              <EnrollmentCardComponent
                key={enrollment._id}
                enrollment={enrollment}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* Continue Learning Prompt */}
      <section className="mt-12">
        <Card className="bg-primary/5 md:py-4 md:flex items-center justify-between border-primary/20">
          <CardHeader>
            <CardTitle>Ready for your next challenge?</CardTitle>
            <CardDescription>
              Expand your knowledge and advance your career by exploring our
              other professional courses.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex items-center md:pb-0 md:justify-end">
            <Button asChild className="w-full md:w-auto">
              <Link href="/courses">Browse All Courses</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
