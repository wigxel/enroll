import { fetchQuery } from "convex/nextjs";
import {
  Award,
  BookOpen,
  Clock,
  Download,
  GraduationCap,
  Quote,
  Star,
  User,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type React from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { DownloadBrochure } from "~/components/ui/download-brochure";
import { FaqSection } from "./faq-section";
import { PrerequisitesSection } from "./prerequisites-section";

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
  const [courseResult, appStatusResult] = await Promise.all([
    fetchQuery(api.courses.getBySlug, { slug: (await params).slug }),
    fetchQuery(api.settings.getAppStatus),
  ]);

  const course: Doc<"courses"> = courseResult?.success
    ? courseResult.data
    : null;
  const appStatus = appStatusResult?.success ? appStatusResult.data : null;

  if (!course) notFound();

  // Fetch reviews after we have the course
  const reviewsResult = await fetchQuery(api.reviews.getCourseReviews, {
    courseId: course._id,
  });
  const reviewsData = reviewsResult?.success ? reviewsResult.data : null;
  const reviews = reviewsData?.reviews || [];
  const averageRating = reviewsData?.averageRating || 0;
  const totalReviews = reviewsData?.totalReviews || 0;

  return (
    <div className="min-h-screen">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800">
        <div className="h-16 flex items-center justify-between mx-auto container">
          <Breadcrumb
            className="flex-1"
            items={[
              { label: "Courses", href: "/courses" },
              { label: course.name },
            ]}
          />

          <div className="flex-1 text-center font-semibold text-gray-900 dark:text-white line-clamp-1">
            {course.name}
          </div>

          <div className="flex-1 flex justify-end">
          </div>
        </div>
      </div>

      {/* ── Main two-column layout ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">


          {/* ── Right Column ── */}
          <div className="lg:col-span-8 space-y-16">
            {/* Prerequisites */}
            <section>
              <SectionHeading
                icon={<BookOpen className="h-5 w-5" />}
                title="Pre-requisites"
                subtitle="What you need before you start"
              />
              <PrerequisitesSection courseId={course._id as string} />
            </section>

            {/* Instructors */}
            <section>
              <SectionHeading
                icon={<User className="h-5 w-5" />}
                title="Meet Your Instructors"
                subtitle="Learn from seasoned practitioners"
              />
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(course.instructors?.length ? course.instructors : []).map(
                  (ins) => {
                    const initials = ins.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    const colors = [
                      "from-indigo-500 to-purple-600",
                      "from-emerald-500 to-teal-600",
                      "from-rose-500 to-pink-600",
                      "from-amber-500 to-orange-600",
                    ];
                    const color =
                      colors[ins.name.charCodeAt(0) % colors.length];
                    return (
                      <div
                        key={ins._id}
                        className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-background overflow-hidden"
                      >
                        {/* Colour banner */}
                        <div
                          className={`h-20 bg-gradient-to-br ${color} relative`}
                        >
                          {ins.photo && (
                            <Image
                              src={ins.photo}
                              alt={ins.name}
                              fill
                              className="object-cover opacity-50"
                            />
                          )}
                          <div className="absolute -bottom-6 left-5 flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-zinc-900 shadow-md ring-2 ring-white dark:ring-zinc-900 overflow-hidden">
                            {ins.photo ? (
                              <Image
                                src={ins.photo}
                                alt={ins.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <span
                                className={`bg-gradient-to-br ${color} bg-clip-text text-transparent font-bold text-sm`}
                              >
                                {initials}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="pt-9 px-5 pb-5">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {ins.name}
                          </h3>
                          <p className="text-xs font-medium mt-0.5">
                            {ins.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                            {ins.bio}
                          </p>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </section>

            {/* Alumni Reviews */}
            <section>
              <SectionHeading
                icon={<Star className="h-5 w-5" />}
                title="Alumni Reviews"
                subtitle="What our graduates say about the program"
              />
              {/* Average rating bar */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  {averageRating.toFixed(1)}
                </span>
                <div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Based on {totalReviews} verified alumni reviews
                  </p>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                  No reviews yet. Be the first to review after completing the
                  course!
                </p>
              ) : (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                  {reviews.map((review: any) => {
                    const initials =
                      review.userName
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() || "??";
                    const colors = [
                      "from-rose-500 to-pink-600",
                      "from-sky-500 to-cyan-600",
                      "from-amber-500 to-orange-600",
                      "from-indigo-500 to-purple-600",
                      "from-emerald-500 to-teal-600",
                    ];
                    const color =
                      colors[
                      review.userId
                        ? review.userId.charCodeAt(0) % colors.length
                        : 0
                      ];
                    return (
                      <div
                        key={review._id}
                        className="relative rounded-2xl border border-gray-100 dark:border-zinc-800 bg-background p-6"
                      >
                        <Quote className="absolute top-4 right-4 h-8 w-8 text-gray-100 dark:text-zinc-800" />
                        {/* Stars */}
                        <div className="flex gap-0.5 mb-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          "{review.text}"
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color} text-white text-xs font-bold`}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {review.userName || "Anonymous"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* FAQs */}
            <section>
              <SectionHeading
                icon={<BookOpen className="h-5 w-5" />}
                title="Frequently Asked Questions"
                subtitle="Everything you need to know before applying"
              />
              <FaqSection courseId={course._id as string} />
            </section>
          </div>

          {/* ── Left Column: Course summary card ── */}
          <div className="lg:col-span-4 space-y-8">
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
                      <GraduationCap className="h-4 w-4" /> Tuition
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm text-end">
                      {course.tuitionFee
                        ? `₦${course.tuitionFee.toLocaleString()}`
                        : "Free"}
                    </span>
                  </div>

                  {appStatus?.applicationFeeAmount ? (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-zinc-800">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        Application Fee
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        ₦{appStatus.applicationFeeAmount.toLocaleString()}
                        <span className="text-xs font-normal text-gray-400">
                          (one-time)
                        </span>
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  {/* Download Brochure CTA */}
                  <DownloadBrochure courseId={course._id}>
                    {/** biome-ignore lint/a11y/useValidAnchor: Wrapper adds href */}
                    <a className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all group">
                      <Download className="h-4 w-4 group-hover:animate-bounce" />
                      Download Programme Brochure
                    </a>
                  </DownloadBrochure>

                  <Link href={`/applications/${course.slug}`}>
                    <Button variant={"default"} size="lg" className="w-full">
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function SectionHeading({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex bg-primary/16 text-primary h-9 w-9 shrink-0 items-center justify-center rounded-xl">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}
