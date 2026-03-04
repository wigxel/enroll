import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requirePrivilege, now } from "./utils";

/**
 * Fetches global system settings.
 * Returns null if no settings record has been created yet.
 */
export const get = query({
    args: {},
    handler: async (ctx) => {
        await requirePrivilege(ctx, "settings:update");

        const settings = await ctx.db.query("settings").first();
        return settings;
    },
});

/**
 * Admin: Updates global system settings (upsert pattern).
 */
export const update = mutation({
    args: {
        isAcceptingApplications: v.boolean(),
        openDate: v.optional(v.string()),
        closeDate: v.optional(v.string()),
        applicationFeeAmount: v.optional(v.number()),
        tuitionFeeAmount: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requirePrivilege(ctx, "settings:update");

        const existing = await ctx.db.query("settings").first();
        const timestamp = now();

        if (existing) {
            await ctx.db.patch(existing._id, {
                isAcceptingApplications: args.isAcceptingApplications,
                ...(args.openDate !== undefined && { openDate: args.openDate }),
                ...(args.closeDate !== undefined && { closeDate: args.closeDate }),
                ...(args.applicationFeeAmount !== undefined && {
                    applicationFeeAmount: args.applicationFeeAmount,
                }),
                ...(args.tuitionFeeAmount !== undefined && {
                    tuitionFeeAmount: args.tuitionFeeAmount,
                }),
                updatedAt: timestamp,
            });
        } else {
            await ctx.db.insert("settings", {
                isAcceptingApplications: args.isAcceptingApplications,
                openDate: args.openDate,
                closeDate: args.closeDate,
                applicationFeeAmount: args.applicationFeeAmount ?? 0,
                tuitionFeeAmount: args.tuitionFeeAmount ?? 0,
                updatedAt: timestamp,
            });
        }
    },
});

/**
 * Public: Checks if the application window is currently open.
 * Used on the student-facing application page to show/hide the form.
 */
export const getAppStatus = query({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db.query("settings").first();

        if (!settings) {
            // Default: applications are closed until settings are configured
            return {
                isOpen: false,
                applicationFeeAmount: 0,
                message: "Application settings have not been configured yet.",
            };
        }

        // Check manual override first
        if (!settings.isAcceptingApplications) {
            return {
                isOpen: false,
                applicationFeeAmount: settings.applicationFeeAmount,
                message: "Applications are currently closed.",
            };
        }

        // Check time-based window
        const currentDate = new Date().toISOString();

        if (settings.openDate && currentDate < settings.openDate) {
            return {
                isOpen: false,
                applicationFeeAmount: settings.applicationFeeAmount,
                message: `Applications will open on ${settings.openDate}.`,
            };
        }

        if (settings.closeDate && currentDate > settings.closeDate) {
            return {
                isOpen: false,
                applicationFeeAmount: settings.applicationFeeAmount,
                message: "The application window has closed.",
            };
        }

        return {
            isOpen: true,
            applicationFeeAmount: settings.applicationFeeAmount,
            message: "Applications are open.",
        };
    },
});
