import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.id("roles"),
    profileImage: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  roles: defineTable({
    name: v.string(),
    description: v.string(),
    privileges: v.array(v.string()),
  }).index("by_name", ["name"]),

  applications: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("declined"),
    ),
    paymentStatus: v.union(v.literal("unpaid"), v.literal("paid")),
    data: v.object({
      firstName: v.string(),
      lastName: v.string(),
      dateOfBirth: v.string(),
      gender: v.string(),
      address: v.string(),
      phoneNumber: v.string(),
      educationalBackground: v.string(),
      courseId: v.id("courses"),
    }),
    submittedAt: v.optional(v.string()),
    reviewedAt: v.optional(v.string()),
    reviewedBy: v.optional(v.id("users")),
    rejectionReason: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_paymentStatus", ["paymentStatus"]),

  payments: defineTable({
    userId: v.id("users"),
    referenceId: v.string(),
    referenceType: v.union(v.literal("application"), v.literal("tuition")),
    amount: v.number(),
    currency: v.string(),
    stripePaymentIntentId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
    createdAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_referenceId", ["referenceId"])
    .index("by_status", ["status"]),

  enrollments: defineTable({
    userId: v.id("users"),
    applicationId: v.id("applications"),
    cohortId: v.optional(v.id("cohorts")),
    steps: v.object({
      tuitionPaid: v.boolean(),
      quizPassed: v.boolean(),
      documentsSigned: v.boolean(),
    }),
    status: v.union(v.literal("pending"), v.literal("completed")),
    completedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_applicationId", ["applicationId"])
    .index("by_status", ["status"])
    .index("by_cohortId", ["cohortId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    relatedEntityId: v.optional(v.string()),
    relatedEntityType: v.optional(v.string()),
    isRead: v.boolean(),
    isArchived: v.boolean(),
    createdAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isRead", ["userId", "isRead"])
    .index("by_userId_isArchived", ["userId", "isArchived"]),

  cohorts: defineTable({
    name: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    capacity: v.optional(v.number()),
  }).index("by_name", ["name"]),

  courses: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    duration: v.string(),
    certification: v.string(),
    coverPhoto: v.optional(v.string()),
    tuitionFee: v.number(),
    order: v.number(),
    isActive: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_order", ["order"])
    .index("by_isActive", ["isActive"])
    .index("by_slug", ["slug"]),

  settings: defineTable({
    isAcceptingApplications: v.boolean(),
    openDate: v.optional(v.string()),
    closeDate: v.optional(v.string()),
    applicationFeeAmount: v.number(),
    tuitionFeeAmount: v.number(),
    updatedAt: v.string(),
  }),
});
