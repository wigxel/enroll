import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requirePrivilege, now } from "./utils";

/**
 * Retrieves notifications for the currently authenticated user.
 */
export const list = query({
    args: {
        filter: v.optional(
            v.union(v.literal("unread"), v.literal("all"), v.literal("archived")),
        ),
        page: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await requireAuth(ctx);
        const filter = args.filter ?? "all";

        let notifications;

        if (filter === "unread") {
            notifications = await ctx.db
                .query("notifications")
                .withIndex("by_userId_isRead", (q) =>
                    q.eq("userId", user._id).eq("isRead", false),
                )
                .collect();
            // Exclude archived
            notifications = notifications.filter((n) => !n.isArchived);
        } else if (filter === "archived") {
            notifications = await ctx.db
                .query("notifications")
                .withIndex("by_userId_isArchived", (q) =>
                    q.eq("userId", user._id).eq("isArchived", true),
                )
                .collect();
        } else {
            notifications = await ctx.db
                .query("notifications")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .collect();
            // Exclude archived from "all" view
            notifications = notifications.filter((n) => !n.isArchived);
        }

        // Sort by date (newest first)
        notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        // Pagination
        const pageSize = 20;
        const page = args.page ?? 0;
        const start = page * pageSize;
        const paginated = notifications.slice(start, start + pageSize);

        return {
            notifications: paginated,
            total: notifications.length,
            page,
            totalPages: Math.ceil(notifications.length / pageSize),
        };
    },
});

/**
 * Admin: Lists notifications targeting admin roles.
 */
export const listAdmin = query({
    args: {
        filter: v.optional(
            v.union(v.literal("unread"), v.literal("all"), v.literal("archived")),
        ),
        page: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await requirePrivilege(ctx, "notification:read:admin");
        const filter = args.filter ?? "all";

        let notifications;

        if (filter === "unread") {
            notifications = await ctx.db
                .query("notifications")
                .withIndex("by_userId_isRead", (q) =>
                    q.eq("userId", user._id).eq("isRead", false),
                )
                .collect();
            notifications = notifications.filter((n) => !n.isArchived);
        } else if (filter === "archived") {
            notifications = await ctx.db
                .query("notifications")
                .withIndex("by_userId_isArchived", (q) =>
                    q.eq("userId", user._id).eq("isArchived", true),
                )
                .collect();
        } else {
            notifications = await ctx.db
                .query("notifications")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .collect();
            notifications = notifications.filter((n) => !n.isArchived);
        }

        // Sort newest first
        notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        // Pagination
        const pageSize = 20;
        const page = args.page ?? 0;
        const start = page * pageSize;
        const paginated = notifications.slice(start, start + pageSize);

        return {
            notifications: paginated,
            total: notifications.length,
            page,
            totalPages: Math.ceil(notifications.length / pageSize),
        };
    },
});

/**
 * Returns the unread notification count for the current user.
 */
export const getUnreadCount = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireAuth(ctx);

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_userId_isRead", (q) =>
                q.eq("userId", user._id).eq("isRead", false),
            )
            .collect();

        // Exclude archived
        const count = unread.filter((n) => !n.isArchived).length;
        return count;
    },
});

/**
 * Marks a single notification as read.
 */
export const markAsRead = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        const user = await requireAuth(ctx);
        const notification = await ctx.db.get(args.notificationId);

        if (!notification) {
            throw new Error("Notification not found.");
        }
        if (notification.userId !== user._id) {
            throw new Error("You can only mark your own notifications as read.");
        }

        await ctx.db.patch(args.notificationId, { isRead: true });
    },
});

/**
 * Marks all notifications for the current user as read.
 */
export const markAllAsRead = mutation({
    args: {},
    handler: async (ctx) => {
        const user = await requireAuth(ctx);

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_userId_isRead", (q) =>
                q.eq("userId", user._id).eq("isRead", false),
            )
            .collect();

        await Promise.all(
            unread.map((n) => ctx.db.patch(n._id, { isRead: true })),
        );
    },
});

/**
 * Archives a notification.
 */
export const archive = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        const user = await requireAuth(ctx);
        const notification = await ctx.db.get(args.notificationId);

        if (!notification) {
            throw new Error("Notification not found.");
        }
        if (notification.userId !== user._id) {
            throw new Error("You can only archive your own notifications.");
        }

        await ctx.db.patch(args.notificationId, { isArchived: true });
    },
});

/**
 * Internal helper: Creates a notification for a specific user or for all admin users.
 * Called by other mutations via ctx.runMutation(internal.notifications.sendNotification, ...).
 */
export const sendNotification = internalMutation({
    args: {
        type: v.string(),
        title: v.string(),
        body: v.string(),
        relatedEntityId: v.optional(v.string()),
        relatedEntityType: v.optional(v.string()),
        targetUserId: v.optional(v.id("users")),
        targetAdmins: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const timestamp = now();

        if (args.targetUserId) {
            // Send to a specific user
            await ctx.db.insert("notifications", {
                userId: args.targetUserId,
                type: args.type,
                title: args.title,
                body: args.body,
                relatedEntityId: args.relatedEntityId,
                relatedEntityType: args.relatedEntityType,
                isRead: false,
                isArchived: false,
                createdAt: timestamp,
            });
        }

        if (args.targetAdmins) {
            // Find all admin and staff roles
            const adminRole = await ctx.db
                .query("roles")
                .withIndex("by_name", (q) => q.eq("name", "Admin"))
                .unique();

            const staffRole = await ctx.db
                .query("roles")
                .withIndex("by_name", (q) => q.eq("name", "Staff"))
                .unique();

            const roleIds = [adminRole?._id, staffRole?._id].filter(Boolean);

            // Find all admin/staff users and send them notifications
            for (const roleId of roleIds) {
                if (!roleId) continue;
                const users = await ctx.db
                    .query("users")
                    .withIndex("by_role", (q) => q.eq("role", roleId))
                    .collect();

                for (const user of users) {
                    await ctx.db.insert("notifications", {
                        userId: user._id,
                        type: args.type,
                        title: args.title,
                        body: args.body,
                        relatedEntityId: args.relatedEntityId,
                        relatedEntityType: args.relatedEntityType,
                        isRead: false,
                        isArchived: false,
                        createdAt: timestamp,
                    });
                }
            }
        }
    },
});
