import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { now, type Result, requireAuth, requirePrivilege } from "./utils";

/**
 * Admin: Lists all enrollments for a specific course.
 */
export const listByCourseId = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "student:read:list");
    if (!privResult.success) return privResult;

    const enrollments = await ctx.db.query("enrollments").collect();

    // Filter by course ID (need to look up via application)
    const enriched = await Promise.all(
      enrollments.map(async (e) => {
        const application = await ctx.db.get(e.applicationId);
        if (!application || application.data.courseId !== args.courseId) {
          return null;
        }

        const cohort = e.cohortId ? await ctx.db.get(e.cohortId) : null;
        const user = await ctx.db.get(e.userId);

        return {
          ...e,
          cohortName: cohort?.name ?? "—",
          studentName: user?.name ?? "—",
          studentEmail: user?.email ?? "—",
        };
      }),
    );

    const filtered = enriched.filter(Boolean);

    return { success: true, data: filtered };
  },
});

/**
 * Retrieves the current user's enrollment checklist.
 */
export const get = query({
  args: {},
  handler: async (ctx): Promise<Result<any>> => {
    const authResult = await requireAuth(ctx);
    if (!authResult.success) return authResult;

    const user = authResult.data;

    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (!enrollment) {
      return { success: false, error: "Enrollment not found." };
    }

    const cohort = enrollment.cohortId
      ? await ctx.db.get(enrollment.cohortId)
      : null;

    return {
      success: true,
      data: {
        ...enrollment,
        cohortName: cohort?.name ?? "—",
      },
    };
  },
});

/**
 * Admin: Retrieves any enrollment by its ID.
 */
export const getById = query({
  args: { enrollmentId: v.id("enrollments") },
  handler: async (ctx, args): Promise<Result<any>> => {
    const privResult = await requirePrivilege(ctx, "enrollment:view:details");
    if (!privResult.success) return privResult;

    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      return { success: false, error: "Enrollment not found." };
    }

    const user = await ctx.db.get(enrollment.userId);
    const application = await ctx.db.get(enrollment.applicationId);

    return {
      success: true,
      data: {
        ...enrollment,
        user,
        application,
      },
    };
  },
});

/**
 * Admin: Lists all enrollments for a specific user.
 */
export const listByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const privResult = await requirePrivilege(ctx, "student:read");
    if (!privResult.success) return privResult;

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Enrich with course and cohort info
    const enriched = await Promise.all(
      enrollments.map(async (e) => {
        const cohort = e.cohortId ? await ctx.db.get(e.cohortId) : null;
        const application = await ctx.db.get(e.applicationId);
        let courseName = "—";

        if (application) {
          const course = await ctx.db.get(application.data.courseId);
          if (course) courseName = course.name;
        }

        return {
          ...e,
          cohortName: cohort?.name ?? "—",
          courseName,
        };
      }),
    );

    return { success: true, data: enriched };
  },
});

/**
 * Student: Lists all completed enrollments for the current user.
 * Used for the certifications page.
 */
export const getOwnCompletedEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const authResult = await requireAuth(ctx);
    if (!authResult.success) return authResult;

    const user = authResult.data;

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Enrich with course info
    const enriched = await Promise.all(
      enrollments.map(async (e) => {
        const application = await ctx.db.get(e.applicationId);
        let courseName = "—";

        if (application) {
          const course = await ctx.db.get(application.data.courseId);
          if (course) courseName = course.name;
        }

        return {
          ...e,
          courseName,
        };
      }),
    );

    return { success: true, data: enriched };
  },
});

/**
 * Admin: Updates the cohort for a specific enrollment.
 */
export const updateCohort = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    cohortId: v.id("cohorts"),
  },
  handler: async (ctx, args): Promise<Result<null>> => {
    const privResult = await requirePrivilege(ctx, "enrollment:update");
    if (!privResult.success) return privResult;

    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      return { success: false, error: "Enrollment not found." };
    }

    const cohort = await ctx.db.get(args.cohortId);
    if (!cohort) {
      return { success: false, error: "Cohort not found." };
    }

    await ctx.db.patch(args.enrollmentId, {
      cohortId: args.cohortId,
      updatedAt: now(),
    });

    // Notify user of cohort change
    await ctx.runMutation(internal.notifications.sendNotification, {
      type: "enrollment_update",
      title: "Cohort Updated",
      body: `Your enrollment cohort has been updated to ${cohort.name}.`,
      relatedEntityId: args.enrollmentId,
      relatedEntityType: "enrollment",
      targetAdmins: false,
      targetUserId: enrollment.userId,
    });

    return { success: true, data: null };
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
  handler: async (ctx, args): Promise<Result<null>> => {
    const authResult = await requireAuth(ctx);
    if (!authResult.success) return authResult;

    const user = authResult.data;
    const enrollment = await ctx.db.get(args.enrollmentId);

    if (!enrollment) {
      return { success: false, error: "Enrollment not found." };
    }

    // Allow the enrollment owner or an admin to update
    if (enrollment.userId !== user._id) {
      // If not the owner, check for admin privilege
      const role = await ctx.db.get(user.role);
      if (!role || !role.privileges.includes("enrollment:update")) {
        return {
          success: false,
          error: "You can only update your own enrollment steps.",
        };
      }
    }

    if (enrollment.status === "completed") {
      return { success: false, error: "This enrollment is already completed." };
    }

    const updatedSteps = {
      ...enrollment.steps,
      [args.step]: args.value,
    };

    await ctx.db.patch(args.enrollmentId, {
      steps: updatedSteps,
      updatedAt: now(),
    });

    return { success: true, data: null };
  },
});

/**
 * Finalizes enrollment if all steps are completed.
 * Upgrades the user's role from "Applicant" to "Student".
 */
export const complete = mutation({
  args: { enrollmentId: v.id("enrollments") },
  handler: async (ctx, args): Promise<Result<null>> => {
    const authResult = await requireAuth(ctx);
    if (!authResult.success) return authResult;

    const user = authResult.data;
    const enrollment = await ctx.db.get(args.enrollmentId);

    if (!enrollment) {
      return { success: false, error: "Enrollment not found." };
    }
    if (enrollment.userId !== user._id) {
      return {
        success: false,
        error: "You can only complete your own enrollment.",
      };
    }
    if (enrollment.status === "completed") {
      return { success: false, error: "Enrollment is already completed." };
    }

    // Verify all steps are done
    const { tuitionPaid, quizPassed, documentsSigned } = enrollment.steps;
    if (!tuitionPaid || !quizPassed || !documentsSigned) {
      return {
        success: false,
        error: "All enrollment steps must be completed before finalizing.",
      };
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

    return { success: true, data: null };
  },
});

/**
 * Grades the orientation quiz and updates the enrollment step if passed.
 * Requires an 80% score to pass (4/5 questions correct).
 */
export const submitQuiz = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    answers: v.record(v.id("quizQuestions"), v.number()), // e.g. { "questionId": selectedIndex }
  },
  handler: async (ctx, args): Promise<Result<any>> => {
    const authResult = await requireAuth(ctx);
    if (!authResult.success) return authResult;

    const user = authResult.data;
    const enrollment = await ctx.db.get(args.enrollmentId);

    if (!enrollment || enrollment.userId !== user._id) {
      return { success: false, error: "Enrollment not found or unauthorized." };
    }

    if (!enrollment.steps.tuitionPaid) {
      return {
        success: false,
        error: "You must complete the 'Pay Tuition' step first.",
      };
    }

    // Fetch all active questions to grade against
    const activeQuestions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    if (activeQuestions.length === 0) {
      return { success: false, error: "No active quiz questions found." };
    }

    // Calculate score
    let correctCount = 0;

    for (const question of activeQuestions) {
      const studentAnswerIndex = args.answers[question._id];
      if (
        studentAnswerIndex !== undefined &&
        studentAnswerIndex === question.correctOptionIndex
      ) {
        correctCount++;
      }
    }

    const totalQuestions = activeQuestions.length;
    const score = (correctCount / totalQuestions) * 100;
    const requiredScore = 80;
    const passed = score >= requiredScore;

    if (passed && !enrollment.steps.quizPassed) {
      // Update enrollment step
      const updatedSteps = {
        ...enrollment.steps,
        quizPassed: true,
      };
      await ctx.db.patch(args.enrollmentId, {
        steps: updatedSteps,
        updatedAt: now(),
      });

      // Send success notification to user
      await ctx.runMutation(internal.notifications.sendNotification, {
        type: "enrollment_step_complete",
        title: "Orientation Quiz Passed",
        body: `Congratulations! You scored ${score}% on the orientation quiz.`,
        relatedEntityId: args.enrollmentId,
        relatedEntityType: "enrollment",
        targetAdmins: false,
        targetUserId: user._id,
      });
    } else if (!passed) {
      // Optionally notify failure (can be noisy, UI feedback usually enough)
      await ctx.runMutation(internal.notifications.sendNotification, {
        type: "enrollment_step_complete", // Reuse type or create a specific 'quiz_failed'
        title: "Orientation Quiz Result",
        body: `You scored ${score}%. A minimum of ${requiredScore}% is required. Please review the materials and try again.`,
        relatedEntityId: args.enrollmentId,
        relatedEntityType: "enrollment",
        targetAdmins: false,
        targetUserId: user._id,
      });
    }

    return {
      success: true,
      data: {
        passed,
        score,
        requiredScore,
      },
    };
  },
});

/**
 * Admin: Manually creates an enrollment for a student.
 * Used when manually registering a student or adding an offline graduate.
 */
export const createForStudent = mutation({
  args: {
    userId: v.id("users"),
    cohortId: v.id("cohorts"),
    courseId: v.id("courses"),
    isPaid: v.boolean(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<Result<{ enrollmentId: string; applicationId: string }>> => {
    const privResult = await requirePrivilege(ctx, "enrollment:update");
    if (!privResult.success) return privResult;

    const timestamp = now();

    // Create placeholder application (minimal data for audit trail)
    const applicationId = await ctx.db.insert("applications", {
      userId: args.userId,
      status: "approved",
      paymentStatus: args.isPaid ? "paid" : "unpaid",
      data: {
        firstName: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        phoneNumber: "",
        educationalBackground: "",
        courseId: args.courseId,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const isComplete = args.isPaid;

    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: args.userId,
      applicationId,
      cohortId: args.cohortId,
      steps: {
        tuitionPaid: args.isPaid,
        quizPassed: args.isPaid,
        documentsSigned: args.isPaid,
      },
      status: isComplete ? "completed" : "pending",
      completedAt: isComplete ? timestamp : undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return {
      success: true,
      data: { enrollmentId, applicationId },
    };
  },
});
