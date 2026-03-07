import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAuth, requirePrivilege, now } from "./utils";

/**
 * Retrieves the current user's enrollment checklist.
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (!enrollment) return null;

    const cohort = enrollment.cohortId ? await ctx.db.get(enrollment.cohortId) : null;

    return {
      ...enrollment,
      cohortName: cohort?.name ?? "—",
    };
  },
});

/**
 * Admin: Retrieves any enrollment by its ID.
 */
export const getById = query({
  args: { enrollmentId: v.id("enrollments") },
  handler: async (ctx, args) => {
    await requirePrivilege(ctx, "enrollment:view:details");

    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) return null;

    const user = await ctx.db.get(enrollment.userId);
    const application = await ctx.db.get(enrollment.applicationId);

    return {
      ...enrollment,
      user,
      application,
    };
  },
});

/**
 * Updates the status of a specific enrollment step.
 * Only the enrollment owner or an admin can perform this.
 */
export const updateStep = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    step: v.union(
      v.literal("tuitionPaid"),
      v.literal("quizPassed"),
      v.literal("documentsSigned"),
    ),
    value: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const enrollment = await ctx.db.get(args.enrollmentId);

    if (!enrollment) {
      throw new Error("Enrollment not found.");
    }

    // Allow the enrollment owner or an admin to update
    if (enrollment.userId !== user._id) {
      // If not the owner, check for admin privilege
      const role = await ctx.db.get(user.role);
      if (!role || !role.privileges.includes("enrollment:update")) {
        throw new Error("You can only update your own enrollment steps.");
      }
    }

    if (enrollment.status === "completed") {
      throw new Error("This enrollment is already completed.");
    }

    const updatedSteps = {
      ...enrollment.steps,
      [args.step]: args.value,
    };

    await ctx.db.patch(args.enrollmentId, {
      steps: updatedSteps,
      updatedAt: now(),
    });
  },
});

/**
 * Finalizes enrollment if all steps are completed.
 * Upgrades the user's role from "Applicant" to "Student".
 */
export const complete = mutation({
  args: { enrollmentId: v.id("enrollments") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const enrollment = await ctx.db.get(args.enrollmentId);

    if (!enrollment) {
      throw new Error("Enrollment not found.");
    }
    if (enrollment.userId !== user._id) {
      throw new Error("You can only complete your own enrollment.");
    }
    if (enrollment.status === "completed") {
      throw new Error("Enrollment is already completed.");
    }

    // Verify all steps are done
    const { tuitionPaid, quizPassed, documentsSigned } = enrollment.steps;
    if (!tuitionPaid || !quizPassed || !documentsSigned) {
      throw new Error(
        "All enrollment steps must be completed before finalizing.",
      );
    }

    const timestamp = now();

    // Mark enrollment as completed
    await ctx.db.patch(args.enrollmentId, {
      status: "completed",
      completedAt: timestamp,
      updatedAt: timestamp,
    });

    // Upgrade user's role to "Student"
    const studentRole = await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", "Student"))
      .unique();

    if (studentRole) {
      await ctx.db.patch(user._id, {
        role: studentRole._id,
        updatedAt: timestamp,
      });
    }

    // Send admin notification about enrollment completion
    await ctx.runMutation(internal.notifications.sendNotification, {
      type: "enrollment_completed",
      title: "Enrollment Completed",
      body: `${user.name} has completed all enrollment steps and is now a Student.`,
      relatedEntityId: user._id,
      relatedEntityType: "user",
      targetAdmins: true,
    });
  },
});
