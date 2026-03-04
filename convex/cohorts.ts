import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requirePrivilege, now } from "./utils";

/**
 * Lists all cohorts with optional status-derived filtering and student counts.
 */
export const list = query({
    args: {
        search: v.optional(v.string()),
        page: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requirePrivilege(ctx, "cohort:read:all");

        let cohorts = await ctx.db.query("cohorts").collect();

        // Apply search filter
        if (args.search) {
            cohorts = cohorts.filter((c) =>
                c.name.toLowerCase().includes(args.search!.toLowerCase()),
            );
        }

        // Sort by start date (newest first)
        cohorts.sort((a, b) => b.startDate.localeCompare(a.startDate));

        // Pagination
        const pageSize = 20;
        const page = args.page ?? 0;
        const start = page * pageSize;
        const paginated = cohorts.slice(start, start + pageSize);

        // Attach student counts and derive status
        const currentDate = new Date().toISOString();
        const withCounts = await Promise.all(
            paginated.map(async (cohort) => {
                const enrollments = await ctx.db
                    .query("enrollments")
                    .withIndex("by_cohortId", (q) => q.eq("cohortId", cohort._id))
                    .collect();

                let status: "upcoming" | "active" | "completed";
                if (currentDate < cohort.startDate) {
                    status = "upcoming";
                } else if (currentDate > cohort.endDate) {
                    status = "completed";
                } else {
                    status = "active";
                }

                return {
                    ...cohort,
                    studentCount: enrollments.length,
                    status,
                };
            }),
        );

        return {
            cohorts: withCounts,
            total: cohorts.length,
            page,
            totalPages: Math.ceil(cohorts.length / pageSize),
        };
    },
});

/**
 * Retrieves a specific cohort by ID with enrolled students.
 */
export const getById = query({
    args: { cohortId: v.id("cohorts") },
    handler: async (ctx, args) => {
        await requirePrivilege(ctx, "cohort:read:all");

        const cohort = await ctx.db.get(args.cohortId);
        if (!cohort) return null;

        // Get all enrollments in this cohort
        const enrollments = await ctx.db
            .query("enrollments")
            .withIndex("by_cohortId", (q) => q.eq("cohortId", args.cohortId))
            .collect();

        // Attach student details
        const students = await Promise.all(
            enrollments.map(async (enrollment) => {
                const user = await ctx.db.get(enrollment.userId);
                return {
                    enrollmentId: enrollment._id,
                    userId: user?._id,
                    name: user?.name ?? "Unknown",
                    email: user?.email ?? "",
                    enrollmentStatus: enrollment.status,
                };
            }),
        );

        return { ...cohort, students };
    },
});

/**
 * Admin/Staff: Creates a new cohort.
 */
export const create = mutation({
    args: {
        name: v.string(),
        startDate: v.string(),
        endDate: v.string(),
        capacity: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requirePrivilege(ctx, "cohort:manage");

        const cohortId = await ctx.db.insert("cohorts", {
            name: args.name,
            startDate: args.startDate,
            endDate: args.endDate,
            capacity: args.capacity,
        });

        return cohortId;
    },
});

/**
 * Admin/Staff: Updates an existing cohort.
 */
export const update = mutation({
    args: {
        cohortId: v.id("cohorts"),
        name: v.optional(v.string()),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
        capacity: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requirePrivilege(ctx, "cohort:manage");

        const cohort = await ctx.db.get(args.cohortId);
        if (!cohort) {
            throw new Error("Cohort not found.");
        }

        await ctx.db.patch(args.cohortId, {
            ...(args.name !== undefined && { name: args.name }),
            ...(args.startDate !== undefined && { startDate: args.startDate }),
            ...(args.endDate !== undefined && { endDate: args.endDate }),
            ...(args.capacity !== undefined && { capacity: args.capacity }),
        });
    },
});

/**
 * Admin/Staff: Assigns an enrolled student to a cohort.
 */
export const assignStudent = mutation({
    args: {
        enrollmentId: v.id("enrollments"),
        cohortId: v.id("cohorts"),
    },
    handler: async (ctx, args) => {
        await requirePrivilege(ctx, "cohort:manage");

        const enrollment = await ctx.db.get(args.enrollmentId);
        if (!enrollment) {
            throw new Error("Enrollment not found.");
        }

        const cohort = await ctx.db.get(args.cohortId);
        if (!cohort) {
            throw new Error("Cohort not found.");
        }

        // Check capacity if set
        if (cohort.capacity) {
            const currentStudents = await ctx.db
                .query("enrollments")
                .withIndex("by_cohortId", (q) => q.eq("cohortId", args.cohortId))
                .collect();

            if (currentStudents.length >= cohort.capacity) {
                throw new Error("Cohort has reached its maximum capacity.");
            }
        }

        await ctx.db.patch(args.enrollmentId, {
            cohortId: args.cohortId,
            updatedAt: now(),
        });
    },
});
