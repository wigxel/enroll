import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internalMutation } from "./_generated/server";

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

// ── Seed Logic Functions ────────────────────────────────────

const seedRoles = async (ctx: MutationCtx, args: { dryRun?: boolean }) => {
  const dryRun = args.dryRun ?? false;
  const existing = await ctx.db.query("roles").collect();
  if (existing.length > 0) return { status: "skipped", count: existing.length };

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
  return { status: "success", count: rolesData.length };
};

const seedCourses = async (ctx: MutationCtx, args: { dryRun?: boolean }) => {
  const dryRun = args.dryRun ?? false;
  const existing = await ctx.db.query("courses").collect();
  if (existing.length > 0) return { status: "skipped", count: existing.length };

  const timestamp = now();
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
  return { status: "success", count: coursesData.length };
};

const seedUsers = async (ctx: MutationCtx, args: { dryRun?: boolean }) => {
  const dryRun = args.dryRun ?? false;
  const existing = await ctx.db.query("users").collect();
  if (existing.length > 0) return { status: "skipped", count: existing.length };

  const timestamp = now();
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
  return { status: "success", count: usersData.length };
};

const seedApplications = async (
  ctx: MutationCtx,
  args: { dryRun?: boolean },
) => {
  const dryRun = args.dryRun ?? false;
  const existing = await ctx.db.query("applications").collect();
  if (existing.length > 0) return { status: "skipped", count: existing.length };

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
  return { status: "success", count: applicationsData.length };
};

const seedCohorts = async (ctx: MutationCtx, args: { dryRun?: boolean }) => {
  const dryRun = args.dryRun ?? false;
  const existing = await ctx.db.query("cohorts").collect();
  if (existing.length > 0) return { status: "skipped", count: existing.length };

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
  return { status: "success", count: cohortsData.length };
};

const seedPayments = async (ctx: MutationCtx, args: { dryRun?: boolean }) => {
  const dryRun = args.dryRun ?? false;
  const existing = await ctx.db.query("payments").collect();
  if (existing.length > 0) return { status: "skipped", count: existing.length };

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
      await ctx.db.insert("payments", { ...paymentData, userId, referenceId });
    }
  }
  return { status: "success", count: paymentsData.length };
};

const seedEnrollments = async (
  ctx: MutationCtx,
  args: { dryRun?: boolean },
) => {
  const dryRun = args.dryRun ?? false;
  const existing = await ctx.db.query("enrollments").collect();
  if (existing.length > 0) return { status: "skipped", count: existing.length };

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
    for (const { _userEmail, _cohortName, ...enrollData } of enrollmentsData) {
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
  return { status: "success", count: enrollmentsData.length };
};

const seedNotifications = async (
  ctx: MutationCtx,
  args: { dryRun?: boolean },
) => {
  const dryRun = args.dryRun ?? false;
  const existing = await ctx.db.query("notifications").collect();
  if (existing.length > 0) return { status: "skipped", count: existing.length };

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
  return { status: "success", count: notificationsData.length };
};

const seedSettings = async (ctx: MutationCtx, args: { dryRun?: boolean }) => {
  const dryRun = args.dryRun ?? false;
  const existing = await ctx.db.query("settings").collect();
  if (existing.length > 0) return { status: "skipped", count: existing.length };

  const settingsData = {
    isAcceptingApplications: true,
    openDate: "2026-01-15T00:00:00.000Z",
    closeDate: "2026-06-30T23:59:59.000Z",
    applicationFeeAmount: 5000,
    tuitionFeeAmount: 450000,
    updatedAt: now(),
  };

  if (!dryRun) {
    await ctx.db.insert("settings", settingsData);
  }
  return { status: "success", count: 1 };
};

// ── Internal Mutations (for CLI access) ─────────────────────

export const roles = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: seedRoles,
});
export const courses = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: seedCourses,
});
export const users = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: seedUsers,
});
export const applications = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: seedApplications,
});
export const cohorts = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: seedCohorts,
});
export const payments = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: seedPayments,
});
export const enrollments = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: seedEnrollments,
});
export const notifications = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: seedNotifications,
});
export const settings = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: seedSettings,
});

// ── Master Run ──────────────────────────────────────────────

/**
 * Seeds the database with initial data for all tables.
 * Internal mutation — call via dashboard or `npx convex run seed:run`.
 */
export const run = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? true;
    const results: Record<string, any> = {};

    results.roles = await seedRoles(ctx, { dryRun });
    results.courses = await seedCourses(ctx, { dryRun });
    results.users = await seedUsers(ctx, { dryRun });
    results.applications = await seedApplications(ctx, { dryRun });
    results.cohorts = await seedCohorts(ctx, { dryRun });
    results.payments = await seedPayments(ctx, { dryRun });
    results.enrollments = await seedEnrollments(ctx, { dryRun });
    results.notifications = await seedNotifications(ctx, { dryRun });
    results.settings = await seedSettings(ctx, { dryRun });

    return {
      dryRun,
      message: dryRun
        ? "Dry run complete. No data was inserted. Call with { dryRun: false } to insert."
        : "Database seeded successfully.",
      results,
    };
  },
});

export const clearAll = internalMutation({
  handler: async (ctx) => {
    const tables = [
      "users",
      "roles",
      "applications",
      "payments",
      "enrollments",
      "notifications",
      "cohorts",
      "courses",
      "quizQuestions",
      "settings",
      "analytics_cache",
    ] as const;

    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
    return { message: "All data cleared." };
  },
});
