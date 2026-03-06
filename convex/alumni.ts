import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Public: Returns alumni grouped by user.
 * Each alumnus has an array of `courses` — one entry per completed enrollment —
 * so a user who completed multiple programs has all certifications in one card.
 * Supports optional filters (courseId, cohortId) and full-name/email search.
 */
export const list = query({
  args: {
    courseId: v.optional(v.id("courses")),
    cohortId: v.optional(v.id("cohorts")),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .collect();

    // Enrich every enrollment
    const enriched = await Promise.all(
      enrollments.map(async (enrollment) => {
        const user = await ctx.db.get(enrollment.userId);
        if (!user) return null;

        const application = await ctx.db.get(enrollment.applicationId);
        if (!application) return null;

        const course = await ctx.db.get(application.data.courseId);
        if (!course) return null;

        const cohort = enrollment.cohortId
          ? await ctx.db.get(enrollment.cohortId)
          : null;

        // Resolve cover photo URL
        let coverPhotoUrl: string | undefined;
        if (course.coverPhoto) {
          const url = await ctx.storage.getUrl(course.coverPhoto as any);
          coverPhotoUrl = url ?? undefined;
        }

        return {
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          userProfileImage: user.profileImage,
          course: {
            courseId: course._id,
            courseName: course.name,
            courseSlug: course.slug,
            coverPhotoUrl,
            certification: course.certification,
            cohortId: cohort?._id ?? null,
            cohortName: cohort?.name ?? null,
            graduatedAt: enrollment.completedAt ?? enrollment.updatedAt,
          },
        };
      }),
    );

    // Drop nulls and apply courseId / cohortId filters per-enrollment
    const filtered = enriched.filter((e): e is NonNullable<typeof e> => {
      if (!e) return false;
      if (args.courseId && e.course.courseId !== args.courseId) return false;
      if (args.cohortId && e.course.cohortId !== args.cohortId) return false;
      return true;
    });

    // Group by userId — one record per alumnus, multiple courses
    type CourseEntry = (typeof filtered)[number]["course"];
    const grouped = new Map<
      string,
      {
        userId: string;
        name: string;
        email: string;
        profileImage?: string;
        courses: CourseEntry[];
        latestGraduatedAt: string;
      }
    >();

    for (const e of filtered) {
      const existing = grouped.get(e.userId);
      if (existing) {
        existing.courses.push(e.course);
        if (e.course.graduatedAt > existing.latestGraduatedAt) {
          existing.latestGraduatedAt = e.course.graduatedAt;
        }
      } else {
        grouped.set(e.userId, {
          userId: e.userId,
          name: e.userName,
          email: e.userEmail,
          profileImage: e.userProfileImage,
          courses: [e.course],
          latestGraduatedAt: e.course.graduatedAt,
        });
      }
    }

    let result = Array.from(grouped.values());

    // Apply name / email search
    if (args.search) {
      const q = args.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q),
      );
    }

    // Sort: most recently graduated first
    result.sort((a, b) =>
      b.latestGraduatedAt.localeCompare(a.latestGraduatedAt),
    );

    return result;
  },
});

/**
 * Public: Returns aggregate stats for the alumni showcase.
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const completedEnrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .collect();

    const courses = await ctx.db.query("courses").collect();
    const cohorts = await ctx.db.query("cohorts").collect();

    // Unique alumni (distinct userIds)
    const uniqueAlumni = new Set(completedEnrollments.map((e) => e.userId));

    return {
      totalAlumni: uniqueAlumni.size,
      totalCourses: courses.filter((c) => c.isActive).length,
      totalCohorts: cohorts.length,
    };
  },
});
