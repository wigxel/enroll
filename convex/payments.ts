import { query, mutation, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAuth, requirePrivilege, now } from "./utils";

/**
 * Creates a payment intent stub.
 * In production, this would call Stripe/Paystack to create a real payment intent.
 */
export const createIntent = action({
  args: {
    referenceId: v.string(),
    referenceType: v.union(v.literal("application"), v.literal("tuition")),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    // --- AUTH BYPASSED FOR DEVELOPMENT ---
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //     throw new Error("Authentication required.");
    // }

    // In production: call Stripe/Paystack API to create a payment intent
    // const paymentIntent = await stripe.paymentIntents.create({ ... });
    const stripePaymentIntentId = `pi_stub_${Date.now()}`;

    // Create the payment record in the database
    await ctx.runMutation(internal.payments.createPaymentRecord, {
      clerkId: "clerk_admin_001", // TODO: use identity.subject
      referenceId: args.referenceId,
      referenceType: args.referenceType,
      amount: args.amount,
      currency: args.currency,
      stripePaymentIntentId,
    });

    return { stripePaymentIntentId };
  },
});

/**
 * Internal mutation to create a payment record.
 */
export const createPaymentRecord = internalMutation({
  args: {
    clerkId: v.string(),
    referenceId: v.string(),
    referenceType: v.union(v.literal("application"), v.literal("tuition")),
    amount: v.number(),
    currency: v.string(),
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found.");
    }

    await ctx.db.insert("payments", {
      userId: user._id,
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
 * Confirms a payment (webhook callback or client confirmation).
 * Updates both the payment status and the related entity.
 */
export const confirm = mutation({
  args: {
    stripePaymentIntentId: v.string(),
    status: v.union(v.literal("succeeded"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const payments = await ctx.db.query("payments").collect();
    const payment = payments.find(
      (p) => p.stripePaymentIntentId === args.stripePaymentIntentId,
    );

    if (!payment) {
      throw new Error("Payment record not found.");
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
        await ctx.db.patch(application._id, {
          paymentStatus: "paid",
          updatedAt: now(),
        });
      }
    }

    // If tuition payment succeeded, update the enrollment step
    if (args.status === "succeeded" && payment.referenceType === "tuition") {
      const enrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_userId", (q) => q.eq("userId", payment.userId))
        .first();

      if (enrollment) {
        await ctx.db.patch(enrollment._id, {
          steps: { ...enrollment.steps, tuitionPaid: true },
          updatedAt: now(),
        });
      }
    }
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
  handler: async (ctx, args) => {
    await requirePrivilege(ctx, "payment:read:all");

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
        const user = await ctx.db.get(payment.userId);
        return {
          ...payment,
          userName: (user as any)?.name ?? "Unknown",
          userEmail: (user as any)?.email ?? "",
        };
      }),
    );

    // Apply search filter
    const filtered = args.search
      ? withUser.filter(
          (p) =>
            p.userName.toLowerCase().includes(args.search!.toLowerCase()) ||
            p.userEmail.toLowerCase().includes(args.search!.toLowerCase()) ||
            p.stripePaymentIntentId.includes(args.search!),
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
      payments: paginated,
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / pageSize),
    };
  },
});

/**
 * Admin: Returns aggregate revenue statistics.
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requirePrivilege(ctx, "payment:read:all");

    const payments = await ctx.db.query("payments").collect();
    const succeeded = payments.filter((p) => p.status === "succeeded");

    const totalCollected = succeeded.reduce((sum, p) => sum + p.amount, 0);
    const applicationFees = succeeded
      .filter((p) => p.referenceType === "application")
      .reduce((sum, p) => sum + p.amount, 0);
    const tuitionCollected = succeeded
      .filter((p) => p.referenceType === "tuition")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalCollected,
      applicationFees,
      tuitionCollected,
    };
  },
});

/**
 * Admin: Processes a refund. In production, this would call the payment provider's refund API.
 */
export const refund = action({
  args: {
    paymentId: v.id("payments"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // --- AUTH BYPASSED FOR DEVELOPMENT ---
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //     throw new Error("Authentication required.");
    // }

    // In production: call Stripe/Paystack refund API
    // const refund = await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });

    await ctx.runMutation(internal.payments.processRefund, {
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
  handler: async (ctx, args) => {
    await requirePrivilege(ctx, "payment:refund");

    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment not found.");
    }
    if (payment.status !== "succeeded") {
      throw new Error("Only succeeded payments can be refunded.");
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
  },
});
