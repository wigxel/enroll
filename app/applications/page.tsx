"use client";

import { RiCertificate2Line } from "@remixicon/react";
import { useQuery } from "convex/react";
import { Loader2, LucideUsers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

export default function CourseCatalogPage() {
  const coursesResult = useQuery(api.courses.listActive);
  const appStatusResult = useQuery(api.settings.getAppStatus);

  const courses = coursesResult?.success ? (coursesResult.data as any[]) : [];
  const appStatus = appStatusResult?.success
    ? appStatusResult.data
    : { isOpen: false, message: "" };

  if (coursesResult === undefined || appStatusResult === undefined) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center sm:p-20">
        <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
          <Loader2 className="animate-spin -ml-1 mr-3 size-5" />
          Loading available programs...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <main className="flex container flex-col items-center gap-12">
        {/* Header Section */}
        <div className="space-y-6 flex flex-col md:flex-row justify-between w-full">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-gray-900 dark:text-white">
            Available Programs
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-[40ch]">
            Browse our catalog of world-class programs. Find the perfect course
            to advance your career and start your application today.
          </p>

          {/* Application Status Banner */}
          {!appStatus.isOpen && (
            <div className="inline-flex items-center justify-center rounded-full bg-red-100 px-4 py-1.5 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
              </span>
              {appStatus.message || "Applications are currently closed."}
            </div>
          )}
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl w-full bg-white dark:bg-zinc-900 shadow-sm">
            <div className="rounded-full bg-gray-100 dark:bg-zinc-800 p-4 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-gray-400"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Check back soon
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              We are currently updating our course catalog. Please check back
              later for exciting new programs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
            {courses.map((course) => (
              <CourseCard data={course} key={course._id} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CourseCard({ data: course }: { data: any }) {
  return (
    <Link href={`/applications/${course.slug}`} draggable={false}>
      <div className="flex flex-col overflow-hidden p-0 transition-all bg-background select-none rounded-2xl hover:shadow-xl transition-default hover:-translate-y-2 shadow-black/6">
        {/* Cover Photo */}
        <div className="relative h-48 bg-gray-200 rounded-xl m-2 overflow-hidden">
          {course.coverPhoto ? (
            <Image
              src={course.coverPhoto}
              alt={course.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center image-gradient">
              <span className="text-3xl font-bold text-white/50">
                {course.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          {/* Floating badges */}
          <div className="absolute top-0 right-4 flex gap-2">
            <span className="text-foreground bg-background text-xs rounded-b-lg p-2">
              {course.duration}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-2xl font-semibold font-heading text-gray-900 dark:text-gray-50 line-clamp-1 mb-2">
            {course.name}
          </h3>

          <ul className="flex flex-col font-body gap-1 mb-6 text-sm">
            <div className="flex gap-2 items-center">
              <RiCertificate2Line size="1em" className="text-gray-500" />
              <span className="">{course.certification}</span>
            </div>

            <div className="flex gap-2 items-center">
              <LucideUsers size="1em" className="text-gray-500" />
              <span className="">{(18).toLocaleString()} Enrolled</span>
            </div>

            <div className="flex gap-2 items-center">
              <LucideUsers size="1em" className="text-gray-500" />
              <span className="">{(5000).toLocaleString()} Alumni</span>
            </div>
          </ul>

          <div className="flex justify-between items-end">
            <div className="text-base uppercase font-cnd text-primary font-medium text-start text-foreground">
              Culinary
            </div>

            <div className="text-4xl font-medium font-cnd text-end tracking-tight text-gray-900">
              {course.tuitionFee ? (
                <>
                  <span className="text-gray-500 text-base">NGN</span>
                  {formatCurrency(course.tuitionFee).replace("NGN", "")}
                </>
              ) : (
                "Free"
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
