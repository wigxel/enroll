import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, type QueryCtx, query } from "./_generated/server";
import { now, type Result, requirePrivilege } from "./utils";

export const MAX_DESCRIPTION_WORDS = 600;

const countWords = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

/**
 * Validates job field values shared between create and update.
 * Returns an error string, or null when the input is valid.
 */
const validateJobInput = (input: {
  title?: string;
  company?: string;
  salaryMin?: number;
  salaryMax?: number;
  description?: string;
}): string | null => {
  if (input.title !== undefined && input.title.trim().length === 0) {
    return "Job title is required.";
  }

  if (input.company !== undefined && input.company.trim().length === 0) {
    return "Company name is required.";
  }

  if (input.description !== undefined) {
    if (input.description.trim().length === 0) {
      return "Description is required.";
    }
    const words = countWords(input.description);
    if (words > MAX_DESCRIPTION_WORDS) {
      return `Description must be ${MAX_DESCRIPTION_WORDS} words or fewer (currently ${words}).`;
    }
  }

  if (input.salaryMin !== undefined && input.salaryMin < 0) {
    return "Minimum salary cannot be negative.";
  }

  if (input.salaryMax !== undefined && input.salaryMax < 0) {
    return "Maximum salary cannot be negative.";
  }

  if (
    input.salaryMin !== undefined &&
    input.salaryMax !== undefined &&
    input.salaryMin > input.salaryMax
  ) {
    return "Minimum salary cannot exceed maximum salary.";
  }

  return null;
};

/**
 * Resolves a job's stored image ID into a public URL.
 */
const withImageUrl = async <T extends { image?: string }>(
  ctx: QueryCtx,
  job: T,
) => {
  let imageUrl: string | undefined;
  if (job.image) {
    const url = await ctx.storage.getUrl(job.image as Id<"_storage">);
    imageUrl = url ?? undefined;
  }
  return { ...job, image: imageUrl };
};

/**
 * Admin: Lists every job in the library, sorted by display order.
 */
export const list = query({
  args: {},
  handler: async (ctx): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "course:read:all");
    if (!privResult.success) return privResult;

    const jobs = await ctx.db.query("jobs").withIndex("by_order").collect();

    return {
      success: true,
      data: await Promise.all(jobs.map((job) => withImageUrl(ctx, job))),
    };
  },
});

/**
 * Admin: Lists every job alongside the courses currently linking to it.
 *
 * Deleting a job unlinks it from its courses, so the management screen needs
 * that impact up front to warn before a destructive action rather than after.
 */
export const listWithUsage = query({
  args: {},
  handler: async (ctx): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "course:read:all");
    if (!privResult.success) return privResult;

    const [jobs, courses] = await Promise.all([
      ctx.db.query("jobs").withIndex("by_order").collect(),
      ctx.db.query("courses").collect(),
    ]);

    // Invert the course -> jobIds relation once, so usage lookup stays O(1)
    // per job instead of rescanning every course for each one.
    const usageByJobId = new Map<Id<"jobs">, string[]>();
    for (const course of courses) {
      for (const jobId of course.jobIds ?? []) {
        const existing = usageByJobId.get(jobId);
        if (existing) {
          existing.push(course.name);
        } else {
          usageByJobId.set(jobId, [course.name]);
        }
      }
    }

    return {
      success: true,
      data: await Promise.all(
        jobs.map(async (job) => ({
          ...(await withImageUrl(ctx, job)),
          // `image` above is a display URL. The edit form has to round-trip the
          // original storage ID, otherwise saving would persist the URL back
          // into the field and break later lookups.
          imageStorageId: job.image,
          linkedCourses: usageByJobId.get(job._id) ?? [],
        })),
      ),
    };
  },
});

/**
 * Admin: Resolves a specific set of job IDs, preserving the given order.
 */
export const listByIds = query({
  args: { jobIds: v.array(v.id("jobs")) },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "course:read:all");
    if (!privResult.success) return privResult;

    if (args.jobIds.length === 0) {
      return { success: true, data: [] };
    }

    const jobs = await Promise.all(args.jobIds.map((id) => ctx.db.get(id)));
    const validJobs = jobs.filter((j): j is NonNullable<typeof j> => !!j);

    return {
      success: true,
      data: await Promise.all(validJobs.map((job) => withImageUrl(ctx, job))),
    };
  },
});

/**
 * Admin: Creates a job and appends it to the end of the order list.
 */
export const create = mutation({
  args: {
    title: v.string(),
    company: v.string(),
    salaryMin: v.number(),
    salaryMax: v.number(),
    image: v.optional(v.string()),
    description: v.string(),
  },
  handler: async (ctx, args): Promise<Result<Id<"jobs">>> => {
    const privResult = await requirePrivilege(ctx, "course:manage");
    if (!privResult.success) return privResult as any;

    const validationError = validateJobInput(args);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const existingJobs = await ctx.db
      .query("jobs")
      .withIndex("by_order")
      .collect();
    const maxOrder = existingJobs.reduce(
      (max, job) => Math.max(max, job.order),
      -1,
    );

    const timestamp = now();
    const jobId = await ctx.db.insert("jobs", {
      title: args.title.trim(),
      company: args.company.trim(),
      salaryMin: args.salaryMin,
      salaryMax: args.salaryMax,
      image: args.image,
      description: args.description.trim(),
      order: maxOrder + 1,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return { success: true, data: jobId };
  },
});

/**
 * Admin: Updates an existing job.
 */
export const update = mutation({
  args: {
    jobId: v.id("jobs"),
    title: v.optional(v.string()),
    company: v.optional(v.string()),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    // null explicitly clears the image; omitted leaves it unchanged.
    image: v.optional(v.union(v.string(), v.null())),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<Result<null>> => {
    const privResult = await requirePrivilege(ctx, "course:manage");
    if (!privResult.success) return privResult;

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      return { success: false, error: "Job not found." };
    }

    // Validate against the merged record so a partial update cannot leave the
    // stored salary range inverted.
    const validationError = validateJobInput({
      title: args.title,
      company: args.company,
      description: args.description,
      salaryMin: args.salaryMin ?? job.salaryMin,
      salaryMax: args.salaryMax ?? job.salaryMax,
    });
    if (validationError) {
      return { success: false, error: validationError };
    }

    await ctx.db.patch(args.jobId, {
      ...(args.title !== undefined && { title: args.title.trim() }),
      ...(args.company !== undefined && { company: args.company.trim() }),
      ...(args.salaryMin !== undefined && { salaryMin: args.salaryMin }),
      ...(args.salaryMax !== undefined && { salaryMax: args.salaryMax }),
      ...(args.image !== undefined && {
        image: args.image === null ? undefined : args.image,
      }),
      ...(args.description !== undefined && {
        description: args.description.trim(),
      }),
      ...(args.isActive !== undefined && { isActive: args.isActive }),
      updatedAt: now(),
    });

    return { success: true, data: null };
  },
});

/**
 * Admin: Deletes a job and unlinks it from every course referencing it, so no
 * course is left pointing at a missing document.
 */
export const deleteJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args): Promise<Result<null>> => {
    const privResult = await requirePrivilege(ctx, "course:manage");
    if (!privResult.success) return privResult;

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      return { success: false, error: "Job not found." };
    }

    const courses = await ctx.db.query("courses").collect();
    const timestamp = now();

    await Promise.all(
      courses
        .filter((course) => course.jobIds?.includes(args.jobId))
        .map((course) =>
          ctx.db.patch(course._id, {
            jobIds: (course.jobIds ?? []).filter((id) => id !== args.jobId),
            updatedAt: timestamp,
          }),
        ),
    );

    await ctx.db.delete(args.jobId);

    return { success: true, data: null };
  },
});
