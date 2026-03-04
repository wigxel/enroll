import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAuth, requirePrivilege, now } from "./utils";

/**
 * Creates a new application draft for the current user.
 * Only one application per user is allowed.
 */
export const create = mutation({
    args: {
        data: v.object({
            firstName: v.string(),
            lastName: v.string(),
            dateOfBirth: v.string(),
            address: v.string(),
            phoneNumber: v.string(),
            educationalBackground: v.string(),
            courseId: v.id("courses"),
        }),
    },
    handler: async (ctx, args) => {
        const user = await requireAuth(ctx);

        // Check for existing application
        const existing = await ctx.db
            .query("applications")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();

        if (existing) {
            throw new Error("You already have an application. Only one application per user is allowed.");
        }

        const timestamp = now();
        const applicationId = await ctx.db.insert("applications", {
            userId: user._id,
            status: "draft",
            paymentStatus: "unpaid",
            data: args.data,
            createdAt: timestamp,
            updatedAt: timestamp,
        });

        return applicationId;
    },
});

/**
 * Updates application data. Only allowed if status is "draft".
 */
export const update = mutation({
    args: {
        applicationId: v.id("applications"),
        data: v.object({
            firstName: v.string(),
            lastName: v.string(),
            dateOfBirth: v.string(),
            address: v.string(),
            phoneNumber: v.string(),
            educationalBackground: v.string(),
            courseId: v.id("courses"),
        }),
    },
    handler: async (ctx, args) => {
        const user = await requireAuth(ctx);
        const application = await ctx.db.get(args.applicationId);

        if (!application) {
            throw new Error("Application not found.");
        }
        if (application.userId !== user._id) {
            throw new Error("You can only edit your own application.");
        }
        if (application.status !== "draft") {
            throw new Error("Only draft applications can be edited.");
        }

        await ctx.db.patch(args.applicationId, {
            data: args.data,
            updatedAt: now(),
        });
    },
});

/**
 * Submits the application. Requires the payment status to be "paid".
 */
export const submit = mutation({
    args: {
        applicationId: v.id("applications"),
    },
    handler: async (ctx, args) => {
        const user = await requireAuth(ctx);
        const application = await ctx.db.get(args.applicationId);

        if (!application) {
            throw new Error("Application not found.");
        }
        if (application.userId !== user._id) {
            throw new Error("You can only submit your own application.");
        }
        if (application.status !== "draft") {
            throw new Error("This application has already been submitted.");
        }
        if (application.paymentStatus !== "paid") {
            throw new Error("Application fee must be paid before submitting.");
        }

        const timestamp = now();
        await ctx.db.patch(args.applicationId, {
            status: "submitted",
            submittedAt: timestamp,
            updatedAt: timestamp,
        });

        // Send notification to admin users about the new submission
        await ctx.runMutation(internal.notifications.sendNotification, {
            type: "application_submitted",
            title: "New Application Submitted",
            body: `${application.data.firstName} ${application.data.lastName} has paid the application fee and is awaiting review.`,
            relatedEntityId: args.applicationId,
            relatedEntityType: "application",
            targetAdmins: true,
        });
    },
});

/**
 * Retrieves the current user's application.
 */
export const getMyApplication = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireAuth(ctx);

        const application = await ctx.db
            .query("applications")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();

        return application;
    },
});

/**
 * Admin: Retrieves a specific application by ID with user info.
 */
export const getById = query({
    args: { applicationId: v.id("applications") },
    handler: async (ctx, args) => {
        await requirePrivilege(ctx, "application:view:details");

        const application = await ctx.db.get(args.applicationId);
        if (!application) return null;

        const applicant = await ctx.db.get(application.userId);

        // Get payment info for this application
        const payment = await ctx.db
            .query("payments")
            .withIndex("by_referenceId", (q) => q.eq("referenceId", args.applicationId))
            .first();

        return {
            ...application,
            applicant,
            payment,
        };
    },
});

/**
 * Admin: Lists applications with "submitted" or "under_review" status.
 */
export const listPending = query({
    args: {
        statusFilter: v.optional(
            v.union(
                v.literal("submitted"),
                v.literal("under_review"),
            ),
        ),
        page: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requirePrivilege(ctx, "application:read:all");

        let applications;

        if (args.statusFilter) {
            applications = await ctx.db
                .query("applications")
                .withIndex("by_status", (q) => q.eq("status", args.statusFilter!))
                .collect();
        } else {
            // Get both submitted and under_review
            const submitted = await ctx.db
                .query("applications")
                .withIndex("by_status", (q) => q.eq("status", "submitted"))
                .collect();
            const underReview = await ctx.db
                .query("applications")
                .withIndex("by_status", (q) => q.eq("status", "under_review"))
                .collect();
            applications = [...submitted, ...underReview];
        }

        // Sort by submission date (newest first)
        applications.sort((a, b) =>
            (b.submittedAt ?? b.createdAt).localeCompare(a.submittedAt ?? a.createdAt),
        );

        // Pagination
        const pageSize = 20;
        const page = args.page ?? 0;
        const start = page * pageSize;
        const paginated = applications.slice(start, start + pageSize);

        // Attach applicant info
        const withApplicants = await Promise.all(
            paginated.map(async (app) => {
                const applicant = await ctx.db.get(app.userId);
                return { ...app, applicantName: applicant?.name ?? "Unknown", applicantEmail: applicant?.email ?? "" };
            }),
        );

        return {
            applications: withApplicants,
            total: applications.length,
            page,
            totalPages: Math.ceil(applications.length / pageSize),
        };
    },
});

/**
 * Admin: Approves an application.
 * Creates an enrollment record and sends a notification.
 */
export const approve = mutation({
    args: { applicationId: v.id("applications") },
    handler: async (ctx, args) => {
        const admin = await requirePrivilege(ctx, "application:update:status");
        const application = await ctx.db.get(args.applicationId);

        if (!application) {
            throw new Error("Application not found.");
        }
        if (application.status !== "submitted" && application.status !== "under_review") {
            throw new Error("Only submitted or under-review applications can be approved.");
        }

        const timestamp = now();

        // Update application status
        await ctx.db.patch(args.applicationId, {
            status: "approved",
            reviewedAt: timestamp,
            reviewedBy: admin._id,
            updatedAt: timestamp,
        });

        // Create enrollment record
        await ctx.db.insert("enrollments", {
            userId: application.userId,
            applicationId: args.applicationId,
            steps: {
                tuitionPaid: false,
                quizPassed: false,
                documentsSigned: false,
            },
            status: "pending",
            createdAt: timestamp,
            updatedAt: timestamp,
        });

        // Send notification to the applicant
        await ctx.runMutation(internal.notifications.sendNotification, {
            type: "application_status_change",
            title: "Application Approved!",
            body: "Congratulations! Your application has been approved. Please complete the enrollment steps to finalize your registration.",
            relatedEntityId: args.applicationId,
            relatedEntityType: "application",
            targetUserId: application.userId,
        });
    },
});

/**
 * Admin: Declines an application with a reason.
 */
export const decline = mutation({
    args: {
        applicationId: v.id("applications"),
        rejectionReason: v.string(),
    },
    handler: async (ctx, args) => {
        const admin = await requirePrivilege(ctx, "application:update:status");
        const application = await ctx.db.get(args.applicationId);

        if (!application) {
            throw new Error("Application not found.");
        }
        if (application.status !== "submitted" && application.status !== "under_review") {
            throw new Error("Only submitted or under-review applications can be declined.");
        }

        const timestamp = now();

        await ctx.db.patch(args.applicationId, {
            status: "declined",
            rejectionReason: args.rejectionReason,
            reviewedAt: timestamp,
            reviewedBy: admin._id,
            updatedAt: timestamp,
        });

        // Send notification to the applicant
        await ctx.runMutation(internal.notifications.sendNotification, {
            type: "application_status_change",
            title: "Application Update",
            body: `Unfortunately, your application has been declined. Reason: ${args.rejectionReason}`,
            relatedEntityId: args.applicationId,
            relatedEntityType: "application",
            targetUserId: application.userId,
        });
    },
});

/**
 * Admin: Returns aggregate statistics for the dashboard.
 */
export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        await requirePrivilege(ctx, "report:view:dashboard");

        const allApplications = await ctx.db.query("applications").collect();

        const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

        const total = allApplications.length;
        const pendingReview = allApplications.filter(
            (a) => a.status === "submitted" || a.status === "under_review",
        ).length;
        const approvedThisMonth = allApplications.filter(
            (a) =>
                a.status === "approved" &&
                a.reviewedAt &&
                a.reviewedAt.startsWith(currentMonth),
        ).length;
        const declinedThisMonth = allApplications.filter(
            (a) =>
                a.status === "declined" &&
                a.reviewedAt &&
                a.reviewedAt.startsWith(currentMonth),
        ).length;

        return {
            total,
            pendingReview,
            approvedThisMonth,
            declinedThisMonth,
        };
    },
});
