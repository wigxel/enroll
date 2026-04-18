import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { truncate } from "lodash-es";
import { AlertOctagonIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ApplicationForm from "@/components/forms/ApplicationForm";
import FastTrackPrompt from "@/components/forms/FastTrackPrompt";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { api } from "@/convex/_generated/api";
import { isAdminRole } from "@/lib/roles";
import { Button } from "~/components/ui/button";

interface CourseApplicationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CourseApplicationPageProps): Promise<Metadata> {
  const result = await fetchQuery(api.courses.getBySlug, {
    slug: (await params).slug,
  });
  const course = result?.success ? result.data : null;
  if (!course) return { title: "Course Not Found" };
  return {
    title: `Apply — ${course.name}`,
    description: course.description,
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default async function CourseApplicationPage({
  params,
}: CourseApplicationPageProps) {
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });

  const [courseResult, appStatus, user, enrollmentResult] = await Promise.all([
    fetchQuery(api.courses.getBySlug, { slug: (await params).slug }),
    fetchQuery(api.settings.getAppStatus),
    fetchQuery(api.users.getCurrentUser, {}, token ? { token } : undefined),
    fetchQuery(api.enrollments.getAll, {}, token ? { token } : undefined),
  ]);

  const course = courseResult?.success ? courseResult.data : null;
  const currentUser = user?.success ? user.data : null;
  const isAdmin = isAdminRole(currentUser?.role ?? null);

  const enrollments = enrollmentResult?.success ? enrollmentResult.data : [];
  // Check if user is enrolled in this specific course
  const isEnrolledInCourse = enrollments.some(
    (e) => e.courseId === course?._id,
  );
  const isReturningStudent = enrollments.length > 0 && isEnrolledInCourse;

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-50 bg-background/40 backdrop-blur-sm">
        <div className="h-16 flex items-center container justify-between mx-auto">
          <Breadcrumb
            className="flex-1 hidden md:flex"
            items={[
              { label: "Courses", href: "/courses" },
              {
                label: truncate(course.name, { length: 10 }),
                href: `/courses/${course.slug}`,
              },
              { label: "Apply" },
            ]}
          />

          <div className="flex-1 text-center font-semibold text-gray-900 dark:text-white line-clamp-1">
            {course.name}
          </div>

          <div className="flex-1 flex justify-end" />
        </div>
      </div>

      <div className="mx-auto py-12 container max-w-xl">
        {isAdmin ? (
          <div className="rounded-lg bg-white border border-gray-200 p-6 space-y-4">
            <h6 className="flex items-center gap-2 font-semibold text-foreground">
              <AlertOctagonIcon className="w-5 h-5" />
              Action denied
            </h6>

            <p className="flex items-center gap-2 text-foreground">
              You are viewing this page as an administrator. Use the admin
              dashboard to manage applications.
            </p>
            <a href="/admin/dashboard">
              <Button variant="link">Go to Admin Dashboard</Button>
            </a>
          </div>
        ) : isReturningStudent ? (
          <FastTrackPrompt courseId={course._id} />
        ) : (
          <ApplicationForm defaultCourseId={course._id} />
        )}
      </div>
    </div>
  );
}
