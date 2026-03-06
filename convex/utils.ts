import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

/**
 * Retrieves the currently authenticated user from the database
 * by resolving the Clerk identity to the internal users table.
 */
export const getCurrentUser = async (
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users"> | null> => {
  const identity = await ctx.auth.getUserIdentity();

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
): Promise<Doc<"users">> => {
  const user = await getCurrentUser(ctx);

  if (!user) {
    throw new Error("Authentication required. Please sign in.");
  }
  return user;
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
): Promise<Doc<"users">> => {
  const user = await requireAuth(ctx);
  const role = await ctx.db.get(user.role);

  if (!role || !role.privileges.includes(privilege)) {
    throw new Error(`Access denied. Required privilege: "${privilege}".`);
  }

  return user;
};

/**
 * Returns the current ISO timestamp string.
 */
export const now = (): string => new Date().toISOString();
