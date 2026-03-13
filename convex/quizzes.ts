import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { type Result, requirePrivilege } from "./utils";

/**
 * Admin: List all quiz questions (both active and inactive)
 */
export const list = query({
    args: {},
    handler: async (ctx): Promise<Result<any>> => {
        const privResult = await requirePrivilege(ctx, "content:manage");
        if (!privResult.success) return privResult;

        const questions = await ctx.db
            .query("quizQuestions")
            .order("desc")
            .collect();

        return { success: true, data: questions };
    },
});

/**
 * Public: List active quiz questions for students to take
 * Excludes the correctOptionIndex so it cannot be inspected by the client
 */
export const listActiveForStudents = query({
    args: {},
    handler: async (ctx): Promise<Result<any>> => {
        // Just verify they are logged in.
        // The submitQuiz mutation enforces that they are on the right step.
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return { success: false, error: "Unauthenticated call to listActiveForStudents" };
        }

        const questions = await ctx.db
            .query("quizQuestions")
            .withIndex("by_isActive", (q) => q.eq("isActive", true))
            .collect();

        // Strip out the correct answer from the returned data
        const stripped = questions.map(q => ({
            _id: q._id,
            question: q.question,
            options: q.options,
        }));

        return { success: true, data: stripped };
    },
});

/**
 * Admin: Add a new quiz question
 */
export const create = mutation({
    args: {
        question: v.string(),
        options: v.array(v.string()),
        correctOptionIndex: v.number(),
    },
    handler: async (ctx, args): Promise<Result<null>> => {
        const privResult = await requirePrivilege(ctx, "content:manage");
        if (!privResult.success) return privResult;

        if (args.options.length < 2) {
            return { success: false, error: "A question must have at least 2 options." };
        }
        if (args.correctOptionIndex < 0 || args.correctOptionIndex >= args.options.length) {
            return { success: false, error: "Invalid correct option index." };
        }

        const now = Date.now();
        await ctx.db.insert("quizQuestions", {
            question: args.question,
            options: args.options,
            correctOptionIndex: args.correctOptionIndex,
            isActive: true, // Active by default
            createdAt: now,
            updatedAt: now,
        });

        return { success: true, data: null };
    },
});

/**
 * Admin: Update an existing quiz question
 */
export const update = mutation({
    args: {
        id: v.id("quizQuestions"),
        question: v.string(),
        options: v.array(v.string()),
        correctOptionIndex: v.number(),
    },
    handler: async (ctx, args): Promise<Result<null>> => {
        const privResult = await requirePrivilege(ctx, "content:manage");
        if (!privResult.success) return privResult;

        if (args.options.length < 2) {
            return { success: false, error: "A question must have at least 2 options." };
        }
        if (args.correctOptionIndex < 0 || args.correctOptionIndex >= args.options.length) {
            return { success: false, error: "Invalid correct option index." };
        }

        const existing = await ctx.db.get(args.id);
        if (!existing) {
            return { success: false, error: "Question not found." };
        }

        await ctx.db.patch(args.id, {
            question: args.question,
            options: args.options,
            correctOptionIndex: args.correctOptionIndex,
            updatedAt: Date.now(),
        });

        return { success: true, data: null };
    },
});

/**
 * Admin: Toggle the active status of a question
 */
export const toggleActive = mutation({
    args: {
        id: v.id("quizQuestions"),
        isActive: v.boolean(),
    },
    handler: async (ctx, args): Promise<Result<null>> => {
        const privResult = await requirePrivilege(ctx, "content:manage");
        if (!privResult.success) return privResult;

        const existing = await ctx.db.get(args.id);
        if (!existing) {
            return { success: false, error: "Question not found." };
        }

        await ctx.db.patch(args.id, {
            isActive: args.isActive,
            updatedAt: Date.now(),
        });

        return { success: true, data: null };
    },
});

/**
 * Admin: Delete a question
 */
export const remove = mutation({
    args: { id: v.id("quizQuestions") },
    handler: async (ctx, args): Promise<Result<null>> => {
        const privResult = await requirePrivilege(ctx, "content:manage");
        if (!privResult.success) return privResult;

        const existing = await ctx.db.get(args.id);
        if (!existing) {
            return { success: false, error: "Question not found." };
        }

        await ctx.db.delete(args.id);
        return { success: true, data: null };
    },
});
