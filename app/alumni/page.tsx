"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Users, BookOpen, Layers, Search } from "lucide-react";

function Avatar({
  name,
  src,
  size = 56,
}: {
  name: string;
  src?: string | null;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const colors = [
    "from-violet-500 to-purple-600",
    "from-indigo-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-sky-500 to-cyan-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover ring-2 ring-white dark:ring-zinc-900"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br ${color} ring-2 ring-white dark:ring-zinc-900 text-white font-bold`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

export default function AlumniPage() {
  const [courseFilter, setCourseFilter] = useState<Id<"courses"> | "">("");
  const [cohortFilter, setCohortFilter] = useState<Id<"cohorts"> | "">("");
  const [search, setSearch] = useState("");

  const alumni = useQuery(api.alumni.list, {
    courseId: courseFilter || undefined,
    cohortId: cohortFilter || undefined,
    search: search || undefined,
  });

  const stats = useQuery(api.alumni.getStats, {});
  const courses = useQuery(api.courses.listActive);
  const cohortsResult = useQuery(api.cohorts.list, {});

  const isLoading = alumni === undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-20 text-white">
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <GraduationCap className="h-4 w-4" />
            Our Graduates
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            Meet Our Alumni
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Talented individuals who completed our programs and are now building
            the future. Their stories inspire every new cohort.
          </p>

          {stats && (
            <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8">
              {[
                { icon: Users, value: stats.totalAlumni, label: "Graduates" },
                {
                  icon: BookOpen,
                  value: stats.totalCourses,
                  label: "Active Programs",
                },
                {
                  icon: Layers,
                  value: stats.totalCohorts,
                  label: "Cohorts Run",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-white/10 px-4 py-6 backdrop-blur-sm"
                >
                  <s.icon className="mx-auto mb-2 h-6 w-6 text-white/70" />
                  <div className="text-4xl font-extrabold">{s.value}</div>
                  <div className="mt-1 text-sm text-white/70">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Search + Filters bar */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-sm text-gray-700 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200 dark:placeholder-gray-500"
            />
          </div>

          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) =>
              setCourseFilter(e.target.value as Id<"courses"> | "")
            }
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200"
          >
            <option value="">All Programs</option>
            {courses?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Cohort filter */}
          <select
            value={cohortFilter}
            onChange={(e) =>
              setCohortFilter(e.target.value as Id<"cohorts"> | "")
            }
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200"
          >
            <option value="">All Cohorts</option>
            {cohortsResult?.cohorts.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {(courseFilter || cohortFilter || search) && (
            <button
              type="button"
              onClick={() => {
                setCourseFilter("");
                setCohortFilter("");
                setSearch("");
              }}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
            >
              Clear
            </button>
          )}

          <span className="ml-auto text-sm text-gray-400 dark:text-gray-500">
            {isLoading
              ? "…"
              : `${alumni.length} graduate${alumni.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {/* Alumni Grid */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-zinc-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-zinc-700" />
                    <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-zinc-700" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-gray-200 dark:bg-zinc-700" />
                  <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-zinc-700" />
                </div>
              </div>
            ))}
          </div>
        ) : alumni.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <GraduationCap className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-zinc-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              No alumni found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {courseFilter || cohortFilter || search
                ? "Try adjusting your search or filters."
                : "Graduates will appear here once they complete the program."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {alumni.map((alumnus) => {
              // Use the cover photo from the most recently graduated course
              const primaryCourse = alumnus.courses[0];

              return (
                <div
                  key={alumnus.userId}
                  className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-black/40"
                >
                  {/* Course cover strip */}
                  <div className="relative h-24 overflow-hidden rounded-t-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    {primaryCourse.coverPhotoUrl && (
                      <Image
                        src={primaryCourse.coverPhotoUrl}
                        alt={primaryCourse.courseName}
                        fill
                        className="object-cover opacity-50"
                      />
                    )}
                    <div className="absolute right-4 top-4 rounded-full bg-white/20 p-1.5 backdrop-blur-sm">
                      <GraduationCap className="h-4 w-4 text-white" />
                    </div>
                    {/* Badge count for multiple certifications */}
                    {alumnus.courses.length > 1 && (
                      <div className="absolute left-4 top-4 rounded-full bg-black/40 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                        {alumnus.courses.length} certifications
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="flex flex-1 flex-col px-5 pb-5">
                    {/* Avatar overlapping the cover */}
                    <div className="-mt-7 mb-3 flex items-end justify-between">
                      <Avatar
                        name={alumnus.name}
                        src={alumnus.profileImage}
                        size={56}
                      />
                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                        {new Date(alumnus.latestGraduatedAt).getFullYear()}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {alumnus.name}
                    </h3>

                    {/* All courses / certifications */}
                    <div className="mt-3 space-y-2">
                      {alumnus.courses.map((c) => (
                        <div
                          key={c.courseId}
                          className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-800/50"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 line-clamp-1">
                              <BookOpen className="h-3 w-3 shrink-0 text-indigo-500" />
                              {c.courseName}
                            </span>
                            <time
                              dateTime={c.graduatedAt}
                              className="shrink-0 text-xs text-gray-400 dark:text-gray-500"
                            >
                              {new Date(c.graduatedAt).toLocaleDateString(
                                undefined,
                                { month: "short", year: "numeric" },
                              )}
                            </time>
                          </div>
                          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                            {c.certification}
                          </p>
                          {c.cohortName && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                              <Layers className="h-3 w-3" />
                              {c.cohortName}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-white py-20 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <GraduationCap className="mx-auto mb-4 h-10 w-10 text-indigo-500" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Ready to join our alumni network?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-gray-500 dark:text-gray-400">
          Browse our available programs and start your application today.
        </p>
        <Link
          href="/applications"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-700 hover:shadow-indigo-500/50"
        >
          Explore Programs
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </section>
    </div>
  );
}
