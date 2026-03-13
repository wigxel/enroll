import { v } from "convex/values";
import { safeStr } from "../lib/data.helpers";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { deleteUser as deleteClerkUser, updateUserMetadata } from "./clerk";
import {
  getCurrentUser as getAuthUser,
  getUserRole,
  now,
  requireAuth,
  requirePrivilege,
} from "./utils";

/**
 * Creates or retrieves a user from the database based on Clerk identity.
 * Called during sign-up / first login to upsert the user record.
 * If the Clerk JWT carries `public_metadata.pendingRole` (set during invite),
 * that role is assigned automatically instead of the default "Applicant".
 */
export const createOrGetUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Return early if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) return { success: true, data: existing._id };

    // Check for a pre-assigned role from an admin invitation
    const identity = await ctx.auth.getUserIdentity();
    const pendingRoleName = (
      identity?.publicMetadata as Record<string, unknown> | undefined
    )?.pendingRole as string | undefined;

    // Try to find the pending role, fall back to "Applicant"
    let roleRecord = pendingRoleName
      ? await ctx.db
        .query("roles")
        .withIndex("by_name", (q) => q.eq("name", pendingRoleName))
        .unique()
      : null;

    if (!roleRecord) {
      roleRecord = await ctx.db
        .query("roles")
        .withIndex("by_name", (q) => q.eq("name", "Applicant"))
        .unique();
    }

    if (!roleRecord) {
      return {
        success: false,
        error: "Default 'Applicant' role not found. Please seed the roles table.",
      };
    }

    const timestamp = now();
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role: roleRecord._id,
      profileImage: args.profileImage,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return { success: true, data: userId };
  },
});

/**
 * Retrieves the currently authenticated user's record from the database.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) {
      return { success: false, error: "Authentication required." };
    }

    const roleRecord = await getUserRole(ctx, user.role);

    return {
      success: true,
      data: {
        ...user,
        role: roleRecord?.name ?? "User",
      }
    };
  },
});

/**
 * Updates the current user's profile information.
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authResult = await requireAuth(ctx);
    if (!authResult.success) return authResult;

    const user = authResult.data;

    await ctx.db.patch(user._id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.profileImage !== undefined && {
        profileImage: args.profileImage,
      }),
      updatedAt: now(),
    });

    return { success: true, data: null };
  },
});

/**
 * Admin: Lists all users with optional role filtering and search.
 * Supports basic pagination via cursor-style offset.
 */
export const list = query({
  args: {
    search: v.optional(v.string()),
    roleFilter: v.optional(v.id("roles")),
    page: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const privResult = await requirePrivilege(ctx, "user:read");
    if (!privResult.success) return privResult;

    const pageSize = 20;

    const usersQuery = (args.roleFilter)
      ? ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.roleFilter!))
      : ctx.db.query("users");


    const allUsers = await usersQuery.collect();
    const search_ = safeStr(args.search);

    // Apply search filter in memory (Convex doesn't support full-text search on queries)
    const filtered = args.search
      ? allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(search_.toLowerCase()) ||
          u.email.toLowerCase().includes(search_.toLowerCase()),
      )
      : allUsers;

    // Pagination
    const page = args.page ?? 0;
    const start = page * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    // Attach role info
    const usersWithRoles = await Promise.all(
      paginated.map(async (user) => {
        const role = await getUserRole(ctx, user.role);
        return { ...user, roleName: role?.name ?? null };
      }),
    );

    return {
      success: true,
      data: {
        users: usersWithRoles,
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / pageSize),
      }
    };
  },
});

/**
 * Admin: Retrieves a single user's record by ID.
 */
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const privResult = await requirePrivilege(ctx, "user:read");
    if (!privResult.success) return privResult;

    const user = await ctx.db.get(args.userId);
    if (!user) {
      return { success: false, error: "User not found." };
    }

    const role = await getUserRole(ctx, user.role);

    return {
      success: true,
      data: {
        ...user,
        roleName: role?.name ?? null,
      }
    };
  },
});

/**
 * Admin: Lists all users with the "Student" role.
 * Supports search, sorting, and cohort filtering.
 * Enriches each student with courseName, cohortName, and enrolledAt.
 */
export const listStudents = query({
  args: {
    search: v.optional(v.string()),
    sort: v.optional(v.union(v.literal("name"), v.literal("enrolledAt"))),
    page: v.optional(v.number()),
    cohortId: v.optional(v.id("cohorts")),
  },
  handler: async (ctx, args) => {
    const privResult = await requirePrivilege(ctx, "student:read:list");
    if (!privResult.success) return privResult;

    // Find the "Student" role
    const studentRole = await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", "Student"))
      .unique();

    if (!studentRole) {
      return {
        success: true,
        data: { users: [], total: 0, page: 0, totalPages: 0 }
      };
    }

    let studentUsers: Doc<'users'>[]

    if (args.cohortId) {
      // Filter by cohort: query enrollments first, then resolve users
      const enrollments = await ctx.db
        .query("enrollments")
        .withIndex("by_cohortId", (q) => q.eq("cohortId", args.cohortId!))
        .collect();

      const userIds = enrollments.map((e) => e.userId);
      const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
      // Only include users that exist and have the Student role
      studentUsers = users.filter(
        (u): u is NonNullable<typeof u> =>
          u !== null && u.role === studentRole._id,
      );
    } else {
      studentUsers = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", studentRole._id))
        .collect();
    }

    const search_ = safeStr(args.search)?.toLowerCase();

    // Apply search filter
    const filtered = args.search
      ? studentUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(search_) ||
          u.email.toLowerCase().includes(search_),
      )
      : studentUsers;

    // Enrich with enrollment data (courseName, cohortName, enrolledAt)
    const enriched = await Promise.all(
      filtered.map(async (user) => {
        const enrollment = await ctx.db
          .query("enrollments")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .first();

        let courseName = "—";
        let cohortName = "—";
        let enrolledAt = user.createdAt;

        if (enrollment) {
          enrolledAt = enrollment.completedAt ?? enrollment.createdAt;

          // Resolve course name via application → courseId
          const application = await ctx.db.get(enrollment.applicationId);
          if (application) {
            const course = await ctx.db.get(application.data.courseId);
            if (course) courseName = course.name;
          }

          // Resolve cohort name
          if (enrollment.cohortId) {
            const cohort = await ctx.db.get(enrollment.cohortId);
            if (cohort) cohortName = cohort.name;
          }
        }

        return {
          ...user,
          courseName,
          cohortName,
          enrolledAt,
        };
      }),
    );

    // Apply sorting
    const sorted = [...enriched].sort((a, b) => {
      if (args.sort === "name") {
        return a.name.localeCompare(b.name);
      }
      // Default: sort by enrolled date (newest first)
      return b.enrolledAt.localeCompare(a.enrolledAt);
    });

    // Pagination
    const pageSize = 20;
    const page = args.page ?? 0;
    const start = page * pageSize;
    const paginated = sorted.slice(start, start + pageSize);

    return {
      success: true,
      data: {
        users: paginated,
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / pageSize),
      }
    };
  },
});

/**
 * Internal: Delete a user record from Convex database.
 * Used by the `deleteUser` action.
 */
export const deleteUserRecord = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    // Capture clerkId before deleting
    const clerkId = user.clerkId;
    await ctx.db.delete(args.userId);

    return { clerkId };
  },
});

/**
 * Admin: Deletes a user account from both Convex and Clerk.
 */
export const deleteUser = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    try {
      // 1. Delete from Convex & fetch clerkId
      const { clerkId } = await ctx.runMutation(internal.users.deleteUserRecord, {
        userId: args.userId,
      });

      // 2. Delete from Clerk (if it's a real clerkId)
      if (clerkId?.startsWith("user_")) {
        try {
          await deleteClerkUser(clerkId);
        } catch (err: any) {
          console.error("Failed to delete user from Clerk:", err);
        }
      }
      return { success: true, data: null };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to delete user." };
    }
  },
});

/**
 * Internal: Assigns a new role to a user in the database.
 * Used by the `assignRole` action.
 */
export const assignRoleRecord = internalMutation({
  args: {
    userId: v.id("users"),
    newRoleId: v.id("roles"),
  },
  handler: async (ctx, args) => {
    await requirePrivilege(ctx, "user:assign:role");

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found.");
    }

    const newRole = await ctx.db.get(args.newRoleId);
    if (!newRole) {
      throw new Error("Role not found.");
    }

    await ctx.db.patch(args.userId, {
      role: args.newRoleId,
      updatedAt: now(),
    });

    return { clerkId: targetUser.clerkId, roleName: newRole.name };
  },
});

/**
 * Admin: Assigns a new role to a user and syncs it with Clerk metadata.
 */
export const assignRole = action({
  args: {
    userId: v.id("users"),
    newRoleId: v.id("roles"),
  },
  handler: async (ctx, args) => {
    try {
      // 1. Update in Convex. Because it's called with runMutation,
      // the mutation will enforce admin privileges.
      const { clerkId, roleName } = await ctx.runMutation(
        internal.users.assignRoleRecord,
        {
          userId: args.userId,
          newRoleId: args.newRoleId,
        },
      );

      // 2. Update Clerk metadata
      if (clerkId?.startsWith("user_")) {
        try {
          await updateUserMetadata({
            userId: clerkId,
            publicMetadata: { pendingRole: roleName },
          });
        } catch (err: any) {
          console.error("Failed to sync new role to Clerk:", err);
          // Return success anyway because Convex is updated?
          // Or return error? Let's return error if syncing is critical.
          return { success: false, error: `Role assigned in DB but Clerk sync failed: ${err.message}` };
        }
      }

      return { success: true, data: null };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to assign role." };
    }
  },
});

/**
 * Internal: Promotes any user to the "Super Admin" role.
 * Run from the Convex dashboard → Functions, or via CLI:
 *   npx convex run users:makeSuperAdmin '{"email":"you@example.com"}'
 */
export const makeSuperAdmin = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      throw new Error(`No user found with email: ${args.email}`);
    }

    const superAdminRole = await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", "Admin"))
      .unique();

    if (!superAdminRole) {
      throw new Error(
        '"Super Admin" role not found. Please run the seed or create the role first.',
      );
    }

    await ctx.db.patch(user._id, {
      role: superAdminRole._id,
      updatedAt: now(),
    });

    return { userId: user._id, roleName: superAdminRole.name };
  },
});
