"use client";

import { useMutation, useQuery } from "convex/react";
import { Briefcase, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { JobFormDialog } from "~/components/admin/dialogs/JobFormDialog";
import { LinkJobsSheet } from "~/components/admin/dialogs/LinkJobsSheet";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { formatSalaryRange } from "~/lib/job.helpers";

interface JobsSectionProps {
  courseId: Id<"courses">;
}

export function JobsSection({ courseId }: JobsSectionProps) {
  const courseResult = useQuery(api.courses.getById, { courseId });
  const allJobsResult = useQuery(api.jobs.list);
  const linkedJobsResult = useQuery(api.jobs.listByIds, {
    jobIds: courseResult?.success ? (courseResult.data?.jobIds ?? []) : [],
  });
  const updateCourseJobs = useMutation(api.courses.updateJobs);
  const createJob = useMutation(api.jobs.create);

  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showLinkJobSheet, setShowLinkJobSheet] = useState(false);

  const course = courseResult?.success ? courseResult.data : null;
  const allJobs = allJobsResult?.success ? allJobsResult.data : [];
  const linkedJobs = linkedJobsResult?.success ? linkedJobsResult.data : [];

  const availableJobs = allJobs.filter(
    (job) => !(course?.jobIds ?? []).includes(job._id),
  );

  const handleLinkJobs = async (jobIds: Id<"jobs">[]) => {
    if (!course) return;

    const currentJobIds = course.jobIds ?? [];
    const newJobsToAdd = jobIds.filter((id) => !currentJobIds.includes(id));

    if (newJobsToAdd.length === 0) {
      setShowLinkJobSheet(false);
      return;
    }

    const newJobIds = [...currentJobIds, ...newJobsToAdd];
    try {
      const res = await updateCourseJobs({ courseId, jobIds: newJobIds });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success(newJobsToAdd.length > 1 ? "Jobs linked" : "Job linked");
        setShowLinkJobSheet(false);
      }
    } catch {
      toast.error("Failed to link jobs");
    }
  };

  const handleUnlinkJob = async (jobId: Id<"jobs">) => {
    if (!course) return;
    const newJobIds = (course.jobIds ?? []).filter((id) => id !== jobId);
    try {
      const res = await updateCourseJobs({ courseId, jobIds: newJobIds });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("Job unlinked");
      }
    } catch {
      toast.error("Failed to unlink job");
    }
  };

  const handleCreateJob = async (jobId: Id<"jobs">) => {
    if (!course) return;
    const newJobIds = [...(course?.jobIds ?? []), jobId];
    try {
      const res = await updateCourseJobs({ courseId, jobIds: newJobIds });
      if (!res.success) {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to link job");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Job Opportunities
        </h2>
        <Button size="sm" onClick={() => setShowLinkJobSheet(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Job
        </Button>
      </div>

      {linkedJobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">
            No job opportunities linked yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {linkedJobs.map((job) => (
            <div
              key={job._id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-1 gap-3">
                  {job.image && (
                    <img
                      src={job.image}
                      alt={job.title}
                      className="h-14 w-14 shrink-0 rounded-md border border-gray-200 object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-500">
                      {job.company} ·{" "}
                      {formatSalaryRange(job.salaryMin, job.salaryMax, {
                        compact: true,
                      })}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {job.description}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnlinkJob(job._id)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Unlink job"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <JobFormDialog
        open={showJobDialog}
        onOpenChange={setShowJobDialog}
        onCreated={handleCreateJob}
      />

      <LinkJobsSheet
        isOpen={showLinkJobSheet}
        onOpenChange={setShowLinkJobSheet}
        availableJobs={availableJobs}
        linkedJobs={linkedJobs}
        onLink={handleLinkJobs}
        onCreateNew={() => {
          setShowLinkJobSheet(false);
          setShowJobDialog(true);
        }}
      />
    </div>
  );
}
