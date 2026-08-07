"use client";

import {
  Briefcase,
  Edit,
  Eye,
  EyeOff,
  GripVertical,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { formatSalaryRange } from "~/lib/job.helpers";
import type { JobLibraryItem } from "./types";

interface JobRowProps {
  job: JobLibraryItem;
  /** Dragging is suppressed while a search filter hides part of the list. */
  isDraggable: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

/**
 * A single row in the job library. Renders inside a Reorder.Item only while the
 * full, unfiltered list is on screen — reordering a filtered subset would write
 * back a misleading global order.
 */
export function JobRow(props: JobRowProps) {
  const dragControls = useDragControls();

  if (!props.isDraggable) {
    return <JobRowContent {...props} />;
  }

  return (
    <Reorder.Item
      value={props.job}
      dragListener={false}
      dragControls={dragControls}
    >
      <JobRowContent {...props} dragControls={dragControls} />
    </Reorder.Item>
  );
}

function JobRowContent(
  props: JobRowProps & { dragControls?: ReturnType<typeof useDragControls> },
) {
  const { job, isDraggable, onEdit, onToggleActive, onDelete, dragControls } =
    props;

  const linkedCount = job.linkedCourses.length;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {isDraggable ? (
        <button
          type="button"
          aria-label={`Reorder ${job.title}`}
          onPointerDown={(event) => dragControls?.start(event)}
          className="mt-1 cursor-grab touch-none text-gray-400 hover:text-gray-600 active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>
      ) : (
        <div className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
      )}

      {job.image ? (
        // Convex hands back an opaque, rotating storage URL, so routing it
        // through next/image only adds a proxy hop. This matches how the course
        // detail screen renders the very same thumbnails.
        // biome-ignore lint/performance/noImgElement: Convex storage URL, see above
        <img
          src={job.image}
          alt=""
          className="h-14 w-14 shrink-0 rounded-md border border-gray-200 object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50">
          <Briefcase className="h-5 w-5 text-gray-300" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-gray-900">{job.title}</h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              job.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {job.isActive ? "Active" : "Hidden"}
          </span>
        </div>

        <p className="mt-0.5 text-sm text-gray-500">
          {job.company} ·{" "}
          {formatSalaryRange(job.salaryMin, job.salaryMax, { compact: true })} /
          year
        </p>

        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
          {job.description}
        </p>

        <p className="mt-2 text-xs text-gray-400">
          {linkedCount === 0
            ? "Not linked to any course"
            : `Linked to ${linkedCount} course${linkedCount === 1 ? "" : "s"}: ${job.linkedCourses.join(", ")}`}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Actions for ${job.title}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleActive}>
            {job.isActive ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide from courses
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show on courses
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
