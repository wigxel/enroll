"use client";

import { useQuery } from "convex/react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type SortKey = "enrolledAt" | "name";

function StudentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("enrolledAt");

  // Initialize cohort filter from URL query param
  const cohortFromUrl = searchParams.get("cohort") ?? "";
  const [cohortFilter, setCohortFilterState] = useState<string>(cohortFromUrl);

  const setCohortFilter = useCallback(
    (value: string) => {
      setCohortFilterState(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("cohort", value);
      } else {
        params.delete("cohort");
      }
      router.replace(`/admin/users?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  const cohortId = cohortFilter ? (cohortFilter as Id<"cohorts">) : undefined;

  const studentsResultRaw = useQuery(api.users.listStudents, {
    search: search || undefined,
    sort: sortBy,
    cohortId,
  });

  const cohortsResultRaw = useQuery(api.cohorts.list, {});

  const students = studentsResultRaw?.success ? studentsResultRaw.data.users : [];
  const totalStudents = studentsResultRaw?.success
    ? studentsResultRaw.data.total
    : 0;
  const cohorts = cohortsResultRaw?.success ? cohortsResultRaw.data.cohorts : [];

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
        <p className="mt-1 text-sm text-gray-500">
          {totalStudents} enrolled student{totalStudents !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search, Cohort Filter & Sort */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={cohortFilter}
          onChange={(e) => setCohortFilter(e.target.value)}
          className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Cohorts</option>
          {cohorts.map((cohort) => (
            <option key={cohort._id} value={cohort._id}>
              {cohort.name}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="enrolledAt">Newest First</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {/* Students Table */}
      {studentsResultRaw === undefined ? (
        <div className="mt-12 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
        </div>
      ) : (studentsResultRaw.success === false) ? (
        <div className="mt-12 p-4 text-center text-red-600 bg-red-50 rounded-lg">
          {studentsResultRaw.error}
        </div>
      ) : students.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <h3 className="text-sm font-medium text-gray-900">
            No students found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {search || cohortFilter
              ? "Try adjusting your search or filter."
              : "No students enrolled yet."}
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Student
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Course
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Cohort
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Enrolled
                </th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr
                  key={student._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                    {student.courseName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {student.cohortName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(student.enrolledAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-6">
                    <Link
                      href={`/admin/users/${student._id}`}
                      className="text-primary hover:text-primary/80"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function StudentsPage() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <React.Suspense fallback={
          <div className="mt-12 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
          </div>
        }>
          <StudentsContent />
        </React.Suspense>
      </div>
    </div>
  );
}
