import { v } from "convex/values";
import { safeArray } from "../lib/data.helpers";
import { query } from "./_generated/server";
import { getCurrentUser, getUserRole, type Result } from "./utils";

/**
 * Get the current authenticated user with their role information.
 */
export const getCurrentUserWithRole = query({
  args: {},
  handler: async (ctx): Promise<Result<any>> => {
    const user = await getCurrentUser(ctx);
    if (!user) return { success: false, error: "Not authenticated" };

    const role = await getUserRole(ctx, user.role);

    return {
      success: true,
      data: {
        ...user,
        roleName: role?.name ?? null,
        privileges: role?.privileges ?? [],
      },
    };
  },
});

/**
 * Lists all available roles in the system.
 */
export const listRoles = query({
  args: {},
  handler: async (ctx): Promise<Result<any[]>> => {
    const roles = await ctx.db.query("roles").collect();
    return { success: true, data: safeArray(roles) };
  },
});

/**
 * Retrieves a specific role by its ID.
 */
export const getRole = query({
  args: { roleId: v.id("roles") },
  handler: async (ctx, args): Promise<Result<any>> => {
    const role = await ctx.db.get(args.roleId);
    if (!role) return { success: false, error: "Role not found" };
    return { success: true, data: role };
  },
});

/**
 * Checks if the currently authenticated user has a specific privilege.
 * Returns true/false — useful for frontend access control.
 */
export const hasPrivilege = query({
  args: { privilege: v.string() },
  handler: async (ctx, args): Promise<Result<boolean>> => {
    const user = await getCurrentUser(ctx);
    if (!user) return { success: true, data: false };

    const role = await ctx.db.get(user.role);
    if (!role) return { success: true, data: false };

    return { success: true, data: role.privileges.includes(args.privilege) };
  },
});

/**
 * Fetches a specific user along with their role details.
 * Used by admin to inspect a user.
 */
export const getUserWithRole = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<Result<any>> => {
    const user = await ctx.db.get(args.userId);
    if (!user) return { success: false, error: "User not found" };

    const role = await getUserRole(ctx, user.role);
    return {
      success: true,
      data: {
        ...user,
        roleName: role?.name ?? null,
        privileges: role?.privileges ?? [],
      },
    };
  },
});
