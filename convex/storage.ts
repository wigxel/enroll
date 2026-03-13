import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { type Result, requireAuth } from "./utils";

/**
 * Generates a short-lived upload URL for Convex file storage.
 * Any authenticated user can request an upload URL.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx): Promise<Result<string>> => {
    const authResult = await requireAuth(ctx);
    if (!authResult.success) return authResult;

    const url = await ctx.storage.generateUploadUrl();
    return { success: true, data: url };
  },
});

/**
 * Returns the public URL for a stored file given its storage ID.
 */
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args): Promise<Result<string | null>> => {
    const url = await ctx.storage.getUrl(args.storageId);
    return { success: true, data: url };
  },
});
