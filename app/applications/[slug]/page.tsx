import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ApplicationForm from "@/components/forms/ApplicationForm";
import { PartnersMarquee } from "@/components/ui/partners-marquee";
import { api } from "@/convex/_generated/api";

interface CourseApplicationPageProps {
  params: Promise<{
    slug: string;
  }>;
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

export default async function CourseApplicationPage({
  params,
}: CourseApplicationPageProps) {
  const [courseResult, appStatusResult] = await Promise.all([
    fetchQuery(api.courses.getBySlug, { slug: (await params).slug }),
    fetchQuery(api.settings.getAppStatus),
  ]);

  const course = courseResult?.success ? courseResult.data : null;
  const appStatus = appStatusResult?.success ? appStatusResult.data : null;

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/applications"
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Catalog
          </Link>
          <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">
            {course.name}
          </div>
          <div className="w-20" /> {/* Spacer to center the title */}
        </div>
      </header>

      {/* Testimonial Video Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-b dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 mb-3">
                Student Story
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Hear from our graduates
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Our students have gone on to land jobs at top companies, build
                their own startups, and transform their careers. Watch this
                short testimonial to see how this program can change your life
                too.
              </p>
              <div className="flex flex-wrap gap-4">
                {[
                  { stat: "95%", label: "Completion Rate" },
                  { stat: "2x", label: "Avg. Salary Jump" },
                  { stat: "500+", label: "Alumni Network" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {item.stat}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/qhbuKbxJsk8?rel=0"
                title="Student Testimonial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>

      {/* Partners Marquee */}
      <PartnersMarquee />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Course Summary */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 rounded-2xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 overflow-hidden shadow-sm">
              <div className="relative h-48 bg-gray-100 dark:bg-zinc-800">
                {course.coverPhoto ? (
                  <Image
                    src={course.coverPhoto}
                    alt={course.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white/50">
                      {course.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {course.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                  {course.description}
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-t dark:border-zinc-800">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Duration
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {course.duration}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-t dark:border-zinc-800">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Certification
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {course.certification}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-t dark:border-zinc-800">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Tuition
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {course.tuitionFee
                        ? `₦${course.tuitionFee.toLocaleString()}`
                        : "Free"}
                    </span>
                  </div>
                  {appStatus?.applicationFeeAmount ? (
                    <div className="flex justify-between items-center py-3 border-t dark:border-zinc-800">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        Application Fee
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                        ₦{appStatus.applicationFeeAmount.toLocaleString()}
                        <span className="text-xs font-normal text-gray-400">
                          (one-time)
                        </span>
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-10 border dark:border-zinc-800 shadow-sm">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Application Form
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Please fill out the form below to apply for {course.name}.
                </p>
              </div>

              {/* Pass courseId as default to ApplicationForm */}
              <ApplicationForm defaultCourseId={course._id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
