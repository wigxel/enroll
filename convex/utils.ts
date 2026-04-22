import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import {
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Retrieves the currently authenticated user from the database
 * by resolving the Clerk identity to the internal users table.
 */
export const getCurrentUser = async (
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users"> | null> => {
  const identity = await ctx.auth.getUserIdentity();

  // console.log(">>> identity", { identity });

  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return user;
};

/**
 * Ensures the user is authenticated and returns the user document.
 * Throws an error if not authenticated.
 */
export const requireAuth = async (
  ctx: QueryCtx | MutationCtx,
): Promise<Result<Doc<"users">>> => {
  const user = await getCurrentUser(ctx);

  if (!user) {
    return {
      success: false,
      error: "Authentication required. Please sign in.",
    };
  }
  return { success: true, data: user };
};

/**
 * Fetches the user's role document from the database.
 */
export const getUserRole = async (
  ctx: QueryCtx | MutationCtx,
  roleId: Doc<"users">["role"],
): Promise<Doc<"roles"> | null> => {
  return await ctx.db.get(roleId);
};

/**
 * Ensures the authenticated user has a specific privilege.
 * Throws an error if the user lacks the required privilege.
 */
export const requirePrivilege = async (
  ctx: QueryCtx | MutationCtx,
  privilege: string,
): Promise<Result<Doc<"users">>> => {
  const authResult = await requireAuth(ctx);
  if (!authResult.success) return authResult;

  const user = authResult.data;
  const role = await ctx.db.get(user.role);

  if (!role || !role.privileges.includes(privilege)) {
    return {
      success: false,
      error: `Access denied. Required privilege: "${privilege}".`,
    };
  }

  return { success: true, data: user };
};

/**
 * Internal query to check if the current user has a specific privilege.
 * Used by actions that cannot access ctx.db directly.
 */
export const internalCheckPrivilege = internalQuery({
  args: {
    privilege: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const role = await ctx.db.get(user.role);
    if (!role || !role.privileges.includes(args.privilege)) return null;

    return user;
  },
});

/**
 * Returns the current ISO timestamp string.
 */
export const now = (): string => new Date().toISOString();
