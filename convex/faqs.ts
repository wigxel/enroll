import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { now, type Result, requirePrivilege } from "./utils";

export const list = query({
  args: {},
  handler: async (ctx): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "course:read:all");
    if (!privResult.success) return privResult;

    const faqs = await ctx.db.query("faqs").withIndex("by_order").collect();

    return { success: true, data: faqs };
  },
});

export const create = mutation({
  args: {
    question: v.string(),
    answer: v.string(),
  },
  handler: async (ctx, args): Promise<Result<string>> => {
    const privResult = await requirePrivilege(ctx, "course:manage");
    if (!privResult.success) return privResult;

    const existingFaqs = await ctx.db
      .query("faqs")
      .withIndex("by_order")
      .collect();

    const maxOrder = existingFaqs.reduce(
      (max, faq) => Math.max(max, faq.order),
      -1,
    );

    const timestamp = now();
    const faqId = await ctx.db.insert("faqs", {
      question: args.question,
      answer: args.answer,
      order: maxOrder + 1,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return { success: true, data: faqId };
  },
});

export const update = mutation({
  args: {
    faqId: v.id("faqs"),
    question: v.string(),
    answer: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args): Promise<Result<null>> => {
    const privResult = await requirePrivilege(ctx, "course:manage");
    if (!privResult.success) return privResult;

    const faq = await ctx.db.get(args.faqId);
    if (!faq) {
      return { success: false, error: "FAQ not found." };
    }

    await ctx.db.patch(args.faqId, {
      question: args.question,
      answer: args.answer,
      isActive: args.isActive,
      updatedAt: now(),
    });

    return { success: true, data: null };
  },
});

export const deleteFaq = mutation({
  args: {
    faqId: v.id("faqs"),
  },
  handler: async (ctx, args): Promise<Result<null>> => {
    const privResult = await requirePrivilege(ctx, "course:manage");
    if (!privResult.success) return privResult;

    const faq = await ctx.db.get(args.faqId);
    if (!faq) {
      return { success: false, error: "FAQ not found." };
    }

    await ctx.db.delete(args.faqId);

    return { success: true, data: null };
  },
});

export const reorder = mutation({
  args: {
    orderedIds: v.array(v.id("faqs")),
  },
  handler: async (ctx, args): Promise<Result<null>> => {
    const privResult = await requirePrivilege(ctx, "course:manage");
    if (!privResult.success) return privResult;

    const timestamp = now();

    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], {
        order: i,
        updatedAt: timestamp,
      });
    }

    return { success: true, data: null };
  },
});
