import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { now } from "./utils";

const CODE_PREFIX = "CMK/";

function getNextStudentCode(existingCodes: string[]): string {
  let maxNumber = 0;
  for (const code of existingCodes) {
    if (code.startsWith(CODE_PREFIX)) {
      const numPart = code.slice(CODE_PREFIX.length);
      const num = parseInt(numPart, 10);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  }
  const nextNumber = maxNumber + 1;
  return `${CODE_PREFIX}${String(nextNumber).padStart(3, "0")}`;
}

export const generateStudentCode = internalQuery({
  args: {},
  handler: async (ctx) => {
    const students = await ctx.db.query("students").collect();
    const codes = students.map((s) => s.code);
    return getNextStudentCode(codes);
  },
});

export const getStudentByUserId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("students")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const getStudentByCode = internalQuery({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("students")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
  },
});

export const createStudentRecord = internalMutation({
  args: {
    userId: v.id("users"),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("students")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      return existing;
    }

    const students = await ctx.db.query("students").collect();
    const codes = students.map((s) => s.code);
    const code = getNextStudentCode(codes);

    const timestamp = now();
    const studentId = await ctx.db.insert("students", {
      code,
      userId: args.userId,
      profileImage: args.profileImage,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return await ctx.db.get(studentId);
  },
});
