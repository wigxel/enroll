import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { now, type Result, requirePrivilege } from "./utils";

export type EnrichedReview = Doc<"reviews"> & {
  userName: string;
  userEmail: string;
  courseName: string;
};

export type CourseReviewsResult = {
  reviews: Doc<"reviews">[];
  averageRating: number;
  totalReviews: number;
};

export type MarqueeReview = {
  _id: Id<"reviews">;
  text: string;
  rating: number;
  userName: string;
  userAvatar: string | null;
};

/**
 * Public: Get approved reviews for a course with average rating.
 */
export const getCourseReviews = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args): Promise<Result<CourseReviewsResult>> => {
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
  handler: async (ctx): Promise<Result<MarqueeReview[]>> => {
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
  handler: async (ctx, args): Promise<Result<Doc<"reviews"> | null>> => {
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
  handler: async (ctx, args): Promise<Result<{ reviewId: Id<"reviews"> }>> => {
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
 * Admin: List all reviews with optional filtering by course and approval status.
 */
export const listAll = query({
  args: {
    courseId: v.optional(v.union(v.id("courses"), v.null())),
    isApproved: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<Result<EnrichedReview[]>> => {
    const privResult = await requirePrivilege(ctx, "review:manage");
    if (!privResult.success) return privResult;

    let reviews;
    if (args.courseId === undefined) {
      reviews = await ctx.db.query("reviews").collect();
    } else if (args.courseId === null) {
      reviews = await ctx.db
        .query("reviews")
        .filter((q) => q.eq(q.field("courseId"), undefined))
        .collect();
    } else {
      reviews = await ctx.db
        .query("reviews")
        .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId!))
        .collect();
    }

    if (args.isApproved !== undefined) {
      reviews = reviews.filter((r) => r.isApproved === args.isApproved);
    }

    const reviewsWithUsers: EnrichedReview[] = await Promise.all(
      reviews.map(async (review) => {
        const user = (await ctx.db.get(review.userId)) as Doc<"users"> | null;
        const course = review.courseId
          ? ((await ctx.db.get(review.courseId)) as Doc<"courses"> | null)
          : null;
        return {
          ...review,
          userName: user?.name ?? "Unknown",
          userEmail: user?.email ?? "Unknown",
          courseName: course?.name ?? "—",
        };
      }),
    );

    return { success: true, data: reviewsWithUsers };
  },
});

/**
 * Admin: Get pending reviews awaiting approval.
 */
export const listPending = query({
  args: {},
  handler: async (ctx): Promise<Result<EnrichedReview[]>> => {
    const privResult = await requirePrivilege(ctx, "review:manage");
    if (!privResult.success) return privResult;

    const pendingReviews = await ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("isApproved"), false))
      .collect();

    const reviewsWithUsers: EnrichedReview[] = await Promise.all(
      pendingReviews.map(async (review) => {
        const user = (await ctx.db.get(review.userId)) as Doc<"users"> | null;
        const course = review.courseId
          ? ((await ctx.db.get(review.courseId)) as Doc<"courses"> | null)
          : null;
        return {
          ...review,
          userName: user?.name ?? "Unknown",
          userEmail: user?.email ?? "Unknown",
          courseName: course?.name ?? "—",
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
  handler: async (ctx, args): Promise<Result<null>> => {
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
  handler: async (ctx, args): Promise<Result<null>> => {
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

/**
 * Admin: List students for the review creation dropdown.
 */
export const listStudentsForReview = query({
  args: {},
  handler: async (
    ctx,
  ): Promise<Result<Pick<Doc<"users">, "_id" | "email" | "name">[]>> => {
    const privResult = await requirePrivilege(ctx, "review:create");
    if (!privResult.success) return privResult;

    const studentRole = await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", "Student"))
      .unique();

    if (!studentRole) {
      return { success: true, data: [] };
    }

    const students = await ctx.db
      .query("users")
      .withIndex("by_role", (q) =>
        q.eq("role", "jx70qb7b2dztkpxbtdr6hnded5828ms1" as any),
      )
      .collect();

    return {
      success: true,
      data: students.map((s) => ({
        _id: s._id,
        name: s.name,
        email: s.email,
      })),
    };
  },
});

/**
 * Admin: Create a review on behalf of a student.
 * Auto-approved since an admin created it.
 */
export const createAdminReview = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.optional(v.id("courses")),
    rating: v.number(),
    text: v.string(),
  },
  handler: async (ctx, args): Promise<Result<{ reviewId: Id<"reviews"> }>> => {
    const privResult = await requirePrivilege(ctx, "review:create");
    if (!privResult.success) return privResult;

    const user = await ctx.db.get(args.userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        args.courseId
          ? q.eq(q.field("courseId"), args.courseId)
          : q.eq(q.field("courseId"), undefined),
      )
      .first();

    if (existingReview) {
      return {
        success: false,
        error: "This student has already submitted a review for this selection",
      };
    }

    const reviewId = await ctx.db.insert("reviews", {
      userId: args.userId,
      courseId: args.courseId,
      rating: args.rating,
      text: args.text,
      isApproved: true,
      createdAt: now(),
    });

    return { success: true, data: { reviewId } };
  },
});
