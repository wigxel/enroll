"use client";

import { useQuery } from "convex/react";
import { Users } from "lucide-react";
import { useParams } from "next/navigation";
import { BrochureSection } from "~/components/admin/course-details/BrochureSection";
import { QuizPolicySection } from "~/components/admin/course-details/QuizPolicySection";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { CourseHeader } from "./course-header";
import { EnrollmentStats } from "./enrollment-stats";
import { StudentsTable } from "./students-table";
import { PrerequisitesSection } from "./prerequisites-section";
import { InstructorsSection } from "./instructors-section";
import { FAQsSection } from "./faqs-section";
import { EditCourseForm } from "./edit-course-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.courseId as Id<"courses">;

  const courseResult = useQuery(api.courses.getById, { courseId });
  const enrollmentsResult = useQuery(api.enrollments.listByCourseId, {
    courseId,
  });

  const isLoading =
    courseResult === undefined || enrollmentsResult === undefined;

  const course = courseResult?.success ? courseResult.data : null;
  const enrollments = enrollmentsResult?.success ? enrollmentsResult.data : [];

  const activeEnrollments = enrollments.filter((e) => e.status === "pending");
  const completedEnrollments = enrollments.filter(
    (e) => e.status === "completed",
  );

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Course not found
        </h2>
        <p className="mt-2 text-gray-500">
          The course you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CourseHeader courseId={courseId} />

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList>
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="details">Course Details</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            <TabsTrigger value="edit">Edit Course</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Enrollments
              </h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {enrollments.length} Enrollment
                {enrollments.length !== 1 ? "s" : ""}
              </span>
            </div>

            <EnrollmentStats
              activeCount={activeEnrollments.length}
              completedCount={completedEnrollments.length}
            />

            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Students
              </h2>
              <StudentsTable enrollments={enrollments} />
            </section>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <BrochureSection courseId={courseId} />
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <PrerequisitesSection courseId={courseId} />
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <InstructorsSection courseId={courseId} />
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <FAQsSection courseId={courseId} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="onboarding">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <QuizPolicySection courseId={courseId} />
            </div>
          </TabsContent>

          <TabsContent value="edit">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <EditCourseForm courseId={courseId} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
