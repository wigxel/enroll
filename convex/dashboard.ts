import { query } from "./_generated/server";
import { type Result, requirePrivilege } from "./utils";

export const getDashboardCounts = query({
  args: {},
  handler: async (
    ctx,
  ): Promise<
    Result<{
      pendingApplications: number;
      pendingReviews: number;
      unreadNotifications: number;
      newTalentRequests: number;
    }>
  > => {
    const privResult = await requirePrivilege(ctx, "application:read:all");
    if (!privResult.success) return privResult as any;

    const user = privResult.data;

    const submittedApps = await ctx.db
      .query("applications")
      .withIndex("by_status", (q) => q.eq("status", "submitted"))
      .collect();
    const submitted = submittedApps.length;

    const underReviewApps = await ctx.db
      .query("applications")
      .withIndex("by_status", (q) => q.eq("status", "under_review"))
      .collect();
    const underReview = underReviewApps.length;

    const pendingReviewList = await ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("isApproved"), false))
      .collect();
    const pendingReviews = pendingReviewList.length;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_isRead", (q) =>
        q.eq("userId", user._id).eq("isRead", false),
      )
      .collect();

    const unreadNotifications = unread.filter((n) => !n.isArchived).length;

    // Placement access is a separate privilege, so a role without it simply
    // sees zero rather than the query failing for everyone.
    const canReadPlacements = (await requirePrivilege(ctx, "placement:read"))
      .success;
    const newTalentRequests = canReadPlacements
      ? (
          await ctx.db
            .query("talentRequests")
            .withIndex("by_status", (q) => q.eq("status", "new"))
            .collect()
        ).length
      : 0;

    return {
      success: true,
      data: {
        pendingApplications: submitted + underReview,
        pendingReviews,
        unreadNotifications,
        newTalentRequests,
      },
    };
  },
});
