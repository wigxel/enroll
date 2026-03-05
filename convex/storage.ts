import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generates a short-lived upload URL for Convex file storage.
 * Any authenticated user can request an upload URL.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Returns the public URL for a stored file given its storage ID.
 */
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
