import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { now, type Result, requirePrivilege } from "./utils";

/**
 * Public: Lists all active partners sorted by order.
 */
export const listActive = query({
  args: {},
  handler: async (ctx): Promise<Result<any>> => {
    const partners = await ctx.db
      .query("partners")
      .withIndex("by_isActive")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const sorted = partners.sort((a, b) => a.order - b.order);

    const partnersWithLogos = await Promise.all(
      sorted.map(async (partner) => {
        let logoUrl: string | null = null;
        if (partner.logo) {
          logoUrl = await ctx.storage.getUrl(partner.logo);
        }
        return {
          ...partner,
          logoUrl: logoUrl || partner.logo,
        };
      }),
    );

    return { success: true, data: partnersWithLogos };
  },
});

/**
 * Admin: Lists all partners (active and inactive) sorted by order.
 */
export const list = query({
  args: {},
  handler: async (ctx): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "settings:manage");
    if (!privResult.success) return privResult;

    const partners = await ctx.db
      .query("partners")
      .withIndex("by_order")
      .collect();

    const partnersWithLogos = await Promise.all(
      partners.map(async (partner) => {
        let logoUrl: string | null = null;
        if (partner.logo) {
          logoUrl = await ctx.storage.getUrl(partner.logo);
        }
        return {
          ...partner,
          logoUrl: logoUrl || partner.logo,
        };
      }),
    );

    return { success: true, data: partnersWithLogos };
  },
});

/**
 * Admin: Gets a single partner by ID.
 */
export const getById = query({
  args: { partnerId: v.id("partners") },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "settings:manage");
    if (!privResult.success) return privResult;

    const partner = await ctx.db.get(args.partnerId);
    if (!partner) {
      return { success: false, error: "Partner not found." };
    }

    return { success: true, data: partner };
  },
});

/**
 * Admin: Creates a new partner.
 */
export const create = mutation({
  args: {
    name: v.string(),
    logo: v.string(),
    isActive: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args): Promise<Result<Id<"partners">>> => {
    const privResult = await requirePrivilege(ctx, "settings:manage");
    if (!privResult.success) return privResult;

    const id = await ctx.db.insert("partners", {
      name: args.name,
      logo: args.logo,
      isActive: args.isActive,
      order: args.order,
      createdAt: now(),
      updatedAt: now(),
    });

    return { success: true, data: id };
  },
});

/**
 * Admin: Updates a partner.
 */
export const update = mutation({
  args: {
    partnerId: v.id("partners"),
    name: v.optional(v.string()),
    logo: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Result<null>> => {
    const privResult = await requirePrivilege(ctx, "settings:manage");
    if (!privResult.success) return privResult;

    const partner = await ctx.db.get(args.partnerId);
    if (!partner) {
      return { success: false, error: "Partner not found." };
    }

    await ctx.db.patch(args.partnerId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.logo !== undefined && { logo: args.logo }),
      ...(args.isActive !== undefined && { isActive: args.isActive }),
      ...(args.order !== undefined && { order: args.order }),
      updatedAt: now(),
    });

    return { success: true, data: null };
  },
});

/**
 * Admin: Deletes a partner.
 */
export const remove = mutation({
  args: { partnerId: v.id("partners") },
  handler: async (ctx, args): Promise<Result<null>> => {
    const privResult = await requirePrivilege(ctx, "settings:manage");
    if (!privResult.success) return privResult;

    const partner = await ctx.db.get(args.partnerId);
    if (!partner) {
      return { success: false, error: "Partner not found." };
    }

    await ctx.db.delete(args.partnerId);
    return { success: true, data: null };
  },
});

/**
 * Admin: Reorders multiple partners (bulk update).
 */
export const reorder = mutation({
  args: {
    orderedIds: v.array(v.id("partners")),
  },
  handler: async (ctx, args): Promise<Result<null>> => {
    const privResult = await requirePrivilege(ctx, "settings:manage");
    if (!privResult.success) return privResult;

    for (let i = 0; i < args.orderedIds.length; i++) {
      const partnerId = args.orderedIds[i];
      await ctx.db.patch(partnerId, {
        order: i,
        updatedAt: now(),
      });
    }

    return { success: true, data: null };
  },
});

/**
 * Admin: Generates a Convex storage upload URL for partner logos.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx): Promise<Result<string>> => {
    const privResult = await requirePrivilege(ctx, "settings:manage");
    if (!privResult.success) return privResult as any;

    const url = await ctx.storage.generateUploadUrl();
    return { success: true, data: url };
  },
});
