import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

const now = () => new Date().toISOString();

// ── Lookup helpers ──────────────────────────────────────────

const resolveUserByEmail = async (
  ctx: MutationCtx,
  email: string,
): Promise<Id<"users">> => {
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();
  if (!user)
    throw new Error(`Seed error: user with email "${email}" not found.`);
  return user._id;
};

const resolveRoleByName = async (
  ctx: MutationCtx,
  name: string,
): Promise<Id<"roles">> => {
  const role = await ctx.db
    .query("roles")
    .withIndex("by_name", (q) => q.eq("name", name))
    .unique();
  if (!role) throw new Error(`Seed error: role "${name}" not found.`);
  return role._id;
};

const resolveCourseByName = async (
  ctx: MutationCtx,
  name: string,
): Promise<Id<"courses">> => {
  const courses = await ctx.db.query("courses").collect();
  const course = courses.find((c) => c.name === name);
  if (!course) throw new Error(`Seed error: course "${name}" not found.`);
  return course._id;
};

const resolveApplicationByUser = async (
  ctx: MutationCtx,
  email: string,
): Promise<Id<"applications">> => {
  const userId = await resolveUserByEmail(ctx, email);
  const app = await ctx.db
    .query("applications")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
  if (!app)
    throw new Error(`Seed error: application for "${email}" not found.`);
  return app._id;
};

const resolveCohortByName = async (
  ctx: MutationCtx,
  name: string,
): Promise<Id<"cohorts">> => {
  const cohorts = await ctx.db.query("cohorts").collect();
  const cohort = cohorts.find((c) => c.name === name);
  if (!cohort) throw new Error(`Seed error: cohort "${name}" not found.`);
  return cohort._id;
};

/**
 * Seeds the database with initial data for all tables.
 *
 * Internal mutation — call via dashboard or `npx convex run seed:run`.
 * @param dryRun — defaults to `true`. When true, validates structure but inserts nothing.
 */
export const run = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? true;

    // Guard against double-seeding
    const existingRoles = await ctx.db.query("roles").collect();
    if (existingRoles.length > 0) {
      throw new Error(
        "Database already seeded. Delete existing data first if you want to re-seed.",
      );
    }

    const timestamp = now();
    const counts: Record<string, number> = {};

    // ─── 1. Roles ────────────────────────────────────────────
    const rolesData = [
      {
        name: "Admin",
        description:
          "Full system access. Manages applications, users, and configuration.",
        privileges: [
          "user:read",
          "user:update",
          "user:assign:role",
          "student:read",
          "student:read:list",
          "application:read:all",
          "application:update:status",
          "application:delete",
          "application:view:details",
          "enrollment:read:all",
          "enrollment:update",
          "enrollment:view:details",
          "cohort:manage",
          "cohort:read:all",
          "content:manage",
          "course:manage",
          "course:read:all",
          "payment:read:all",
          "payment:refund",
          "notification:read:admin",
          "report:view:dashboard",
          "report:generate",
          "settings:update",
        ],
      },
      {
        name: "Staff",
        description:
          "Day-to-day operations: review applications, manage enrollments.",
        privileges: [
          "student:read:list",
          "application:read:all",
          "application:update:status",
          "application:view:details",
          "enrollment:read:all",
          "enrollment:update",
          "enrollment:view:details",
          "cohort:manage",
          "cohort:read:all",
          "notification:read:admin",
        ],
      },
      {
        name: "Auditor",
        description:
          "Read-only access to system records for compliance and reporting.",
        privileges: [
          "application:read:all",
          "application:view:details",
          "enrollment:read:all",
          "enrollment:view:details",
          "cohort:read:all",
          "payment:read:all",
          "notification:read:admin",
          "report:view:dashboard",
          "report:generate",
        ],
      },
      {
        name: "Applicant",
        description: "Prospective student in the application process.",
        privileges: [
          "application:create",
          "application:read:own",
          "application:update:own",
          "application:submit",
          "payment:create",
          "profile:read:own",
          "profile:update:own",
          "notification:read:own",
        ],
      },
      {
        name: "Student",
        description: "Fully enrolled student with access to student resources.",
        privileges: [
          "enrollment:read:own",
          "enrollment:step:complete",
          "resource:access:student_portal",
          "resource:read:materials",
          "profile:read:own",
          "profile:update:own",
          "notification:read:own",
        ],
      },
    ];
    if (!dryRun) {
      for (const role of rolesData) {
        await ctx.db.insert("roles", role);
      }
    }
    counts.roles = rolesData.length;

    // ─── 2. Courses ──────────────────────────────────────────
    const coursesData = [
      {
        name: "Full-Stack Web Development",
        description:
          "A comprehensive 12-week bootcamp covering React, Node.js, databases, and deployment.",
        duration: "12 Weeks",
        certification: "Full-Stack Developer Certificate",
        tuitionFee: 450000,
        order: 1,
        slug: "full-stack-web-development",
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        name: "Data Science & Machine Learning",
        description:
          "Master Python, statistical analysis, machine learning algorithms, and data visualization.",
        duration: "16 Weeks",
        certification: "Data Science Professional Certificate",
        tuitionFee: 550000,
        order: 2,
        slug: "data-science-machine-learning",
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        name: "UI/UX Design",
        description:
          "Learn user research, wireframing, prototyping, and visual design with Figma.",
        duration: "8 Weeks",
        certification: "UI/UX Designer Certificate",
        tuitionFee: 350000,
        order: 3,
        slug: "ui-ux-design",
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        name: "Mobile App Development",
        description: "Build cross-platform mobile apps with React Native.",
        duration: "10 Weeks",
        certification: "Mobile Developer Certificate",
        tuitionFee: 400000,
        order: 4,
        slug: "mobile-app-development",
        isActive: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ];

    if (!dryRun) {
      for (const course of coursesData) {
        await ctx.db.insert("courses", course);
      }
    }
    counts.courses = coursesData.length;

    // ─── 3. Users ────────────────────────────────────────────
    const usersData = [
      {
        clerkId: "clerk_admin_001",
        email: "admin@enrollsystem.com",
        name: "Sarah Johnson",
        _roleName: "Admin",
        profileImage: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah",
        createdAt: "2025-01-15T09:00:00.000Z",
      },
      {
        clerkId: "clerk_staff_001",
        email: "david.chen@enrollsystem.com",
        name: "David Chen",
        _roleName: "Staff",
        profileImage: "https://api.dicebear.com/9.x/avataaars/svg?seed=David",
        createdAt: "2025-02-01T09:00:00.000Z",
      },
      {
        clerkId: "clerk_auditor_001",
        email: "maria.santos@enrollsystem.com",
        name: "Maria Santos",
        _roleName: "Auditor",
        profileImage: "https://api.dicebear.com/9.x/avataaars/svg?seed=Maria",
        createdAt: "2025-03-10T09:00:00.000Z",
      },
      {
        clerkId: "clerk_applicant_001",
        email: "john.doe@gmail.com",
        name: "John Doe",
        _roleName: "Applicant",
        profileImage: "https://api.dicebear.com/9.x/avataaars/svg?seed=John",
        createdAt: "2026-01-20T14:30:00.000Z",
      },
      {
        clerkId: "clerk_applicant_002",
        email: "jane.smith@outlook.com",
        name: "Jane Smith",
        _roleName: "Applicant",
        profileImage: "https://api.dicebear.com/9.x/avataaars/svg?seed=Jane",
        createdAt: "2026-02-05T10:15:00.000Z",
      },
      {
        clerkId: "clerk_applicant_003",
        email: "kwame.asante@yahoo.com",
        name: "Kwame Asante",
        _roleName: "Applicant",
        profileImage: "https://api.dicebear.com/9.x/avataaars/svg?seed=Kwame",
        createdAt: "2026-02-10T08:00:00.000Z",
      },
      {
        clerkId: "clerk_student_001",
        email: "amara.obi@gmail.com",
        name: "Amara Obi",
        _roleName: "Student",
        profileImage: "https://api.dicebear.com/9.x/avataaars/svg?seed=Amara",
        createdAt: "2025-09-01T10:00:00.000Z",
      },
      {
        clerkId: "clerk_student_002",
        email: "chioma.nwosu@gmail.com",
        name: "Chioma Nwosu",
        _roleName: "Student",
        profileImage: "https://api.dicebear.com/9.x/avataaars/svg?seed=Chioma",
        createdAt: "2025-10-15T11:30:00.000Z",
      },
    ];
    if (!dryRun) {
      for (const { _roleName, ...userData } of usersData) {
        const roleId = await resolveRoleByName(ctx, _roleName);
        await ctx.db.insert("users", {
          ...userData,
          role: roleId,
          updatedAt: timestamp,
        });
      }
    }
    counts.users = usersData.length;

    // ─── 4. Applications ─────────────────────────────────────
    const applicationsData = [
      {
        _userEmail: "john.doe@gmail.com",
        status: "submitted" as const,
        paymentStatus: "paid" as const,
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@gmail.com",
          dateOfBirth: "1998-06-15",
          gender: "Male",
          address: "42 Victoria Island, Lagos, Nigeria",
          phoneNumber: "+234 801 234 5678",
          educationalBackground:
            "BSc Computer Science, University of Lagos (2020)",
          _courseName: "Full-Stack Web Development",
        },
        submittedAt: "2026-02-01T16:00:00.000Z",
        createdAt: "2026-01-25T14:30:00.000Z",
        updatedAt: "2026-02-01T16:00:00.000Z",
      },
      {
        _userEmail: "jane.smith@outlook.com",
        status: "draft" as const,
        paymentStatus: "unpaid" as const,
        data: {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@outlook.com",
          dateOfBirth: "2000-03-22",
          gender: "Female",
          address: "15 Wuse II, Abuja, Nigeria",
          phoneNumber: "+234 902 345 6789",
          educationalBackground:
            "HND Business Administration, Yaba College of Technology (2022)",
          _courseName: "Data Science & Machine Learning",
        },
        createdAt: "2026-02-10T10:15:00.000Z",
        updatedAt: "2026-02-10T10:15:00.000Z",
      },
      {
        _userEmail: "kwame.asante@yahoo.com",
        status: "under_review" as const,
        paymentStatus: "paid" as const,
        data: {
          firstName: "Kwame",
          lastName: "Asante",
          email: "kwame.asante@yahoo.com",
          dateOfBirth: "1997-11-08",
          gender: "Male",
          address: "25 East Legon, Accra, Ghana",
          phoneNumber: "+233 20 123 4567",
          educationalBackground: "BSc Electrical Engineering, KNUST (2019)",
          _courseName: "Full-Stack Web Development",
        },
        submittedAt: "2026-02-15T12:00:00.000Z",
        createdAt: "2026-02-12T08:00:00.000Z",
        updatedAt: "2026-02-18T09:00:00.000Z",
      },
      {
        _userEmail: "amara.obi@gmail.com",
        status: "approved" as const,
        paymentStatus: "paid" as const,
        data: {
          firstName: "Amara",
          lastName: "Obi",
          email: "amara.obi@gmail.com",
          dateOfBirth: "1999-04-12",
          gender: "Female",
          address: "7 Lekki Phase 1, Lagos, Nigeria",
          phoneNumber: "+234 803 456 7890",
          educationalBackground: "BSc Mathematics, University of Ibadan (2021)",
          _courseName: "Full-Stack Web Development",
        },
        submittedAt: "2025-08-20T10:00:00.000Z",
        reviewedAt: "2025-08-25T14:00:00.000Z",
        _reviewedByEmail: "admin@enrollsystem.com",
        createdAt: "2025-08-15T10:00:00.000Z",
        updatedAt: "2025-08-25T14:00:00.000Z",
      },
      {
        _userEmail: "chioma.nwosu@gmail.com",
        status: "approved" as const,
        paymentStatus: "paid" as const,
        data: {
          firstName: "Chioma",
          lastName: "Nwosu",
          email: "chioma.nwosu@gmail.com",
          dateOfBirth: "2001-07-30",
          gender: "Female",
          address: "33 Independence Layout, Enugu, Nigeria",
          phoneNumber: "+234 805 678 9012",
          educationalBackground: "BSc Biochemistry, UNN (2023)",
          _courseName: "UI/UX Design",
        },
        submittedAt: "2025-10-01T09:00:00.000Z",
        reviewedAt: "2025-10-05T11:00:00.000Z",
        _reviewedByEmail: "admin@enrollsystem.com",
        createdAt: "2025-09-28T09:00:00.000Z",
        updatedAt: "2025-10-05T11:00:00.000Z",
      },
    ];
    if (!dryRun) {
      for (const {
        _userEmail,
        _reviewedByEmail,
        data: { _courseName, ...restData },
        ...appData
      } of applicationsData) {
        const userId = await resolveUserByEmail(ctx, _userEmail);
        const courseId = await resolveCourseByName(ctx, _courseName);
        const reviewedBy = _reviewedByEmail
          ? await resolveUserByEmail(ctx, _reviewedByEmail)
          : undefined;
        await ctx.db.insert("applications", {
          ...appData,
          userId,
          data: { ...restData, courseId },
          ...(reviewedBy && { reviewedBy }),
        });
      }
    }
    counts.applications = applicationsData.length;

    // ─── 5. Cohorts ──────────────────────────────────────────
    const cohortsData = [
      {
        name: "Fall 2025 — Web Development",
        startDate: "2025-09-15T00:00:00.000Z",
        endDate: "2025-12-15T00:00:00.000Z",
        capacity: 30,
      },
      {
        name: "Spring 2026 — Full Stack Bootcamp",
        startDate: "2026-03-01T00:00:00.000Z",
        endDate: "2026-06-01T00:00:00.000Z",
        capacity: 25,
      },
      {
        name: "Summer 2026 — Design Intensive",
        startDate: "2026-07-01T00:00:00.000Z",
        endDate: "2026-09-01T00:00:00.000Z",
        capacity: 20,
      },
    ];
    if (!dryRun) {
      for (const cohort of cohortsData) {
        await ctx.db.insert("cohorts", cohort);
      }
    }
    counts.cohorts = cohortsData.length;

    // ─── 6. Payments ─────────────────────────────────────────
    const paymentsData = [
      {
        _userEmail: "john.doe@gmail.com",
        _applicationUserEmail: "john.doe@gmail.com",
        referenceType: "application" as const,
        amount: 5000,
        currency: "NGN",
        stripePaymentIntentId: "pi_app_john_001",
        status: "succeeded" as const,
        createdAt: "2026-02-01T15:55:00.000Z",
      },
      {
        _userEmail: "kwame.asante@yahoo.com",
        _applicationUserEmail: "kwame.asante@yahoo.com",
        referenceType: "application" as const,
        amount: 5000,
        currency: "NGN",
        stripePaymentIntentId: "pi_app_kwame_001",
        status: "succeeded" as const,
        createdAt: "2026-02-15T11:50:00.000Z",
      },
      {
        _userEmail: "amara.obi@gmail.com",
        _applicationUserEmail: "amara.obi@gmail.com",
        referenceType: "application" as const,
        amount: 5000,
        currency: "NGN",
        stripePaymentIntentId: "pi_app_amara_001",
        status: "succeeded" as const,
        createdAt: "2025-08-20T09:50:00.000Z",
      },
      {
        _userEmail: "amara.obi@gmail.com",
        referenceType: "tuition" as const,
        amount: 450000,
        currency: "NGN",
        stripePaymentIntentId: "pi_tui_amara_001",
        status: "succeeded" as const,
        createdAt: "2025-08-28T14:00:00.000Z",
      },
      {
        _userEmail: "chioma.nwosu@gmail.com",
        _applicationUserEmail: "chioma.nwosu@gmail.com",
        referenceType: "application" as const,
        amount: 5000,
        currency: "NGN",
        stripePaymentIntentId: "pi_app_chioma_001",
        status: "succeeded" as const,
        createdAt: "2025-10-01T08:50:00.000Z",
      },
      {
        _userEmail: "chioma.nwosu@gmail.com",
        referenceType: "tuition" as const,
        amount: 350000,
        currency: "NGN",
        stripePaymentIntentId: "pi_tui_chioma_001",
        status: "succeeded" as const,
        createdAt: "2025-10-08T10:00:00.000Z",
      },
      {
        _userEmail: "jane.smith@outlook.com",
        _applicationUserEmail: "jane.smith@outlook.com",
        referenceType: "application" as const,
        amount: 5000,
        currency: "NGN",
        stripePaymentIntentId: "pi_app_jane_fail_001",
        status: "failed" as const,
        createdAt: "2026-02-10T10:30:00.000Z",
      },
    ];
    if (!dryRun) {
      for (const {
        _userEmail,
        _applicationUserEmail,
        ...paymentData
      } of paymentsData) {
        const userId = await resolveUserByEmail(ctx, _userEmail);
        let referenceId = "";
        if (_applicationUserEmail) {
          referenceId = await resolveApplicationByUser(
            ctx,
            _applicationUserEmail,
          );
        }
        await ctx.db.insert("payments", {
          ...paymentData,
          userId,
          referenceId,
        });
      }
    }
    counts.payments = paymentsData.length;

    // ─── 7. Enrollments ──────────────────────────────────────
    const enrollmentsData = [
      {
        _userEmail: "amara.obi@gmail.com",
        _cohortName: "Fall 2025 — Web Development",
        steps: { tuitionPaid: true, quizPassed: true, documentsSigned: true },
        status: "completed" as const,
        completedAt: "2025-09-05T16:00:00.000Z",
        createdAt: "2025-08-25T14:00:00.000Z",
        updatedAt: "2025-09-05T16:00:00.000Z",
      },
      {
        _userEmail: "chioma.nwosu@gmail.com",
        _cohortName: "Fall 2025 — Web Development",
        steps: { tuitionPaid: true, quizPassed: true, documentsSigned: true },
        status: "completed" as const,
        completedAt: "2025-10-12T10:00:00.000Z",
        createdAt: "2025-10-05T11:00:00.000Z",
        updatedAt: "2025-10-12T10:00:00.000Z",
      },
    ];
    if (!dryRun) {
      for (const {
        _userEmail,
        _cohortName,
        ...enrollData
      } of enrollmentsData) {
        const userId = await resolveUserByEmail(ctx, _userEmail);
        const applicationId = await resolveApplicationByUser(ctx, _userEmail);
        const cohortId = await resolveCohortByName(ctx, _cohortName);
        await ctx.db.insert("enrollments", {
          ...enrollData,
          userId,
          applicationId,
          cohortId,
        });
      }
    }
    counts.enrollments = enrollmentsData.length;

    // ─── 8. Notifications ────────────────────────────────────
    const notificationsData = [
      {
        _userEmail: "admin@enrollsystem.com",
        type: "application_submitted",
        title: "New Application Submitted",
        body: "John Doe has paid the application fee and is awaiting review.",
        _relatedEntityUserEmail: "john.doe@gmail.com",
        relatedEntityType: "application",
        isRead: false,
        isArchived: false,
        createdAt: "2026-02-01T16:00:00.000Z",
      },
      {
        _userEmail: "admin@enrollsystem.com",
        type: "application_submitted",
        title: "New Application Submitted",
        body: "Kwame Asante has paid the application fee and is awaiting review.",
        _relatedEntityUserEmail: "kwame.asante@yahoo.com",
        relatedEntityType: "application",
        isRead: true,
        isArchived: false,
        createdAt: "2026-02-15T12:00:00.000Z",
      },
      {
        _userEmail: "admin@enrollsystem.com",
        type: "enrollment_completed",
        title: "Enrollment Completed",
        body: "Amara Obi has completed all enrollment steps and is now a Student.",
        _relatedEntityUserEmail: "amara.obi@gmail.com",
        relatedEntityType: "user",
        isRead: true,
        isArchived: false,
        createdAt: "2025-09-05T16:00:00.000Z",
      },
      {
        _userEmail: "david.chen@enrollsystem.com",
        type: "payment_failed",
        title: "Payment Failed",
        body: "Jane Smith's payment attempt for Application fee failed.",
        _relatedEntityUserEmail: "jane.smith@outlook.com",
        relatedEntityType: "application",
        isRead: false,
        isArchived: false,
        createdAt: "2026-02-10T10:30:00.000Z",
      },
      {
        _userEmail: "amara.obi@gmail.com",
        type: "application_status_change",
        title: "Application Approved!",
        body: "Congratulations! Your application has been approved. Please complete the enrollment steps.",
        _relatedEntityUserEmail: "amara.obi@gmail.com",
        relatedEntityType: "application",
        isRead: true,
        isArchived: false,
        createdAt: "2025-08-25T14:00:00.000Z",
      },
      {
        _userEmail: "chioma.nwosu@gmail.com",
        type: "application_status_change",
        title: "Application Approved!",
        body: "Congratulations! Your application has been approved. Please complete the enrollment steps.",
        _relatedEntityUserEmail: "chioma.nwosu@gmail.com",
        relatedEntityType: "application",
        isRead: true,
        isArchived: false,
        createdAt: "2025-10-05T11:00:00.000Z",
      },
    ];
    if (!dryRun) {
      for (const {
        _userEmail,
        _relatedEntityUserEmail,
        relatedEntityType,
        ...notifData
      } of notificationsData) {
        const userId = await resolveUserByEmail(ctx, _userEmail);
        let relatedEntityId: string | undefined;
        if (_relatedEntityUserEmail && relatedEntityType === "application") {
          relatedEntityId = await resolveApplicationByUser(
            ctx,
            _relatedEntityUserEmail,
          );
        } else if (_relatedEntityUserEmail && relatedEntityType === "user") {
          relatedEntityId = await resolveUserByEmail(
            ctx,
            _relatedEntityUserEmail,
          );
        }
        await ctx.db.insert("notifications", {
          ...notifData,
          userId,
          relatedEntityId,
          relatedEntityType,
        });
      }
    }
    counts.notifications = notificationsData.length;

    // ─── 9. Settings ─────────────────────────────────────────
    const settingsData = {
      isAcceptingApplications: true,
      openDate: "2026-01-15T00:00:00.000Z",
      closeDate: "2026-06-30T23:59:59.000Z",
      applicationFeeAmount: 5000,
      tuitionFeeAmount: 450000,
      updatedAt: timestamp,
    };
    if (!dryRun) {
      await ctx.db.insert("settings", settingsData);
    }
    counts.settings = 1;

    return {
      dryRun,
      message: dryRun
        ? "Dry run complete. No data was inserted. Call with { dryRun: false } to insert."
        : "Database seeded successfully.",
      counts,
    };
  },
});
