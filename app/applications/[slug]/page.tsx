import { fetchQuery } from "convex/nextjs";
import { truncate } from 'lodash-es'
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ApplicationForm from "@/components/forms/ApplicationForm";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { api } from "@/convex/_generated/api";

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
  const [courseResult] = await Promise.all([
    fetchQuery(api.courses.getBySlug, { slug: (await params).slug }),
    fetchQuery(api.settings.getAppStatus),
  ]);

  const course = courseResult?.success ? courseResult.data : null;

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-50  bg-background/90 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800">
        <div className="h-16 flex items-center container justify-between mx-auto">
          <Breadcrumb
            className="flex-1 hidden md:flex"
            items={[
              { label: "Courses", href: "/courses" },
              { label: truncate(course.name, { length: 10 }), href: `/courses/${course.slug}` },
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
        <ApplicationForm defaultCourseId={course._id} />
      </div>
    </div>
  );
}
