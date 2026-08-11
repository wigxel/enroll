import { v } from "convex/values";
import {
  formatSpecialties,
  normalizeEmail,
  normalizePhone,
  TALENT_LIMITS,
  validateTalentRequest,
} from "../lib/talent.helpers";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, type QueryCtx, query } from "./_generated/server";
import { now, type Result, requirePrivilege } from "./utils";

/**
 * Hard limits on the public intake endpoint.
 *
 * `submit` is callable without authentication, which makes it the only write
 * path in the app a stranger can reach. These two rules keep a scripted flood
 * from filling the table and burying real leads in the admin inbox.
 */
const MAX_REQUESTS_PER_EMAIL_PER_WINDOW = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

/** Re-submitting the identical request inside this window is treated as a double-click. */
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

const hirePeriodValidator = v.union(
  v.literal("short_term"),
  v.literal("long_term"),
);

const jobDurationValidator = v.union(
  v.literal("full_time"),
  v.literal("part_time"),
  v.literal("one_off"),
);

const statusValidator = v.union(
  v.literal("new"),
  v.literal("in_review"),
  v.literal("shortlisted"),
  v.literal("placed"),
  v.literal("closed"),
);

/**
 * Public: Records a hiring request from a business.
 *
 * Intentionally unauthenticated — requiring a login here would lose most of the
 * leads this feature exists to capture. Everything the caller sends is treated
 * as hostile: validated against the shared rules, capped in length, and checked
 * against the specialty catalogue before it reaches the database.
 */
export const submit = mutation({
  args: {
    companyName: v.string(),
    companyEmail: v.string(),
    contactPhone: v.string(),
    specialties: v.array(v.string()),
    description: v.string(),
    hirePeriod: hirePeriodValidator,
    jobDuration: jobDurationValidator,
    /**
     * Honeypot. Hidden from real users by CSS, so anything here means a bot
     * filled every field it could find.
     */
    contactPreference: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Result<{ id: Id<"talentRequests"> }>> => {
    if (args.contactPreference) {
      // Report success so a bot gets no signal about why it failed.
      return { success: true, data: { id: "" as Id<"talentRequests"> } };
    }

    const validationError = validateTalentRequest(args);
    if (validationError) {
      return { success: false, error: validationError.message };
    }

    const companyEmail = normalizeEmail(args.companyEmail);
    const companyName = args.companyName.trim();
    const description = args.description.trim();
    const specialties = Array.from(new Set(args.specialties));

    const recent = await ctx.db
      .query("talentRequests")
      .withIndex("by_companyEmail", (q) => q.eq("companyEmail", companyEmail))
      .collect();

    const nowMs = Date.now();

    // A repeated submission of the same text is almost always an impatient
    // second click, not a second vacancy. Return the original instead of
    // creating a twin that staff then have to reconcile.
    const duplicate = recent.find(
      (existing) =>
        existing.description === description &&
        nowMs - new Date(existing.createdAt).getTime() < DUPLICATE_WINDOW_MS,
    );
    if (duplicate) {
      return { success: true, data: { id: duplicate._id } };
    }

    const withinWindow = recent.filter(
      (existing) =>
        nowMs - new Date(existing.createdAt).getTime() < RATE_LIMIT_WINDOW_MS,
    );
    if (withinWindow.length >= MAX_REQUESTS_PER_EMAIL_PER_WINDOW) {
      return {
        success: false,
        error:
          "You have submitted several requests recently. Please give us a little time to respond, or call us if it is urgent.",
      };
    }

    const timestamp = now();
    const id = await ctx.db.insert("talentRequests", {
      companyName,
      companyEmail,
      contactPhone: normalizePhone(args.contactPhone),
      specialties,
      description,
      hirePeriod: args.hirePeriod,
      jobDuration: args.jobDuration,
      status: "new",
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await ctx.runMutation(internal.notifications.sendNotification, {
      type: "talent_request_submitted",
      title: "New talent request",
      body: `${companyName} is looking for ${formatSpecialties(specialties)}.`,
      relatedEntityId: id,
      relatedEntityType: "talentRequest",
      targetAdmins: true,
    });

    return { success: true, data: { id } };
  },
});

type TalentRequestWithReviewer = Doc<"talentRequests"> & {
  reviewedByName: string | null;
};

/** Per-status tallies that drive the pipeline tab badges. */
type TalentRequestCounts = Record<Doc<"talentRequests">["status"], number> & {
  all: number;
};

type TalentRequestListResult = {
  requests: TalentRequestWithReviewer[];
  counts: TalentRequestCounts;
  canManage: boolean;
};

/**
 * Attaches the reviewing staff member's name so the pipeline shows who owns a
 * request without the client needing a second round-trip per row.
 */
const withReviewerName = async (
  ctx: QueryCtx,
  requests: Doc<"talentRequests">[],
): Promise<TalentRequestWithReviewer[]> => {
  const reviewerIds = Array.from(
    new Set(
      requests
        .map((request) => request.reviewedBy)
        .filter((id): id is Id<"users"> => !!id),
    ),
  );

  const reviewers = await Promise.all(reviewerIds.map((id) => ctx.db.get(id)));
  const nameById = new Map(
    reviewers
      .filter((user): user is Doc<"users"> => !!user)
      .map((user) => [user._id, user.name]),
  );

  return requests.map((request) => ({
    ...request,
    reviewedByName: request.reviewedBy
      ? (nameById.get(request.reviewedBy) ?? null)
      : null,
  }));
};

/**
 * Admin: Lists talent requests newest first, with per-status counts.
 *
 * The counts come from the same unfiltered read the list uses, so the tab
 * badges cannot drift out of step with the rows on screen.
 */
export const list = query({
  args: {
    status: v.optional(statusValidator),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Result<TalentRequestListResult>> => {
    const privResult = await requirePrivilege(ctx, "placement:read");
    if (!privResult.success) return privResult;

    const all = await ctx.db
      .query("talentRequests")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    const counts: TalentRequestCounts = {
      all: all.length,
      new: 0,
      in_review: 0,
      shortlisted: 0,
      placed: 0,
      closed: 0,
    };
    for (const request of all) {
      counts[request.status] += 1;
    }

    let filtered = args.status
      ? all.filter((request) => request.status === args.status)
      : all;

    const term = args.search?.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter(
        (request) =>
          request.companyName.toLowerCase().includes(term) ||
          request.companyEmail.includes(term) ||
          request.contactPhone.includes(term) ||
          request.description.toLowerCase().includes(term),
      );
    }

    return {
      success: true,
      data: {
        requests: await withReviewerName(ctx, filtered),
        counts,
        // Read and manage are separate privileges (Auditor gets read only), and
        // the client has no view of the privilege list — so the server decides
        // whether to offer the status control rather than the UI guessing.
        canManage: (await requirePrivilege(ctx, "placement:manage")).success,
      },
    };
  },
});

/**
 * Admin: Reads a single talent request.
 */
export const getById = query({
  args: { requestId: v.id("talentRequests") },
  handler: async (ctx, args): Promise<Result<TalentRequestWithReviewer>> => {
    const privResult = await requirePrivilege(ctx, "placement:read");
    if (!privResult.success) return privResult;

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      return { success: false, error: "Talent request not found." };
    }

    const [enriched] = await withReviewerName(ctx, [request]);
    return { success: true, data: enriched };
  },
});

/**
 * Admin: Moves a request along the pipeline.
 *
 * Stamps `firstRespondedAt` the first time a request leaves `new`, which is the
 * number that tells us whether this pipeline is actually serving businesses
 * faster than the inbox it replaced.
 */
export const updateStatus = mutation({
  args: {
    requestId: v.id("talentRequests"),
    status: statusValidator,
    outcomeNote: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Result<null>> => {
    const privResult = await requirePrivilege(ctx, "placement:manage");
    if (!privResult.success) return privResult;
    const user = privResult.data;

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      return { success: false, error: "Talent request not found." };
    }

    const note = args.outcomeNote?.trim();
    if (note && note.length > TALENT_LIMITS.outcomeNoteMax) {
      return {
        success: false,
        error: `Note must be ${TALENT_LIMITS.outcomeNoteMax} characters or fewer.`,
      };
    }

    if (request.status === args.status && note === undefined) {
      return { success: true, data: null };
    }

    const timestamp = now();
    const isFirstResponse = !request.firstRespondedAt && args.status !== "new";

    await ctx.db.patch(args.requestId, {
      status: args.status,
      ...(note !== undefined && { outcomeNote: note || undefined }),
      ...(isFirstResponse && { firstRespondedAt: timestamp }),
      reviewedBy: user._id,
      reviewedAt: timestamp,
      updatedAt: timestamp,
    });

    return { success: true, data: null };
  },
});
