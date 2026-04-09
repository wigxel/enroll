import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { now } from "./utils";

// ---------------------------------------------------------------------------
// Clerk webhook event handlers (internal — only callable from http.ts)
// ---------------------------------------------------------------------------

/**
 * user.created: Upsert the new Clerk user into the Convex users table.
 * Respects `public_metadata.pendingRole` set during admin invites.
 */
export const onUserCreated = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    const clerkId = data.id as string;
    const email =
      (data.email_addresses as { email_address: string }[])?.[0]
        ?.email_address ?? "";
    const publicMetadata =
      (data.public_metadata as Record<string, unknown> | null) ?? {};

    const firstName =
      (data.first_name as string | null) ??
      (publicMetadata.invitedFirstName as string | undefined) ??
      "";
    const lastName =
      (data.last_name as string | null) ??
      (publicMetadata.invitedLastName as string | undefined) ??
      "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || email;
    const profileImage = (data.image_url as string | null) ?? undefined;
    const pendingRoleName = publicMetadata.pendingRole as string | undefined;

    // Skip if already exists (e.g. seeded or created via createOrGetUser)
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (existing) return;

    // Resolve role: pending invite role → Applicant
    let roleRecord = pendingRoleName
      ? await ctx.db
          .query("roles")
          .withIndex("by_name", (q) => q.eq("name", pendingRoleName))
          .unique()
      : null;

    if (!roleRecord) {
      roleRecord = await ctx.db
        .query("roles")
        .withIndex("by_name", (q) => q.eq("name", "Applicant"))
        .unique();
    }

    if (!roleRecord) {
      throw new Error("'Applicant' role not found. Please seed the database.");
    }

    const timestamp = now();
    const newUserId = await ctx.db.insert("users", {
      clerkId,
      email,
      name,
      role: roleRecord._id,
      profileImage,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const applicationId = publicMetadata.applicationId as string | undefined;

    if (applicationId) {
      const appId =
        applicationId as import("./_generated/dataModel").Id<"applications">;
      const app = await ctx.db.get(appId);

      if (app) {
        // Link the user to the application
        await ctx.db.patch(appId, { userId: newUserId });

        // If the application is already approved (it should be since we invite on approval)
        // Ensure there is a pending enrollment record for this student
        if (app.status === "approved" || app.status === ("enrolled" as any)) {
          // Send notification to the newly created user
          await ctx.runMutation(internal.notifications.sendNotification, {
            type: "application_status_change",
            title: "Application Approved!",
            body: "Congratulations! Your application has been approved. Please complete the enrollment steps to finalize your registration.",
            relatedEntityId: app._id,
            relatedEntityType: "application",
            targetUserId: newUserId,
          });

          const existingEnrollment = await ctx.db
            .query("enrollments")
            .withIndex("by_applicationId", (q) => q.eq("applicationId", appId))
            .first();

          if (!existingEnrollment) {
            await ctx.db.insert("enrollments", {
              userId: newUserId,
              applicationId: appId,
              steps: {
                tuitionPaid: false,
                quizPassed: false,
                documentsSigned: false,
              },
              status: "pending",
              createdAt: timestamp,
              updatedAt: timestamp,
            });
          } else if (existingEnrollment.userId !== newUserId) {
            // Unlikely to happen, but safety check to update userId if there was a placeholder
            await ctx.db.patch(existingEnrollment._id, { userId: newUserId });
          }

          // Create student record with auto-generated code
          await ctx.runMutation(internal.students.createStudentRecord, {
            userId: newUserId,
          });
        }
      }
    }
  },
});

/**
 * user.updated: Sync name, email, and profile image changes from Clerk.
 */
export const onUserUpdated = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    const clerkId = data.id as string;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) return; // User not yet in our DB — ignore

    const email =
      (data.email_addresses as { email_address: string }[])?.[0]
        ?.email_address ?? user.email;
    const firstName = (data.first_name as string | null) ?? "";
    const lastName = (data.last_name as string | null) ?? "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || user.name;
    const profileImage = (data.image_url as string | null) ?? user.profileImage;

    await ctx.db.patch(user._id, {
      email,
      name,
      profileImage,
      updatedAt: now(),
    });
  },
});

/**
 * user.deleted: Remove the user record from Convex.
 */
export const onUserDeleted = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    const clerkId = data.id as string;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

/**
 * Paystack charge.success wrapper:
 * Processes successful payments. Equivalent logic to `api.payments.confirm`.
 */
export const onPaystackChargeSuccess = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    // Paystack payload references usually live in data.reference
    const reference = data.reference as string;
    if (!reference) {
      console.warn("Paystack charge.success missing reference.");
      return;
    }

    const payments = await ctx.db.query("payments").collect();
    const payment = payments.find((p) => p.stripePaymentIntentId === reference);

    if (!payment) {
      console.warn(
        `Payment record not found for Paystack reference: ${reference}`,
      );
      return;
    }

    if (payment.status === "succeeded") {
      // Already processed, ignore
      return;
    }

    await ctx.db.patch(payment._id, {
      status: "succeeded",
    });

    // If application fee payment succeeded, update the application's payment status
    if (payment.referenceType === "application") {
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

        // Send notification to the student user if they exist
        if (application.userId) {
          await ctx.runMutation(internal.notifications.sendNotification, {
            type: "payment_received",
            title: "Application Fee Received",
            body: "Your application fee has been received. Your application is now submitted and awaiting review.",
            relatedEntityId: application._id,
            relatedEntityType: "application",
            targetUserId: application.userId,
          });
        }
      }
    }

    // If tuition payment succeeded, update the enrollment step
    if (payment.referenceType === "tuition") {
      if (!payment.userId) {
        throw new Error("Tuition payment must be associated with a user.");
      }
      const enrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_userId", (q) => q.eq("userId", payment.userId!))
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
