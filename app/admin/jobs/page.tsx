"use client";

import { useMutation, useQuery } from "convex/react";
import { Briefcase, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "~/components/admin/dialogs/DeleteConfirmationDialog";
import { JobFormDialog } from "~/components/admin/dialogs/JobFormDialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/convex/_generated/api";
import { safeArray } from "~/lib/data.helpers";
import { JobRow } from "./job-row";
import type { JobLibraryItem } from "./types";

export default function JobsPage() {
  const jobsResult = useQuery(api.jobs.listWithUsage);
  const updateJob = useMutation(api.jobs.update);
  const deleteJob = useMutation(api.jobs.deleteJob);

  const [search, setSearch] = useState("");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<JobLibraryItem | null>(null);
  const [jobPendingDeletion, setJobPendingDeletion] =
    useState<JobLibraryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLoading = jobsResult === undefined;
  const jobs = useMemo(
    () =>
      jobsResult?.success
        ? (safeArray(jobsResult.data) as JobLibraryItem[])
        : [],
    [jobsResult],
  );
  const loadError = jobsResult && !jobsResult.success ? jobsResult.error : null;

  const query = search.trim().toLowerCase();
  const visibleJobs = query
    ? jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query),
      )
    : jobs;

  const openCreateDialog = () => {
    setEditingJob(null);
    setShowFormDialog(true);
  };

  const openEditDialog = (job: JobLibraryItem) => {
    setEditingJob(job);
    setShowFormDialog(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setShowFormDialog(open);
    // Clearing after the close animation avoids the title flipping from
    // "Edit" to "Add" while the sheet is still sliding out.
    if (!open) setTimeout(() => setEditingJob(null), 300);
  };

  const handleToggleActive = async (job: JobLibraryItem) => {
    try {
      const res = await updateJob({ jobId: job._id, isActive: !job.isActive });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(
        job.isActive
          ? "Job hidden from course pages"
          : "Job is now visible on course pages",
      );
    } catch {
      toast.error("Failed to update job visibility");
    }
  };

  const handleConfirmDelete = async () => {
    if (!jobPendingDeletion) return;

    setIsDeleting(true);
    try {
      const res = await deleteJob({ jobId: jobPendingDeletion._id });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Job deleted");
      setJobPendingDeletion(null);
    } catch {
      toast.error("Failed to delete job");
    } finally {
      setIsDeleting(false);
    }
  };

  const linkedCount = jobPendingDeletion?.linkedCourses.length ?? 0;

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Job Opportunities
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Build the shared library of career outcomes, then link roles to
              courses from each course's detail page.
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Job Opportunity
          </Button>
        </div>

        {!isLoading && jobs.length > 0 && (
          <div className="mb-4">
            <Input
              placeholder="Search by title, company, or description..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="max-w-sm"
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-800">{loadError}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">
              No job opportunities yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Add the roles your graduates get hired into, then link them to the
              relevant courses.
            </p>
            <Button className="mt-6" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Job Opportunity
            </Button>
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-sm text-gray-500">
              No jobs match "{search.trim()}".
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleJobs.map((job) => (
              <JobRow
                key={job._id}
                job={job}
                onEdit={() => openEditDialog(job)}
                onToggleActive={() => handleToggleActive(job)}
                onDelete={() => setJobPendingDeletion(job)}
              />
            ))}
          </div>
        )}
      </div>

      <JobFormDialog
        open={showFormDialog}
        onOpenChange={handleFormOpenChange}
        job={
          editingJob
            ? { ...editingJob, image: editingJob.imageStorageId }
            : null
        }
      />

      <DeleteConfirmationDialog
        open={jobPendingDeletion !== null}
        onOpenChange={(open) => {
          if (!open) setJobPendingDeletion(null);
        }}
        title="Job Opportunity"
        itemName={jobPendingDeletion?.title ?? ""}
        warningMessage={
          linkedCount > 0
            ? `This job is linked to ${linkedCount} course${linkedCount === 1 ? "" : "s"} (${jobPendingDeletion?.linkedCourses.join(", ")}). Deleting it removes the role from ${linkedCount === 1 ? "that course" : "those courses"} too.`
            : undefined
        }
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
