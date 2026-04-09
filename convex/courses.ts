import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { now, type Result, requirePrivilege } from "./utils";

/**
 * Admin: Lists all courses (active and inactive) sorted by order.
 */
export const listAll = query({
  args: {},
  handler: async (ctx): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "course:read:all");
    if (!privResult.success) return privResult;

    const courses = await ctx.db
      .query("courses")
      .withIndex("by_order")
      .collect();

    return { success: true, data: courses };
  },
});

/**
 * Admin: Gets a single course by ID.
 */
export const getById = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "course:read:all");
    if (!privResult.success) return privResult;

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return { success: false, error: "Course not found." };
    }

    return { success: true, data: course };
  },
});

/**
 * Public: Lists only active courses for the application form dropdown and public catalog.
 * Resolves the coverPhoto storage ID into a full, accessible URL.
 */
export const listActive = query({
  args: {},
  handler: async (ctx): Promise<Result<any>> => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    // Sort by order
    courses.sort((a, b) => a.order - b.order);

    // Resolve cover photo URLs
    const coursesWithUrls = await Promise.all(
      courses.map(async (course) => {
        let coverPhotoUrl: string | undefined;
        if (course.coverPhoto) {
          // Attempt to get the URL from storage. If it's already a full HTTP URL, getUrl handles it or returns null.
          // Fallback to the original string if it looks like a direct URL instead of a storage ID.
          const url = await ctx.storage.getUrl(
            course.coverPhoto as Id<"_storage">,
          );
          coverPhotoUrl = url ?? undefined;
        }

        return {
          ...course,
          coverPhoto: coverPhotoUrl,
        };
      }),
    );

    return { success: true, data: coursesWithUrls };
  },
});

/**
 * Public: Gets a single active course by its URL slug.
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args): Promise<Result<any>> => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!course || !course.isActive) {
      return { success: false, error: "Course not found or inactive." };
    }

    let coverPhotoUrl: string | undefined;
    if (course.coverPhoto) {
      const url = await ctx.storage.getUrl(course.coverPhoto as any);
      coverPhotoUrl = url ?? course.coverPhoto;
    }

    return {
      success: true,
      data: {
        ...course,
        coverPhoto: coverPhotoUrl,
      },
    };
  },
});

/**
 * Admin: Creates a new course.
 * New courses are placed at the end of the order list by default.
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    duration: v.string(),
    certification: v.string(),
    coverPhoto: v.optional(v.string()),
    tuitionFee: v.number(),
    isActive: v.boolean(),
    instructorIds: v.optional(v.array(v.id("instructors"))),
  },
  handler: async (ctx, args): Promise<Result<Id<"courses">>> => {
    const privResult = await requirePrivilege(ctx, "course:manage");
    if (!privResult.success) return privResult as any;

    // Determine the next order value
    const allCourses = await ctx.db.query("courses").collect();
    const maxOrder = allCourses.reduce(
      (max, course) => Math.max(max, course.order),
      0,
    );

    const timestamp = now();
    const courseId = await ctx.db.insert("courses", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      duration: args.duration,
      certification: args.certification,
      coverPhoto: args.coverPhoto,
      tuitionFee: args.tuitionFee,
      order: maxOrder + 1,
      isActive: args.isActive,
      instructorIds: args.instructorIds,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return { success: true, data: courseId };
  },
});

/**
 * Admin: Updates an existing course.
 */
export const update = mutation({
  args: {
    courseId: v.id("courses"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    duration: v.optional(v.string()),
    certification: v.optional(v.string()),
    coverPhoto: v.optional(v.string()),
    tuitionFee: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    instructorIds: v.optional(v.array(v.id("instructors"))),
  },
  handler: async (ctx, args): Promise<Result<null>> => {
    const privResult = await requirePrivilege(ctx, "course:manage");
    if (!privResult.success) return privResult;

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return { success: false, error: "Course not found." };
    }

    await ctx.db.patch(args.courseId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.slug !== undefined && { slug: args.slug }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.duration !== undefined && { duration: args.duration }),
      ...(args.certification !== undefined && {
        certification: args.certification,
      }),
      ...(args.coverPhoto !== undefined && { coverPhoto: args.coverPhoto }),
      ...(args.tuitionFee !== undefined && { tuitionFee: args.tuitionFee }),
      ...(args.isActive !== undefined && { isActive: args.isActive }),
      ...(args.instructorIds !== undefined && {
        instructorIds: args.instructorIds,
      }),
      updatedAt: now(),
    });

    return { success: true, data: null };
  },
});

/**
 * Admin: Bulk updates the order of courses for drag-and-drop reordering.
 */
export const updateOrder = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.id("courses"),
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, args): Promise<Result<null>> => {
    const privResult = await requirePrivilege(ctx, "course:manage");
    if (!privResult.success) return privResult;

    const timestamp = now();
    await Promise.all(
      args.items.map((item) =>
        ctx.db.patch(item.id, {
          order: item.order,
          updatedAt: timestamp,
        }),
      ),
    );

    return { success: true, data: null };
  },
});

/**
 * Admin: Generates a Convex storage upload URL for course cover photos.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx): Promise<Result<string>> => {
    const privResult = await requirePrivilege(ctx, "course:manage");
    if (!privResult.success) return privResult as any;

    const url = await ctx.storage.generateUploadUrl();
    return { success: true, data: url };
  },
});
