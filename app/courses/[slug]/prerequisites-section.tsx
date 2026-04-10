"use client";

import { useQuery } from "convex/react";
import { CheckCircle2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface PrerequisiteItem {
  key: string;
  value: string;
}

interface PrerequisitesSectionProps {
  courseId: string;
}

export function PrerequisitesSection({ courseId }: PrerequisitesSectionProps) {
  const courseResult = useQuery(api.courses.getById, {
    courseId: courseId as Id<"courses">,
  });

  const course = courseResult?.success ? courseResult.data : null;
  const prerequisites: PrerequisiteItem[] = course?.prerequisites ?? [];

  if (courseResult === undefined) {
    return (
      <div className="mt-6 grid gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse h-16 bg-gray-100 rounded-xl dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  if (prerequisites.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-gray-100 bg-background p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No prerequisites for this course.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-3">
      {prerequisites.map((item) => (
        <li
          key={item.key}
          className="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-zinc-800 bg-background p-4 dark:bg-zinc-900"
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {item.value}
          </span>
        </li>
      ))}
    </ul>
  );
}
