"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";

interface Certification {
  id: string;
  courseName: string;
  certification: string;
  coverPhoto: string | null;
  completedAt: string;
}

const gradientBackgrounds = [
  "from-primary/20 via-primary/10 to-indigo-50",
  "from-emerald-100/80 via-teal-50 to-cyan-50",
  "from-violet-100/80 via-purple-50 to-fuchsia-50",
  "from-amber-100/80 via-orange-50 to-yellow-50",
  "from-rose-100/80 via-pink-50 to-red-50",
];

import { Award, BookOpen, Loader2 } from "lucide-react";

export default function CertificationsPage() {
  const result = useQuery(api.enrollments.getOwnCompletedEnrollments);

  if (result === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const certifications = result.success ? result.data.map(enrollment => ({
    id: enrollment._id,
    courseName: enrollment.courseName,
    certification: `${enrollment.courseName} Certificate`,
    coverPhoto: null,
    completedAt: enrollment.completedAt || new Date().toISOString()
  })) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          My Certifications
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View your earned certifications from completed courses.
        </p>
      </div>

      {/* Certifications Grid */}
      {certifications.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <Award className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-base font-semibold text-gray-700">
            No certifications yet
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-gray-400">
            Complete your enrollment to earn your first certification.
          </p>
          <Link
            href="/student/dashboard"
            className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert, index) => (
            <div
              key={cert.id}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              {/* Cover / Gradient */}
              {cert.coverPhoto ? (
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={cert.coverPhoto}
                    alt={cert.courseName}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              ) : (
                <div
                  className={`flex h-36 w-full items-center justify-center bg-gradient-to-br ${gradientBackgrounds[index % gradientBackgrounds.length]}`}
                >
                  <BookOpen className="h-10 w-10 text-primary/40" />
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-gray-900">
                      {cert.certification}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {cert.courseName}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {new Date(cert.completedAt).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    <Award className="h-3 w-3" />
                    Earned
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
