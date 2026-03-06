import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { now } from "./utils";

// ---------------------------------------------------------------------------
// Clerk webhook event handlers (internal — only callable from http.ts)
// ---------------------------------------------------------------------------

/**
 * user.created: Upsert the new Clerk user into the Convex users table.
 * Respects `public_metadata.pendingRole` set during admin invites.
 */
export const onUserCreated = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    const clerkId = data.id as string;
    const email =
      (data.email_addresses as { email_address: string }[])?.[0]
        ?.email_address ?? "";
    const publicMetadata =
      (data.public_metadata as Record<string, unknown> | null) ?? {};

    const firstName =
      (data.first_name as string | null) ??
      (publicMetadata.invitedFirstName as string | undefined) ??
      "";
    const lastName =
      (data.last_name as string | null) ??
      (publicMetadata.invitedLastName as string | undefined) ??
      "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || email;
    const profileImage = (data.image_url as string | null) ?? undefined;
    const pendingRoleName = publicMetadata.pendingRole as string | undefined;

    // Skip if already exists (e.g. seeded or created via createOrGetUser)
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (existing) return;

    // Resolve role: pending invite role → Applicant
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
      throw new Error("'Applicant' role not found. Please seed the database.");
    }

    const timestamp = now();
    await ctx.db.insert("users", {
      clerkId,
      email,
      name,
      role: roleRecord._id,
      profileImage,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

/**
 * user.updated: Sync name, email, and profile image changes from Clerk.
 */
export const onUserUpdated = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    const clerkId = data.id as string;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) return; // User not yet in our DB — ignore

    const email =
      (data.email_addresses as { email_address: string }[])?.[0]
        ?.email_address ?? user.email;
    const firstName = (data.first_name as string | null) ?? "";
    const lastName = (data.last_name as string | null) ?? "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || user.name;
    const profileImage = (data.image_url as string | null) ?? user.profileImage;

    await ctx.db.patch(user._id, {
      email,
      name,
      profileImage,
      updatedAt: now(),
    });
  },
});

/**
 * user.deleted: Remove the user record from Convex.
 */
export const onUserDeleted = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    const clerkId = data.id as string;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});
