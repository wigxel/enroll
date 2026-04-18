"use client";

import { useQuery } from "convex/react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { Button } from "~/components/ui/button";

interface EnrollmentIncompleteBannerProps {
  courseId: string;
}

export function EnrollmentIncompleteBanner({
  courseId,
}: EnrollmentIncompleteBannerProps) {
  const enrollmentResult = useQuery(api.enrollments.getByCourseId, {
    courseId: courseId as any,
  } as any);

  if (enrollmentResult === undefined) {
    return null;
  }

  const enrollment = enrollmentResult?.success ? enrollmentResult.data : null;

  const quizRequired = enrollment?.quizRequired ?? false;
  const isCompleted =
    enrollment?.status === "completed" ||
    (!quizRequired &&
      (enrollment as any)?.steps?.tuitionPaid &&
      (enrollment as any)?.steps?.documentsSigned);

  if (isCompleted) {
    return null;
  }

  return (
    <div className="mb-10 rounded-2xl bg-amber-50 border border-amber-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-amber-900">
            Enrollment Incomplete
          </h3>
          <p className="text-sm text-amber-700">
            You have not yet finished the enrollment process for this course.
            Please complete the required steps to get full access.
          </p>
        </div>
      </div>
      <Link href={`/student/enrollment?courseId=${courseId}`}>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white border-none">
          Complete Enrollment
        </Button>
      </Link>
    </div>
  );
}
