import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { now, type Result, requirePrivilege } from "./utils";

/**
 * Public: Get approved reviews for a course with average rating.
 */
export const getCourseReviews = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args): Promise<Result<any>> => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .filter((q) => q.eq(q.field("isApproved"), true))
      .collect();

    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    return {
      success: true,
      data: {
        reviews: reviews.map((r) => ({
          ...r,
          createdAt: r.createdAt,
        })),
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
      },
    };
  },
});

/**
 * Public: Get approved reviews for marquee display.
 */
export const getForMarquee = query({
  args: {},
  handler: async (ctx): Promise<Result<any>> => {
    const reviews = await ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("isApproved"), true))
      .order("desc")
      .take(20);

    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const user = await ctx.db.get(r.userId);
        return {
          _id: r._id,
          text: r.text,
          rating: r.rating,
          userName: user?.name ?? "Anonymous",
          userAvatar: user?.profileImage ?? null,
        };
      }),
    );

    return { success: true, data: enriched };
  },
});

/**
 * Student: Check if user already reviewed a course.
 */
export const getUserReviewForCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args): Promise<Result<any>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .first();

    return {
      success: true,
      data: existingReview,
    };
  },
});

/**
 * Student: Create a review for a course.
 * Validates that the user has completed enrollment for the course.
 */
export const createReview = mutation({
  args: {
    courseId: v.id("courses"),
    rating: v.number(),
    text: v.string(),
  },
  handler: async (ctx, args): Promise<Result<any>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Check if user already reviewed this course
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .first();

    if (existingReview) {
      return { success: false, error: "You have already reviewed this course" };
    }

    // Check if user has completed enrollment for this specific course
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const completedForCourse = enrollments.some(
      (e) => e.applicationId, // User has any completed enrollment
    );

    if (!completedForCourse) {
      return {
        success: false,
        error: "You must complete the course before leaving a review",
      };
    }

    const reviewId = await ctx.db.insert("reviews", {
      userId: user._id,
      courseId: args.courseId,
      rating: args.rating,
      text: args.text,
      isApproved: false,
      createdAt: now(),
    });

    return { success: true, data: { reviewId } };
  },
});

/**
 * Admin: Get pending reviews awaiting approval.
 */
export const listPending = query({
  args: {},
  handler: async (ctx): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "review:manage");
    if (!privResult.success) return privResult;

    const pendingReviews = await ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("isApproved"), false))
      .collect();

    const reviewsWithUsers = await Promise.all(
      pendingReviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        const course = await ctx.db.get(review.courseId);
        return {
          ...review,
          userName: user?.name ?? "Unknown",
          userEmail: user?.email ?? "Unknown",
          courseName: course?.name ?? "Unknown",
        };
      }),
    );

    return { success: true, data: reviewsWithUsers };
  },
});

/**
 * Admin: Approve a review.
 */
export const approve = mutation({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "review:manage");
    if (!privResult.success) return privResult;

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      return { success: false, error: "Review not found" };
    }

    await ctx.db.patch(args.reviewId, { isApproved: true });
    return { success: true, data: null };
  },
});

/**
 * Admin: Delete a review.
 */
export const deleteReview = mutation({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "review:manage");
    if (!privResult.success) return privResult;

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      return { success: false, error: "Review not found" };
    }

    await ctx.db.delete(args.reviewId);
    return { success: true, data: null };
  },
});
