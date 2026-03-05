import { query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, getUserRole } from "./utils";

/**
 * Get the current authenticated user with their role information.
 */
export const getCurrentUserWithRole = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const role = await getUserRole(ctx, user.role);
    return {
      ...user,
      roleName: role?.name ?? null,
      privileges: role?.privileges ?? [],
    };
  },
});

/**
 * Lists all available roles in the system.
 */
export const listRoles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("roles").collect();
  },
});

/**
 * Retrieves a specific role by its ID.
 */
export const getRole = query({
  args: { roleId: v.id("roles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.roleId);
  },
});

/**
 * Checks if the currently authenticated user has a specific privilege.
 * Returns true/false — useful for frontend access control.
 */
export const hasPrivilege = query({
  args: { privilege: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return false;

    const role = await ctx.db.get(user.role);
    if (!role) return false;

    return role.privileges.includes(args.privilege);
  },
});

/**
 * Fetches a specific user along with their role details.
 * Used by admin to inspect a user.
 */
export const getUserWithRole = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const role = await getUserRole(ctx, user.role);
    return {
      ...user,
      roleName: role?.name ?? null,
      privileges: role?.privileges ?? [],
    };
  },
});
