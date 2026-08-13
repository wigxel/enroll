"use client";

import { useQuery } from "convex/react";
import { Briefcase } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatSalaryRange } from "~/lib/job.helpers";

// The query result is untyped at its boundary; this records the job fields the
// section renders so invalid response shapes cannot flow through the UI.
type Job = {
  _id: Id<"jobs">;
  title: string;
  company: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  image?: string;
};

interface JobsSectionProps {
  courseId: string;
}

/** Long descriptions are collapsed so one verbose entry can't bury the rest. */
const DESCRIPTION_CLAMP_CHARS = 280;

export function JobsSection({ courseId }: JobsSectionProps) {
  const jobsResult = useQuery(api.courses.getCourseJobs, {
    courseId: courseId as Id<"courses">,
  });

  if (jobsResult === undefined) {
    return (
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {["a", "b"].map((key) => (
          <div
            key={key}
            className="h-64 animate-pulse rounded-2xl bg-gray-100 dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  const jobs = jobsResult?.success ? (jobsResult.data as Job[]) : [];

  if (jobs.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-gray-100 bg-background p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Job opportunities for this course will be shared soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} />
      ))}
    </div>
  );
}

type JobCardProps = { job: Job };

function JobCard(props: JobCardProps) {
  const { job } = props;

  const [expanded, setExpanded] = useState(false);
  const isLong = job.description.length > DESCRIPTION_CLAMP_CHARS;

  return (
    <article className="group rounded-2xl border border-gray-100 dark:border-zinc-800 bg-background overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative h-40 bg-gray-100 dark:bg-zinc-800">
        {job.image ? (
          <Image
            src={job.image}
            alt={`${job.title} at ${job.company}`}
            fill
            // Convex returns a ready-to-use storage URL. Bypassing Next's
            // optimizer keeps local and deployed storage URLs browser-loadable.
            unoptimized
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
            <Briefcase className="h-10 w-10 text-primary/40" />
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {job.title}
        </h3>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {job.company}
        </p>

        <p className="mt-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {formatSalaryRange(job.salaryMin, job.salaryMax)} / year
        </p>

        <p
          className={`mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400 ${
            isLong && !expanded ? "line-clamp-4" : ""
          }`}
        >
          {job.description}
        </p>

        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-2 text-xs font-semibold text-primary hover:underline"
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </article>
  );
}
