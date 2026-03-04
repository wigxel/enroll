import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requirePrivilege, now } from "./utils";

/**
 * Admin: Lists all courses (active and inactive) sorted by order.
 */
export const listAll = query({
    args: {},
    handler: async (ctx) => {
        await requirePrivilege(ctx, "course:read:all");

        const courses = await ctx.db
            .query("courses")
            .withIndex("by_order")
            .collect();

        return courses;
    },
});

/**
 * Public: Lists only active courses for the application form dropdown.
 */
export const listActive = query({
    args: {},
    handler: async (ctx) => {
        const courses = await ctx.db
            .query("courses")
            .withIndex("by_isActive", (q) => q.eq("isActive", true))
            .collect();

        // Sort by order
        courses.sort((a, b) => a.order - b.order);

        return courses;
    },
});

/**
 * Admin: Creates a new course.
 * New courses are placed at the end of the order list by default.
 */
export const create = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        duration: v.string(),
        certification: v.string(),
        coverPhoto: v.optional(v.string()),
        tuitionFee: v.number(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        await requirePrivilege(ctx, "course:manage");

        // Determine the next order value
        const allCourses = await ctx.db.query("courses").collect();
        const maxOrder = allCourses.reduce(
            (max, course) => Math.max(max, course.order),
            0,
        );

        const timestamp = now();
        const courseId = await ctx.db.insert("courses", {
            name: args.name,
            description: args.description,
            duration: args.duration,
            certification: args.certification,
            coverPhoto: args.coverPhoto,
            tuitionFee: args.tuitionFee,
            order: maxOrder + 1,
            isActive: args.isActive,
            createdAt: timestamp,
            updatedAt: timestamp,
        });

        return courseId;
    },
});

/**
 * Admin: Updates an existing course.
 */
export const update = mutation({
    args: {
        courseId: v.id("courses"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        duration: v.optional(v.string()),
        certification: v.optional(v.string()),
        coverPhoto: v.optional(v.string()),
        tuitionFee: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await requirePrivilege(ctx, "course:manage");

        const course = await ctx.db.get(args.courseId);
        if (!course) {
            throw new Error("Course not found.");
        }

        await ctx.db.patch(args.courseId, {
            ...(args.name !== undefined && { name: args.name }),
            ...(args.description !== undefined && { description: args.description }),
            ...(args.duration !== undefined && { duration: args.duration }),
            ...(args.certification !== undefined && { certification: args.certification }),
            ...(args.coverPhoto !== undefined && { coverPhoto: args.coverPhoto }),
            ...(args.tuitionFee !== undefined && { tuitionFee: args.tuitionFee }),
            ...(args.isActive !== undefined && { isActive: args.isActive }),
            updatedAt: now(),
        });
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
    handler: async (ctx, args) => {
        await requirePrivilege(ctx, "course:manage");

        const timestamp = now();
        await Promise.all(
            args.items.map((item) =>
                ctx.db.patch(item.id, {
                    order: item.order,
                    updatedAt: timestamp,
                }),
            ),
        );
    },
});

/**
 * Admin: Generates a Convex storage upload URL for course cover photos.
 */
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        await requirePrivilege(ctx, "course:manage");
        return await ctx.storage.generateUploadUrl();
    },
});
