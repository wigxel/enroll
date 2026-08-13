"use client";

import { useMutation, useQuery } from "convex/react";
import { Briefcase, GripVertical, Plus, X } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  JobFormDialog,
  type JobRecord,
} from "~/components/admin/dialogs/JobFormDialog";
import { LinkJobsSheet } from "~/components/admin/dialogs/LinkJobsSheet";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { formatSalaryRange } from "~/lib/job.helpers";

interface JobsSectionProps {
  courseId: Id<"courses">;
}

const sameOrder = (a: JobRecord[], b: JobRecord[]) =>
  a.length === b.length && a.every((job, index) => job._id === b[index]._id);

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
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const course = courseResult?.success ? courseResult.data : null;
  const allJobs = allJobsResult?.success ? allJobsResult.data : [];

  // Memoised because the mirrored order below syncs off this array's identity —
  // a fresh array every render would re-run that effect forever.
  const linkedJobs = useMemo<JobRecord[]>(
    () => (linkedJobsResult?.success ? linkedJobsResult.data : []),
    [linkedJobsResult],
  );

  // Reordering is optimistic: the drag must paint immediately, so the order is
  // mirrored locally and re-synced whenever the server view changes.
  const [orderedJobs, setOrderedJobs] = useState<JobRecord[]>([]);
  // The order as it stood before the current drag. A failed save has to roll
  // back from here — the server never changed, so the query cannot correct us.
  const orderBeforeDrag = useRef<JobRecord[]>([]);

  useEffect(() => {
    setOrderedJobs(linkedJobs);
  }, [linkedJobs]);

  const availableJobs = allJobs.filter(
    (job) => !(course?.jobIds ?? []).includes(job._id),
  );

  // A single card has nothing to swap with, so the grab handle stays hidden.
  const isReorderable = orderedJobs.length > 1;

  const persistOrder = async (next: JobRecord[]) => {
    const previous = orderBeforeDrag.current;
    // Picked a card up and put it straight back down — nothing to save.
    if (sameOrder(previous, next)) return;

    setIsSavingOrder(true);
    try {
      const res = await updateCourseJobs({
        courseId,
        jobIds: next.map((job) => job._id),
      });
      if (!res.success) {
        setOrderedJobs(previous);
        toast.error(res.error);
      }
    } catch {
      setOrderedJobs(previous);
      toast.error("Failed to save the new order");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDragStart = () => {
    orderBeforeDrag.current = orderedJobs;
  };

  // onReorder fires on every pixel of the drag, so the write waits for the drop.
  const handleReorder = (next: JobRecord[]) => setOrderedJobs(next);

  const handleDragEnd = () => persistOrder(orderedJobs);

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
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Job Opportunities
          </h2>
          {isSavingOrder ? (
            <span className="text-xs text-gray-400">Saving order…</span>
          ) : isReorderable ? (
            <span className="text-xs text-gray-400">
              Drag to set the order shown on the course page.
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/jobs"
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Manage library
          </Link>
          <Button size="sm" onClick={() => setShowLinkJobSheet(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Job
          </Button>
        </div>
      </div>

      {orderedJobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">
            No job opportunities linked yet.
          </p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={orderedJobs}
          onReorder={handleReorder}
          className="space-y-2"
        >
          {orderedJobs.map((job) => (
            <LinkedJobCard
              key={job._id}
              job={job}
              isReorderable={isReorderable}
              // Unlinking mid-save would build a new list from the order the
              // server still holds, racing the order being written.
              canUnlink={!isSavingOrder}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onUnlink={() => handleUnlinkJob(job._id)}
            />
          ))}
        </Reorder.Group>
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

interface LinkedJobCardProps {
  job: JobRecord;
  isReorderable: boolean;
  canUnlink: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onUnlink: () => void;
}

function LinkedJobCard(props: LinkedJobCardProps) {
  const { job, isReorderable, canUnlink, onDragStart, onDragEnd, onUnlink } =
    props;
  // dragListener is off so the whole card is not a drag surface — only the
  // handle starts a drag, leaving the unlink button clickable.
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={job}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="rounded-lg border border-gray-200 bg-white p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 gap-3">
          {isReorderable && (
            <button
              type="button"
              aria-label={`Reorder ${job.title}`}
              onPointerDown={(event) => dragControls.start(event)}
              className="mt-1 cursor-grab touch-none text-gray-400 hover:text-gray-600 active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5" />
            </button>
          )}

          {job.image && (
            // Convex hands back an opaque, rotating storage URL, so routing it
            // through next/image only adds a proxy hop.
            // biome-ignore lint/performance/noImgElement: Convex storage URL, see above
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
          onClick={onUnlink}
          disabled={!canUnlink}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Unlink job"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Reorder.Item>
  );
}
