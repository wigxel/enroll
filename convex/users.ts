import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requirePrivilege, getUserRole, now } from "./utils";

/**
 * Creates or retrieves a user from the database based on Clerk identity.
 * Called during sign-up / first login to upsert the user record.
 */
export const createOrGetUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) return existing._id;

    // Find the default "Applicant" role
    const applicantRole = await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", "Applicant"))
      .unique();

    if (!applicantRole) {
      throw new Error(
        "Default 'Applicant' role not found. Please seed the roles table.",
      );
    }

    const timestamp = now();
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role: applicantRole._id,
      profileImage: args.profileImage,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return userId;
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
    const user = await requireAuth(ctx);

    await ctx.db.patch(user._id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.profileImage !== undefined && {
        profileImage: args.profileImage,
      }),
      updatedAt: now(),
    });
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
    await requirePrivilege(ctx, "user:read");

    const pageSize = 20;
    let usersQuery;

    if (args.roleFilter) {
      usersQuery = ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.roleFilter!));
    } else {
      usersQuery = ctx.db.query("users");
    }

    const allUsers = await usersQuery.collect();

    // Apply search filter in memory (Convex doesn't support full-text search on queries)
    const filtered = args.search
      ? allUsers.filter(
          (u) =>
            u.name.toLowerCase().includes(args.search!.toLowerCase()) ||
            u.email.toLowerCase().includes(args.search!.toLowerCase()),
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
      users: usersWithRoles,
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / pageSize),
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
    await requirePrivilege(ctx, "student:read:list");

    // Find the "Student" role
    const studentRole = await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", "Student"))
      .unique();

    if (!studentRole) return { users: [], total: 0, page: 0, totalPages: 0 };

    let studentUsers;

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

    // Apply search filter
    const filtered = args.search
      ? studentUsers.filter(
          (u) =>
            u.name.toLowerCase().includes(args.search!.toLowerCase()) ||
            u.email.toLowerCase().includes(args.search!.toLowerCase()),
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
      users: paginated,
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / pageSize),
    };
  },
});

/**
 * Admin: Assigns a new role to a user.
 */
export const assignRole = mutation({
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
  },
});
