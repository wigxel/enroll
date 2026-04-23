import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { now, type Result, requireAuth, requirePrivilege } from "./utils";

/**
 * Creates a new application draft.
 * Supports both authenticated users and guests.
 * Only one application per email address is allowed.
 */
export const create = mutation({
  args: {
    data: v.object({
      firstName: v.string(),
      middleName: v.optional(v.string()),
      lastName: v.string(),
      email: v.string(),
      dateOfBirth: v.string(),
      gender: v.string(),
      address: v.string(),
      phoneNumber: v.string(),
      educationalBackground: v.string(),
      courseId: v.id("courses"),
    }),
  },
  handler: async (ctx, args): Promise<Result<any>> => {
    // Attempt to identify the user (optional for guests)
    const identity = await ctx.auth.getUserIdentity();
    let userId;

    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();
      userId = user?._id;
    }

    // Check for existing application by email
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_email", (q) => q.eq("data.email", args.data.email))
      .first();

    if (existing) {
      return {
        success: false,
        error:
          "An application already exists for this email address. Please use a different email or log in to view your application.",
      };
    }

    const timestamp = now();
    const applicationId = await ctx.db.insert("applications", {
      userId: userId,
      status: "draft",
      paymentStatus: "unpaid",
      data: args.data,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return { success: true, data: applicationId };
  },
});

/**
 * Student: Fast-tracks application for returning students.
 * Bypasses the form by using existing user data.
 */
export const createFastTrack = mutation({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args): Promise<Result<any>> => {
    const authResult = await requireAuth(ctx);
    if (!authResult.success) return authResult;

    const user = authResult.data;

    const existing = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("data.courseId"), args.courseId))
      .first();

    if (existing) {
      return {
        success: false,
        error: "You already have an application for this course.",
      };
    }

    const timestamp = now();
    const applicationId = await ctx.db.insert("applications", {
      userId: user._id,
      status: "draft",
      paymentStatus: "unpaid",
      data: {
        firstName: user.name.split(" ")[0],
        lastName: user.name.split(" ").slice(1).join(" ") || "User",
        email: user.email,
        dateOfBirth: "1900-01-01",
        gender: "Other",
        address: "Not provided",
        phoneNumber: "Not provided",
        educationalBackground: "Previous Student",
        courseId: args.courseId,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return { success: true, data: applicationId };
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
      middleName: v.optional(v.string()),
      lastName: v.string(),
      email: v.string(),
      dateOfBirth: v.string(),
      gender: v.string(),
      address: v.string(),
      phoneNumber: v.string(),
      educationalBackground: v.string(),
      courseId: v.id("courses"),
    }),
  },
  handler: async (ctx, args): Promise<Result<null>> => {
    const application = await ctx.db.get(args.applicationId);

    if (!application) {
      return { success: false, error: "Application not found." };
    }

    // If the application is linked to a user, enforce authentication
    if (application.userId) {
      const authResult = await requireAuth(ctx);
      if (!authResult.success) return authResult;

      const user = authResult.data;
      if (application.userId !== user._id) {
        return {
          success: false,
          error: "You can only edit your own application.",
        };
      }
    }

    if (application.status !== "draft") {
      return {
        success: false,
        error: "Only draft applications can be edited.",
      };
    }

    await ctx.db.patch(args.applicationId, {
      data: args.data,
      updatedAt: now(),
    });

    return { success: true, data: null };
  },
});

/**
 * Submits the application. Requires the payment status to be "paid".
 */
export const submit = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args): Promise<Result<null>> => {
    const application = await ctx.db.get(args.applicationId);

    if (!application) {
      return { success: false, error: "Application not found." };
    }

    // If the application is linked to a user, enforce authentication
    if (application.userId) {
      const authResult = await requireAuth(ctx);
      if (!authResult.success) return authResult;

      const user = authResult.data;
      if (application.userId !== user._id) {
        return {
          success: false,
          error: "You can only submit your own application.",
        };
      }
    }

    if (application.status !== "draft") {
      return {
        success: false,
        error: "This application has already been submitted.",
      };
    }
    if (application.paymentStatus !== "paid") {
      return {
        success: false,
        error: "Application fee must be paid before submitting.",
      };
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

    // Send notification to the student user if they exist
    if (application.userId) {
      await ctx.runMutation(internal.notifications.sendNotification, {
        type: "application_status_change",
        title: "Application Submitted",
        body: "Your application has been successfully submitted and is now awaiting review.",
        relatedEntityId: args.applicationId,
        relatedEntityType: "application",
        targetUserId: application.userId,
      });
    }

    return { success: true, data: null };
  },
});

/**
 * Retrieves the current user's application.
 */
export const getMyApplication = query({
  args: {},
  handler: async (ctx): Promise<Result<any>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, error: "Authentication required." };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return { success: false, error: "User record not found." };
    }

    const application =
      (await ctx.db
        .query("applications")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first()) ||
      (await ctx.db
        .query("applications")
        .filter((q) => q.eq(q.field("data.email"), user.email))
        .first());

    if (!application) {
      return { success: false, error: "Application not found." };
    }

    // Resolve course name
    const course = await ctx.db.get(application.data.courseId);

    return {
      success: true,
      data: {
        ...application,
        courseName: course?.name ?? "Unknown Course",
      },
    };
  },
});

/**
 * Student: Lists all applications for the current user.
 * Returns all applications (draft, submitted, under_review, approved, declined).
 */
export const getAll = query({
  args: {},
  handler: async (ctx): Promise<Result<any>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, error: "Authentication required." };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return { success: false, error: "User record not found." };
    }

    // Get all applications by userId
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Also check for applications by email (fallback)
    const emailApplications = await ctx.db
      .query("applications")
      .filter((q) => q.eq(q.field("data.email"), user.email))
      .collect();

    // Combine and deduplicate by ID
    const allAppsMap = new Map<string, Doc<"applications">>();
    for (const app of [...applications, ...emailApplications]) {
      allAppsMap.set(app._id.toString(), app);
    }
    const allApplications = Array.from(allAppsMap.values());

    // Enrich with course names and slug
    const enriched = await Promise.all(
      allApplications.map(async (app) => {
        const course = app.data?.courseId
          ? await ctx.db.get(app.data.courseId)
          : null;
        return {
          _id: app._id,
          status: app.status,
          paymentStatus: app.paymentStatus,
          courseId: app.data?.courseId ?? null,
          courseName: course?.name ?? "Unknown Course",
          courseSlug: course?.slug ?? null,
          submittedAt: app.submittedAt ?? null,
          reviewedAt: app.reviewedAt ?? null,
          rejectionReason: app.rejectionReason ?? null,
        };
      }),
    );

    return { success: true, data: enriched };
  },
});

/**
 * Public: Retrieves a specific application by ID for the payment page or guest tracking.
 * Only returns basic safe information.
 */
export const getByIdPublic = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args): Promise<Result<Doc<"applications">>> => {
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      return { success: false, error: "Application not found." };
    }

    return { success: true, data: application };
  },
});

/**
 * Admin: Retrieves a specific application by ID with user info.
 */
export const getById = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "application:view:details");
    if (!privResult.success) return privResult;

    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      return { success: false, error: "Application not found." };
    }

    const applicant = application.userId
      ? await ctx.db.get(application.userId)
      : null;

    // Get payment info for this application
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_referenceId", (q) =>
        q.eq("referenceId", args.applicationId),
      )
      .first();

    // Resolve course name
    const course = await ctx.db.get(application.data.courseId);

    return {
      success: true,
      data: {
        ...application,
        applicant,
        payment,
        courseName: course?.name ?? "Unknown Course",
      },
    };
  },
});

/**
 * Admin: Lists applications with "submitted" or "under_review" status.
 */
export const listPending = query({
  args: {
    statusFilter: v.optional(
      v.union(v.literal("submitted"), v.literal("under_review")),
    ),
    page: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "application:read:all");
    if (!privResult.success) return privResult;

    let applications: Doc<"applications">[];

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
      (b.submittedAt ?? b.createdAt).localeCompare(
        a.submittedAt ?? a.createdAt,
      ),
    );

    // Pagination
    const pageSize = 20;
    const page = args.page ?? 0;
    const start = page * pageSize;
    const paginated = applications.slice(start, start + pageSize);

    // Attach applicant info
    const withApplicants = await Promise.all(
      paginated.map(async (app) => {
        const applicant = app.userId ? await ctx.db.get(app.userId) : null;
        return {
          ...app,
          applicantName: applicant
            ? applicant.name
            : `${app.data.firstName} ${app.data.lastName}`,
          applicantEmail: applicant ? applicant.email : app.data.email,
        };
      }),
    );

    return {
      success: true,
      data: {
        applications: withApplicants,
        total: applications.length,
        page,
        totalPages: Math.ceil(applications.length / pageSize),
      },
    };
  },
});

/**
 * Admin: Lists all applications with optional status filter and search.
 */
export const listAll = query({
  args: {
    statusFilter: v.optional(
      v.union(
        v.literal("all"),
        v.literal("draft"),
        v.literal("submitted"),
        v.literal("under_review"),
        v.literal("approved"),
        v.literal("declined"),
      ),
    ),
    search: v.optional(v.string()),
    page: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "application:read:all");
    if (!privResult.success) return privResult;

    const statusFilter = args.statusFilter ?? "all";

    let applications: Doc<"applications">[];

    if (statusFilter !== "all") {
      applications = await ctx.db
        .query("applications")
        .withIndex("by_status", (q) => q.eq("status", statusFilter))
        .collect();
    } else {
      applications = await ctx.db.query("applications").collect();
    }

    // Sort by newest first (submittedAt or createdAt)
    applications.sort((a, b) =>
      (b.submittedAt ?? b.createdAt).localeCompare(
        a.submittedAt ?? a.createdAt,
      ),
    );

    // Attach applicant info + course name for every row
    const enriched = await Promise.all(
      applications.map(async (app) => {
        const applicant = app.userId ? await ctx.db.get(app.userId) : null;
        const course = await ctx.db.get(app.data.courseId);
        return {
          ...app,
          applicantName: applicant
            ? applicant.name
            : `${app.data.firstName} ${app.data.lastName}`,
          applicantEmail: applicant ? applicant.email : app.data.email,
          courseName: course?.name ?? "Unknown Course",
        };
      }),
    );

    // Search filter (server-side, case-insensitive)
    const searchTerm = (args.search ?? "").toLowerCase();
    const filtered = searchTerm
      ? enriched.filter(
          (app) =>
            app.applicantName.toLowerCase().includes(searchTerm) ||
            app.applicantEmail.toLowerCase().includes(searchTerm),
        )
      : enriched;

    // Compute counts across ALL applications (before pagination)
    const allEnriched = searchTerm ? filtered : enriched;
    const counts = {
      all: allEnriched.length,
      draft: allEnriched.filter((a) => a.status === "draft").length,
      submitted: allEnriched.filter((a) => a.status === "submitted").length,
      under_review: allEnriched.filter((a) => a.status === "under_review")
        .length,
      approved: allEnriched.filter((a) => a.status === "approved").length,
      declined: allEnriched.filter((a) => a.status === "declined").length,
    };

    // Pagination
    const pageSize = 20;
    const page = args.page ?? 0;
    const start = page * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return {
      success: true,
      data: {
        applications: paginated,
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / pageSize),
        counts,
      },
    };
  },
});

/**
 * Admin: Approves an application.
 * Creates an enrollment record and sends a notification.
 */
export const approve = mutation({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args): Promise<Result<null>> => {
    const privResult = await requirePrivilege(ctx, "application:update:status");
    if (!privResult.success) return privResult;

    const admin = privResult.data;
    const application = await ctx.db.get(args.applicationId);

    if (!application) {
      return { success: false, error: "Application not found." };
    }
    if (
      application.status !== "submitted" &&
      application.status !== "under_review"
    ) {
      return {
        success: false,
        error: "Only submitted or under-review applications can be approved.",
      };
    }

    const timestamp = now();

    // Update application status
    await ctx.db.patch(args.applicationId, {
      status: "approved",
      reviewedAt: timestamp,
      reviewedBy: admin._id,
      updatedAt: timestamp,
    });

    if (application.userId) {
      // User already has an account (e.g., they applied while authenticated)
      // Create enrollment record right away
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

      // Create student record with auto-generated code
      await ctx.runMutation(internal.students.createStudentRecord, {
        userId: application.userId,
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
    } else {
      // Guest application: Send an invite to create a student account
      await ctx.scheduler.runAfter(0, internal.invitations.sendStudentInvite, {
        email: application.data.email,
        firstName: application.data.firstName,
        lastName: application.data.lastName,
        applicationId: args.applicationId,
      });
      // The enrollment record will be created when they accept the invite and `user.created` webhook fires.
    }

    return { success: true, data: null };
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
  handler: async (ctx, args): Promise<Result<null>> => {
    const privResult = await requirePrivilege(ctx, "application:update:status");
    if (!privResult.success) return privResult;

    const admin = privResult.data;
    const application = await ctx.db.get(args.applicationId);

    if (!application) {
      return { success: false, error: "Application not found." };
    }
    if (
      application.status !== "submitted" &&
      application.status !== "under_review"
    ) {
      return {
        success: false,
        error: "Only submitted or under-review applications can be declined.",
      };
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

    // Automatically refund application fee if paid
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_referenceId", (q) =>
        q.eq("referenceId", args.applicationId),
      )
      .filter((q) => q.eq(q.field("status"), "succeeded"))
      .first();

    if (payment) {
      await ctx.scheduler.runAfter(0, api.payments.refund, {
        paymentId: payment._id,
        reason: `Automatic refund: Application declined. Reason: ${args.rejectionReason}`,
      });
    }

    return { success: true, data: null };
  },
});

/**
 * Admin: Returns aggregate statistics for the dashboard.
 */
export const getDashboardStats = query({
  args: {
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "report:view:dashboard");
    if (!privResult.success) return privResult;

    let allApplications = await ctx.db.query("applications").collect();

    // If a date range is provided, filter the applications accordingly
    if (args.from) {
      allApplications = allApplications.filter((a) => {
        const date = a.submittedAt || a.createdAt; // Use creation date if submittedAt is missing
        return date >= args.from!;
      });
    }

    if (args.to) {
      const toDateObj = new Date(args.to);
      // Include the entire end date up to 23:59:59.999
      toDateObj.setUTCHours(23, 59, 59, 999);
      const toStr = toDateObj.toISOString();

      allApplications = allApplications.filter((a) => {
        const date = a.submittedAt || a.createdAt;
        return date <= toStr;
      });
    }

    const total = allApplications.length;
    const pendingReview = allApplications.filter(
      (a) => a.status === "submitted" || a.status === "under_review",
    ).length;

    // For approved and declined, we count items in the filtered result set
    // that reached those states (even if the review happened later, they were submitted in this range).
    // Alternatively, we could filter by reviewedAt. Since 'allApplications' is now filtered by creation/submission,
    // this gives us "Of the applications submitted in this range, how many are approved/declined?"
    const approved = allApplications.filter(
      (a) => a.status === "approved",
    ).length;
    const declined = allApplications.filter(
      (a) => a.status === "declined",
    ).length;

    return {
      success: true,
      data: {
        total,
        pendingReview,
        approved,
        declined,
      },
    };
  },
});

/**
 * Checks if there is already an application with the given email address or phone number.
 * Returns the application id and payment status if found, otherwise null.
 */
export const checkExisting = query({
  args: {
    email: v.string(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    // Check globally across all applications by email.
    const byEmail = await ctx.db
      .query("applications")
      .withIndex("by_email", (q) => q.eq("data.email", args.email))
      .first();

    if (byEmail) {
      return {
        id: byEmail._id,
        status: byEmail.status,
        paymentStatus: byEmail.paymentStatus,
      };
    }

    // Check by phone number
    const byPhone = await ctx.db
      .query("applications")
      .withIndex("by_phoneNumber", (q) =>
        q.eq("data.phoneNumber", args.phoneNumber),
      )
      .first();

    if (byPhone) {
      return {
        id: byPhone._id,
        status: byPhone.status,
        paymentStatus: byPhone.paymentStatus,
      };
    }

    return null;
  },
});

/**
 * Public: Retrieves safe application info for the payment page without requiring auth.
 */
export const getApplicationForPayment = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args): Promise<Result<any>> => {
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      return { success: false, error: "Application not found." };
    }

    return {
      success: true,
      data: {
        _id: application._id,
        status: application.status,
        paymentStatus: application.paymentStatus,
        applicantName: `${application.data.firstName} ${application.data.lastName}`,
        applicantEmail: application.data.email,
      },
    };
  },
});
