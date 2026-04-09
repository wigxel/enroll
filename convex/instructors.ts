import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { now, type Result, requirePrivilege } from "./utils";

/**
 * Admin: Lists all instructors.
 */
export const list = query({
  args: {},
  handler: async (ctx): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "instructor:read");
    if (!privResult.success) return privResult;

    const instructors = await ctx.db
      .query("instructors")
      .withIndex("by_name")
      .collect();

    const instructorsWithPhotos = await Promise.all(
      instructors.map(async (instructor) => {
        let photoUrl: string | undefined;
        if (instructor.photo) {
          const url = await ctx.storage.getUrl(
            instructor.photo as Id<"_storage">,
          );
          photoUrl = url ?? undefined;
        }
        return {
          ...instructor,
          photo: photoUrl,
        };
      }),
    );

    return { success: true, data: instructorsWithPhotos };
  },
});

/**
 * Admin: Gets a single instructor by ID.
 */
export const get = query({
  args: { instructorId: v.id("instructors") },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "instructor:read");
    if (!privResult.success) return privResult;

    const instructor = await ctx.db.get(args.instructorId);
    if (!instructor) {
      return { success: false, error: "Instructor not found." };
    }

    let photoUrl: string | undefined;
    if (instructor.photo) {
      const url = await ctx.storage.getUrl(instructor.photo as Id<"_storage">);
      photoUrl = url ?? undefined;
    }

    return {
      success: true,
      data: {
        ...instructor,
        photo: photoUrl,
      },
    };
  },
});

/**
 * Admin: Creates a new instructor.
 */
export const create = mutation({
  args: {
    name: v.string(),
    title: v.string(),
    photo: v.optional(v.string()),
    bio: v.string(),
  },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "instructor:manage");
    if (!privResult.success) return privResult;

    const timestamp = now();
    const instructorId = await ctx.db.insert("instructors", {
      name: args.name,
      title: args.title,
      photo: args.photo,
      bio: args.bio,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return { success: true, data: { instructorId } };
  },
});

/**
 * Admin: Updates an instructor.
 */
export const update = mutation({
  args: {
    instructorId: v.id("instructors"),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    photo: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "instructor:manage");
    if (!privResult.success) return privResult;

    const instructor = await ctx.db.get(args.instructorId);
    if (!instructor) {
      return { success: false, error: "Instructor not found." };
    }

    await ctx.db.patch(args.instructorId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.title !== undefined && { title: args.title }),
      ...(args.photo !== undefined && { photo: args.photo }),
      ...(args.bio !== undefined && { bio: args.bio }),
      updatedAt: now(),
    });

    return { success: true, data: null };
  },
});

/**
 * Admin: Deletes an instructor.
 */
export const deleteInstructor = mutation({
  args: { instructorId: v.id("instructors") },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "instructor:manage");
    if (!privResult.success) return privResult;

    const instructor = await ctx.db.get(args.instructorId);
    if (!instructor) {
      return { success: false, error: "Instructor not found." };
    }

    await ctx.db.delete(args.instructorId);
    return { success: true, data: null };
  },
});
