import type { Id } from "~/convex/_generated/dataModel";

/**
 * A job as returned by `api.jobs.listWithUsage`: the stored record with its
 * image resolved for display, the original storage ID kept for editing, and
 * the courses currently linking to it.
 */
export interface JobLibraryItem {
  _id: Id<"jobs">;
  title: string;
  company: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  /** Display URL resolved by Convex storage. */
  image?: string;
  /** Raw storage ID, round-tripped by the edit form. */
  imageStorageId?: string;
  isActive: boolean;
  order: number;
  linkedCourses: string[];
}
