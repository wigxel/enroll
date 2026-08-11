import { internalMutation } from "./_generated/server";

/**
 * One-off migrations for data that predates a feature.
 *
 * Run with `npx convex run migrations:<name>` after deploying. Each one must be
 * safe to run twice — a half-finished deploy is retried far more often than it
 * is reasoned about.
 */

const PLACEMENT_PRIVILEGES_BY_ROLE: Record<string, string[]> = {
  Admin: ["placement:read", "placement:manage"],
  Staff: ["placement:read", "placement:manage"],
  Auditor: ["placement:read"],
};

/**
 * Grants the placement privileges to roles that already exist.
 *
 * `seed.ts` only writes roles into an empty table, so an environment seeded
 * before talent requests shipped would otherwise leave every admin locked out
 * of the new screen with no obvious cause.
 */
export const backfillPlacementPrivileges = internalMutation({
  args: {},
  handler: async (ctx) => {
    const roles = await ctx.db.query("roles").collect();
    const updated: string[] = [];

    for (const role of roles) {
      const required = PLACEMENT_PRIVILEGES_BY_ROLE[role.name];
      if (!required) continue;

      const missing = required.filter((p) => !role.privileges.includes(p));
      if (missing.length === 0) continue;

      await ctx.db.patch(role._id, {
        privileges: [...role.privileges, ...missing],
      });
      updated.push(`${role.name}: +${missing.join(", ")}`);
    }

    return {
      status: "success",
      rolesChecked: roles.length,
      rolesUpdated: updated.length,
      details: updated,
    };
  },
});
