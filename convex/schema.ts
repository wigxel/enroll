import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.id("roles"),
    profileImage: v.optional(v.string()),
    isAlumni: v.optional(v.boolean()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  students: defineTable({
    code: v.string(),
    userId: v.id("users"),
    profileImage: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_code", ["code"]),

  roles: defineTable({
    name: v.string(),
    description: v.string(),
    privileges: v.array(v.string()),
  }).index("by_name", ["name"]),

  applications: defineTable({
    userId: v.optional(v.id("users")),
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
    submittedAt: v.optional(v.string()),
    reviewedAt: v.optional(v.string()),
    reviewedBy: v.optional(v.id("users")),
    rejectionReason: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["data.email"])
    .index("by_phoneNumber", ["data.phoneNumber"])
    .index("by_status", ["status"])
    .index("by_paymentStatus", ["paymentStatus"])
    .index("by_courseId", ["data.courseId"]),

  payments: defineTable({
    userId: v.optional(v.id("users")),
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
    quizAttempts: v.optional(v.number()),
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
    instructorIds: v.optional(v.array(v.id("instructors"))),
    faqIds: v.optional(v.array(v.id("faqs"))),
    jobIds: v.optional(v.array(v.id("jobs"))),
    brochureUrl: v.optional(v.string()),
    quizPolicy: v.optional(
      v.object({
        enabled: v.boolean(),
        passScore: v.number(),
        allowRetake: v.boolean(),
        maxAttempts: v.number(),
      }),
    ),
    prerequisites: v.optional(
      v.array(
        v.object({
          key: v.string(),
          value: v.string(),
        }),
      ),
    ),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_order", ["order"])
    .index("by_isActive", ["isActive"])
    .index("by_slug", ["slug"]),

  instructors: defineTable({
    name: v.string(),
    title: v.string(),
    photo: v.optional(v.string()),
    bio: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_name", ["name"]),

  reviews: defineTable({
    userId: v.id("users"),
    courseId: v.optional(v.id("courses")),
    rating: v.number(),
    text: v.string(),
    isApproved: v.boolean(),
    createdAt: v.string(),
  })
    .index("by_courseId", ["courseId"])
    .index("by_userId", ["userId"]),

  quizQuestions: defineTable({
    question: v.string(),
    options: v.array(v.string()),
    correctOptionIndex: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_isActive", ["isActive"]),

  faqs: defineTable({
    question: v.string(),
    answer: v.string(),
    order: v.number(),
    isActive: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_order", ["order"]),

  settings: defineTable({
    isAcceptingApplications: v.boolean(),
    openDate: v.optional(v.string()),
    closeDate: v.optional(v.string()),
    applicationFeeAmount: v.number(),
    tuitionFeeAmount: v.number(),
    updatedAt: v.string(),
  }),

  analytics_cache: defineTable({
    key: v.string(),
    data: v.any(),
    updatedAt: v.string(),
  }).index("by_key", ["key"]),

  partners: defineTable({
    name: v.string(),
    logo: v.string(),
    isActive: v.boolean(),
    order: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_order", ["order"])
    .index("by_isActive", ["isActive"]),

  jobs: defineTable({
    title: v.string(),
    company: v.string(),
    salaryMin: v.number(),
    salaryMax: v.number(),
    image: v.optional(v.string()),
    description: v.string(),
    order: v.number(),
    isActive: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_order", ["order"]),

  /**
   * Inbound requests from businesses that want to hire our graduates.
   *
   * Deliberately separate from `jobs`: that table is admin-authored marketing
   * shown on course pages, while these are real leads with a contact and an
   * expectation of a reply. Mixing them would leave course pages advertising
   * roles that were filled months ago.
   *
   * `specialties` stores catalogue keys as plain strings rather than a literal
   * union so the catalogue in `lib/talent.helpers.ts` can grow without a schema
   * migration. Membership is enforced in the mutation instead.
   */
  talentRequests: defineTable({
    companyName: v.string(),
    companyEmail: v.string(),
    contactPhone: v.string(),
    specialties: v.array(v.string()),
    description: v.string(),
    hirePeriod: v.union(v.literal("short_term"), v.literal("long_term")),
    jobDuration: v.union(
      v.literal("full_time"),
      v.literal("part_time"),
      v.literal("one_off"),
    ),
    status: v.union(
      v.literal("new"),
      v.literal("in_review"),
      v.literal("shortlisted"),
      v.literal("placed"),
      v.literal("closed"),
    ),
    /** Free-text note explaining a `closed` or `placed` outcome. */
    outcomeNote: v.optional(v.string()),
    /** Last staff member to move the request along. */
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.string()),
    /**
     * Stamped once, when the request first leaves `new`. Time-to-first-response
     * is the metric that decides whether this pipeline beats a WhatsApp thread,
     * so it needs to survive later status changes.
     */
    firstRespondedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_companyEmail", ["companyEmail"])
    .index("by_createdAt", ["createdAt"]),
});
