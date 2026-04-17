import { v } from "convex/values";
import { safeStr } from "../lib/data.helpers";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { now, type Result, requirePrivilege } from "./utils";

/**
 * Creates a Paystack transaction and returns the reference for frontend checkout.
 */
export const createIntent = action({
  args: {
    referenceId: v.string(),
    referenceType: v.union(v.literal("application"), v.literal("tuition")),
    amount: v.number(),
    currency: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Result<any>> => {
    const identity = await ctx.auth.getUserIdentity();
    const userEmail = args.email ?? identity?.email ?? "";

    if (!userEmail) {
      return { success: false, error: "User email is required for payment." };
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return {
        success: false,
        error: "Paystack is not configured. Please contact support.",
      };
    }

    const amountInKobo = Math.round(args.amount * 100);

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          amount: amountInKobo,
          currency: args.currency,
          reference: `${args.referenceType}_${args.referenceId}_${Date.now()}`,
          metadata: {
            referenceId: args.referenceId,
            referenceType: args.referenceType,
          },
        }),
      },
    );

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text();
      console.error("Paystack API error:", errorText);
      return {
        success: false,
        error: "Failed to initialize payment. Please try again.",
      };
    }

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      return {
        success: false,
        error: paystackData.message || "Payment initialization failed.",
      };
    }

    const paystackReference = paystackData.data.reference;
    const accessCode = paystackData.data.access_code;

    await ctx.runMutation(internal.payments.createPaymentRecord, {
      clerkId: identity?.subject,
      referenceId: args.referenceId,
      referenceType: args.referenceType,
      amount: args.amount,
      currency: args.currency,
      stripePaymentIntentId: paystackReference,
    });

    return {
      success: true,
      data: {
        paystackReference,
        authorizationUrl: paystackData.data.authorization_url,
        accessCode,
      },
    };
  },
});

/**
 * Internal mutation to create a payment record.
 */
export const createPaymentRecord = internalMutation({
  args: {
    clerkId: v.optional(v.string()),
    referenceId: v.string(),
    referenceType: v.union(v.literal("application"), v.literal("tuition")),
    amount: v.number(),
    currency: v.string(),
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    let userId: Id<"users"> | undefined;

    if (args.clerkId) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId!))
        .unique();

      if (user) {
        userId = user._id;
      }
    }

    await ctx.db.insert("payments", {
      userId,
      referenceId: args.referenceId,
      referenceType: args.referenceType,
      amount: args.amount,
      currency: args.currency,
      stripePaymentIntentId: args.stripePaymentIntentId,
      status: "pending",
      createdAt: now(),
    });
  },
});

/**
 * Internal query to get a payment by ID.
 */
export const getPaymentById = internalQuery({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.paymentId);
  },
});

/**
 * Confirms a payment (webhook callback or client confirmation).
 * Updates both the payment status and the related entity.
 */
export const confirm = mutation({
  args: {
    stripePaymentIntentId: v.string(),
    status: v.union(v.literal("succeeded"), v.literal("failed")),
  },
  handler: async (ctx, args): Promise<Result<null>> => {
    const payments = await ctx.db.query("payments").collect();
    const payment = payments.find(
      (p) => p.stripePaymentIntentId === args.stripePaymentIntentId,
    );

    if (!payment) {
      return { success: false, error: "Payment record not found." };
    }

    await ctx.db.patch(payment._id, {
      status: args.status,
    });

    // If application fee payment succeeded, update the application's payment status
    if (
      args.status === "succeeded" &&
      payment.referenceType === "application"
    ) {
      const application = await ctx.db
        .query("applications")
        .filter((q) => q.eq(q.field("_id"), payment.referenceId as any))
        .first();

      if (application) {
        const timestamp = now();
        await ctx.db.patch(application._id, {
          paymentStatus: "paid",
          status: "submitted",
          submittedAt: timestamp,
          updatedAt: timestamp,
        });

        // Send notification to admin users about the new submission
        await ctx.runMutation(internal.notifications.sendNotification, {
          type: "application_submitted",
          title: "New Application Submitted",
          body: `${application.data.firstName} ${application.data.lastName} has paid the application fee and is awaiting review.`,
          relatedEntityId: application._id,
          relatedEntityType: "application",
          targetAdmins: true,
        });
      }
    }

    // If tuition payment succeeded, update the enrollment step
    if (args.status === "succeeded" && payment.referenceType === "tuition") {
      const enrollment = await ctx.db
        .query("enrollments")
        .filter((q) => q.eq(q.field("_id"), payment.referenceId as any))
        .first();

      if (enrollment) {
        await ctx.db.patch(enrollment._id, {
          steps: { ...enrollment.steps, tuitionPaid: true },
          updatedAt: now(),
        });
      }
    }

    return { success: true, data: null };
  },
});

/**
 * Admin: Lists all payments with optional filtering.
 */
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("succeeded"),
        v.literal("failed"),
        v.literal("refunded"),
      ),
    ),
    referenceType: v.optional(
      v.union(v.literal("application"), v.literal("tuition")),
    ),
    search: v.optional(v.string()),
    page: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "payment:read:all");
    if (!privResult.success) return privResult;

    let payments;

    if (args.status) {
      payments = await ctx.db
        .query("payments")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      payments = await ctx.db.query("payments").collect();
    }

    // Filter by reference type
    if (args.referenceType) {
      payments = payments.filter((p) => p.referenceType === args.referenceType);
    }

    // Attach user info and apply search
    const withUser = await Promise.all(
      payments.map(async (payment) => {
        let userName = "Unknown Applicant (Guest)";
        let userEmail = "";

        if (payment.userId) {
          const user = await ctx.db.get(payment.userId);
          userName = (user as any)?.name ?? "Unknown";
          userEmail = (user as any)?.email ?? "";
        } else if (payment.referenceType === "application") {
          const application = await ctx.db
            .query("applications")
            .filter((q) => q.eq(q.field("_id"), payment.referenceId as any))
            .first();
          if (application) {
            userName = `${application.data.firstName} ${application.data.lastName}`;
            userEmail = application.data.email;
          }
        }

        return {
          ...payment,
          userName,
          userEmail,
        };
      }),
    );

    const search_ = safeStr(args.search);

    // Apply search filter
    const filtered = args.search
      ? withUser.filter(
          (p) =>
            p.userName.toLowerCase().includes(search_.toLowerCase()) ||
            p.userEmail.toLowerCase().includes(search_.toLowerCase()) ||
            p.stripePaymentIntentId.includes(search_),
        )
      : withUser;

    // Sort by date (newest first)
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    // Pagination
    const pageSize = 20;
    const page = args.page ?? 0;
    const start = page * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return {
      success: true,
      data: {
        payments: paginated,
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
    };
  },
});

/**
 * Internal helper to calculate overall financial statistics.
 */
async function calculateOverallStats(ctx: any) {
  const payments = await ctx.db.query("payments").collect();
  const succeeded = payments.filter((p: any) => p.status === "succeeded");

  const totalCollected = succeeded.reduce(
    (sum: number, p: any) => sum + p.amount,
    0,
  );
  const applicationFees = succeeded
    .filter((p: any) => p.referenceType === "application")
    .reduce((sum: number, p: any) => sum + p.amount, 0);
  const tuitionCollected = succeeded
    .filter((p: any) => p.referenceType === "tuition")
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  return {
    totalCollected,
    applicationFees,
    tuitionCollected,
  };
}

/**
 * Admin: Returns aggregate revenue statistics.
 * Prioritizes pre-calculated data from analytics_cache.
 */
export const getStats = query({
  args: {},
  handler: async (ctx): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "payment:read:all");
    if (!privResult.success) return privResult;

    const cacheKey = "revenue_stats_summary";
    const cached = await ctx.db
      .query("analytics_cache")
      .withIndex("by_key", (q) => q.eq("key", cacheKey))
      .unique();

    if (cached) {
      return {
        success: true,
        data: cached.data,
      };
    }

    const data = await calculateOverallStats(ctx);

    return {
      success: true,
      data,
    };
  },
});

/**
 * Internal helper to calculate revenue trends.
 */
async function calculateTrends(ctx: any, days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString();

  const payments = await ctx.db
    .query("payments")
    .withIndex("by_status", (q: any) => q.eq("status", "succeeded"))
    .filter((q: any) => q.gte(q.field("createdAt"), cutoffStr))
    .collect();

  // Group by date (YYYY-MM-DD)
  const grouped: Record<
    string,
    { date: string; Total: number; "App Fees": number; Tuition: number }
  > = {};

  // Initialize map with all dates in range to ensure zero-point visibility
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    grouped[ds] = { date: ds, Total: 0, "App Fees": 0, Tuition: 0 };
  }

  payments.forEach((p: any) => {
    const day = p.createdAt.split("T")[0];
    if (grouped[day]) {
      grouped[day].Total += p.amount;
      if (p.referenceType === "application") {
        grouped[day]["App Fees"] += p.amount;
      } else {
        grouped[day].Tuition += p.amount;
      }
    }
  });

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Admin: Returns revenue data points for charting.
 * Prioritizes pre-calculated data from analytics_cache.
 */
export const getRevenueTrends = query({
  args: {
    days: v.optional(v.number()), // Defaults to 30 days
  },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "payment:read:all");
    if (!privResult.success) return privResult;

    const days = args.days ?? 30;
    const cacheKey = `revenue_trends_${days}d`;

    // Try reading from cache first
    const cached = await ctx.db
      .query("analytics_cache")
      .withIndex("by_key", (q) => q.eq("key", cacheKey))
      .unique();

    if (cached) {
      return {
        success: true,
        data: cached.data,
      };
    }

    // Fallback to calculation if cache is missing (first run or expired)
    const data = await calculateTrends(ctx, days);

    return {
      success: true,
      data,
    };
  },
});

/**
 * Internal: Aggregates revenue trends and updates the cache.
 * Designed to be called by a cron job.
 */
export const refreshRevenueCache = internalMutation({
  args: {},
  handler: async (ctx) => {
    const timeframes = [7, 30, 90];
    const now = new Date().toISOString();

    // 1. Refresh Timeframe Trends
    for (const days of timeframes) {
      const data = await calculateTrends(ctx, days);
      const cacheKey = `revenue_trends_${days}d`;

      const existing = await ctx.db
        .query("analytics_cache")
        .withIndex("by_key", (q) => q.eq("key", cacheKey))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, { data, updatedAt: now });
      } else {
        await ctx.db.insert("analytics_cache", {
          key: cacheKey,
          data,
          updatedAt: now,
        });
      }
    }

    // 2. Refresh Overall Summary Stats
    const summaryData = await calculateOverallStats(ctx);
    const summaryCacheKey = "revenue_stats_summary";

    const existingSummary = await ctx.db
      .query("analytics_cache")
      .withIndex("by_key", (q) => q.eq("key", summaryCacheKey))
      .unique();

    if (existingSummary) {
      await ctx.db.patch(existingSummary._id, {
        data: summaryData,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("analytics_cache", {
        key: summaryCacheKey,
        data: summaryData,
        updatedAt: now,
      });
    }
  },
});

/**
 * Admin: Processes a refund via Paystack's refund API.
 */
export const refund = action({
  args: {
    paymentId: v.id("payments"),
    reason: v.string(),
  },
  handler: async (ctx, args): Promise<Result<null>> => {
    const user = await ctx.runQuery(internal.utils.internalCheckPrivilege, {
      privilege: "payment:refund",
    });
    if (!user) {
      return {
        success: false,
        error: "Access denied. Required privilege: payment:refund",
      };
    }

    const payment = await ctx.runQuery(internal.payments.getPaymentById, {
      paymentId: args.paymentId,
    });
    if (!payment) {
      return { success: false, error: "Payment not found." };
    }

    if (payment.status !== "succeeded") {
      return {
        success: false,
        error: "Only succeeded payments can be refunded.",
      };
    }

    if (!payment.stripePaymentIntentId) {
      return {
        success: false,
        error: "No transaction ID found for this payment.",
      };
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return {
        success: false,
        error: "Paystack is not configured. Contact support.",
      };
    }

    // Call Paystack refund API
    const paystackResponse = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction: payment.stripePaymentIntentId,
      }),
    });

    const responseData = await paystackResponse.json();

    if (!paystackResponse.ok || !responseData.status) {
      console.error("Paystack refund failed:", responseData);
      return {
        success: false,
        error: responseData.message || "Refund failed at payment provider.",
      };
    }

    // Only update local status if Paystack API succeeds
    return await ctx.runMutation(internal.payments.processRefund, {
      paymentId: args.paymentId,
      reason: args.reason,
    });
  },
});

/**
 * Internal mutation to process refund status update.
 */
export const processRefund = internalMutation({
  args: {
    paymentId: v.id("payments"),
    reason: v.string(),
  },
  handler: async (ctx, args): Promise<Result<null>> => {
    const privResult = await requirePrivilege(ctx, "payment:refund");
    if (!privResult.success) return privResult;

    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      return { success: false, error: "Payment not found." };
    }
    if (payment.status !== "succeeded") {
      return {
        success: false,
        error: "Only succeeded payments can be refunded.",
      };
    }

    await ctx.db.patch(args.paymentId, {
      status: "refunded",
    });

    // Notify the user about the refund
    await ctx.runMutation(internal.notifications.sendNotification, {
      type: "payment_refund",
      title: "Payment Refunded",
      body: `Your payment of ${payment.amount} ${payment.currency} has been refunded. Reason: ${args.reason}`,
      relatedEntityId: args.paymentId,
      relatedEntityType: "payment",
      targetUserId: payment.userId,
    });

    return { success: true, data: null };
  },
});
