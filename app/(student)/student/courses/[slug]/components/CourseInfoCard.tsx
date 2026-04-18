"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Award, GraduationCap, Download } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "~/components/ui/button";
import { DownloadBrochure } from "~/components/ui/download-brochure";

interface CourseInfoCardProps {
  course: {
    _id: string;
    name: string;
    description: string;
    duration: string;
    certification: string;
    coverPhoto?: string;
  };
}

export function CourseInfoCard({ course }: CourseInfoCardProps) {
  const enrollmentResult = useQuery(api.enrollments.getByCourseId, {
    courseId: course._id,
  } as any);

  const isCompleted =
    enrollmentResult?.success &&
    (enrollmentResult.data.status === "completed" ||
      ((enrollmentResult.data.quizRequired ?? false) === false &&
        (enrollmentResult.data as any)?.steps?.tuitionPaid &&
        (enrollmentResult.data as any)?.steps?.documentsSigned));

  return (
    <div className="sticky top-24 rounded-2xl bg-background overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-800">
      <div className="relative h-48 bg-gray-100 dark:bg-zinc-800">
        {course.coverPhoto ? (
          <Image
            src={course.coverPhoto}
            alt={course.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 image-gradient flex items-center justify-center">
            <span className="text-3xl font-bold text-white/50">
              {course.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {course.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
          {course.description}
        </p>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
              <Clock className="h-4 w-4" /> Duration
            </span>
            <span className="font-medium text-gray-900 dark:text-white text-sm text-end">
              {course.duration}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
              <Award className="h-4 w-4" /> Certification
            </span>
            <span className="font-medium text-gray-900 dark:text-white text-sm text-end">
              {course.certification}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
              <GraduationCap className="h-4 w-4" /> Status
            </span>
            <span
              className={`font-medium text-sm text-end ${isCompleted ? "text-emerald-600" : "text-blue-600"}`}
            >
              {isCompleted ? "Completed" : "In Progress"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <DownloadBrochure courseId={course._id as any}>
            {/** biome-ignore lint/a11y/useValidAnchor: Wrapper adds href */}
            <a className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all group">
              <Download className="h-4 w-4 group-hover:animate-bounce" />
              Download Programme Brochure
            </a>
          </DownloadBrochure>

          {isCompleted && (
            <Link href="/student/certifications">
              <Button variant="default" size="lg" className="w-full">
                View Certificate
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
