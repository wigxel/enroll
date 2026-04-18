"use client";

import { useQuery } from "convex/react";
import { BookOpen, Star } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { PrerequisitesSection } from "@/app/(public)/courses/[slug]/prerequisites-section";
import { api } from "@/convex/_generated/api";
import { ClassmatesSection } from "~/components/courses/classmates-section";
import { CourseReviewForm } from "~/components/reviews/course-review-form";
import { CourseInfoCard } from "./components/CourseInfoCard";
import { EnrollmentIncompleteBanner } from "./components/EnrollmentIncompleteBanner";
import { InstructorsSection } from "./components/InstructorsSection";
import { SectionHeading } from "./components/SectionHeading";

export default function StudentCoursePage() {
  const params = useParams();
  const slug = params.slug as string;

  const courseResult = useQuery(api.courses.getBySlug, { slug });

  if (courseResult === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center p-12">
        <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading course details...
        </div>
      </div>
    );
  }

  const course = courseResult?.success ? courseResult.data : null;
  if (!course) return notFound();

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EnrollmentIncompleteBanner courseId={course._id as any} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-16">
            <section>
              <SectionHeading
                icon={<BookOpen className="h-5 w-5" />}
                title="Pre-requisites"
                subtitle="What you need before you start"
              />
              <PrerequisitesSection courseId={course._id} />
            </section>

            <ClassmatesSection courseId={course._id} />

            <CourseReviewSection
              courseId={course._id}
              courseName={course.name}
            />

            <InstructorsSection instructors={course.instructors ?? []} />
          </div>

          <div className="lg:col-span-4 space-y-8">
            <CourseInfoCard course={course as any} />
          </div>
        </div>
      </main>
    </div>
  );
}

function CourseReviewSection({
  courseId,
  courseName,
}: {
  courseId: string;
  courseName: string;
}) {
  return (
    <section>
      <SectionHeading
        icon={<Star className="h-5 w-5" />}
        title="Course Review"
        subtitle="Share your experience to help future students"
      />
      <div className="mt-6">
        <CourseReviewForm courseId={courseId as any} courseName={courseName} />
      </div>
    </section>
  );
}
