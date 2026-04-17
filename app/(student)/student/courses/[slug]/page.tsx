"use client";

import { useQuery } from "convex/react";
import {
  AlertCircle,
  Award,
  BookOpen,
  Clock,
  Download,
  GraduationCap,
  Star,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { PrerequisitesSection } from "@/app/(public)/courses/[slug]/prerequisites-section";
import { api } from "@/convex/_generated/api";
import { ClassmatesSection } from "~/components/courses/classmates-section";
import { CourseReviewForm } from "~/components/reviews/course-review-form";
import { Button } from "~/components/ui/button";
import { DownloadBrochure } from "~/components/ui/download-brochure";

export default function StudentCoursePage() {
  const params = useParams();
  const slug = params.slug as string;

  const courseResult = useQuery(api.courses.getBySlug, { slug });
  const enrollmentsResult = useQuery(api.enrollments.getAll);

  if (courseResult === undefined || enrollmentsResult === undefined) {
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

  const enrollments = enrollmentsResult?.success ? enrollmentsResult.data : [];
  const enrollment = enrollments.find((e) => e.courseId === course._id);

  if (!enrollment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-500">
          You are not enrolled in this course.
        </p>
        <Link
          href="/student/courses"
          className="mt-4 text-primary hover:underline"
        >
          Return to my courses
        </Link>
      </div>
    );
  }

  const isCompleted = enrollment.status === "completed";

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isCompleted && (
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
                  You have not yet finished the enrollment process for this
                  course. Please complete the required steps to get full access.
                </p>
              </div>
            </div>
            <Link href={`/student/enrollment?courseId=${course._id}`}>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white border-none">
                Complete Enrollment
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-16">
            {/* Prerequisites */}
            <section>
              <SectionHeading
                icon={<BookOpen className="h-5 w-5" />}
                title="Pre-requisites"
                subtitle="What you need before you start"
              />
              <PrerequisitesSection courseId={course._id} />
            </section>

            <ClassmatesSection courseId={course._id} />

            {/* Course Review - Moved from Dashboard */}
            {isCompleted && (
              <section>
                <SectionHeading
                  icon={<Star className="h-5 w-5" />}
                  title="Course Review"
                  subtitle="Share your experience to help future students"
                />
                <div className="mt-6">
                  <CourseReviewForm
                    courseId={course._id}
                    courseName={course.name}
                  />
                </div>
              </section>
            )}

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
                        <div
                          className={`h-20 bg-linear-to-br ${color} relative`}
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
                                className={`bg-linear-to-br ${color} bg-clip-text text-transparent font-bold text-sm`}
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
          </div>

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
                  <DownloadBrochure courseId={course._id}>
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
          </div>
        </div>
      </main>
    </div>
  );
}

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
