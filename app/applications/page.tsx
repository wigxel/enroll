"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, Button, Badge } from "@tremor/react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function CourseCatalogPage() {
  const courses = useQuery(api.courses.listActive);
  const appStatus = useQuery(api.settings.getAppStatus);

  if (courses === undefined || appStatus === undefined) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center sm:p-20">
        <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading available programs...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 sm:p-20 bg-gray-50 dark:bg-zinc-950">
      <main className="flex w-full max-w-6xl flex-col items-center gap-12">
        {/* Header Section */}
        <div className="space-y-6 text-center max-w-2xl px-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-gray-900 dark:text-white">
            Available Programs
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
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
              <Card
                key={course._id}
                className="flex flex-col overflow-hidden p-0 transition-all hover:shadow-lg dark:hover:shadow-black/50 hover:-translate-y-1"
              >
                {/* Cover Photo */}
                <div className="relative h-48 w-full bg-gray-200 dark:bg-zinc-800 border-b dark:border-zinc-800">
                  {course.coverPhoto ? (
                    <Image
                      src={course.coverPhoto}
                      alt={course.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                      <span className="text-3xl font-bold text-white/50">
                        {course.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Floating badges */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge color="indigo" className="font-medium shadow-sm">
                      {course.duration}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 line-clamp-1 mb-2">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                    {course.description}
                  </p>

                  <div className="mb-6 flex items-center justify-between border-t dark:border-zinc-800 pt-4">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 rounded-md px-2 py-1 bg-gray-50 dark:bg-zinc-800/50">
                      {course.certification}
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {course.tuitionFee
                        ? formatCurrency(course.tuitionFee)
                        : "Free"}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto">
                    {appStatus.isOpen ? (
                      <Link
                        href={`/applications/${course.slug}`}
                        className="w-full"
                      >
                        <Button
                          className="w-full relative overflow-hidden group font-medium"
                          size="md"
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            Enroll Now
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
                              className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 lg:ml-2"
                            >
                              <path d="M5 12h14"></path>
                              <path d="m12 5 7 7-7 7"></path>
                            </svg>
                          </span>
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        disabled
                        variant="secondary"
                        className="w-full opacity-70"
                      >
                        Applications Closed
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
