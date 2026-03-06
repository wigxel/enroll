import { query } from "./_generated/server";

export const dumpUsers = query(async (ctx) => {
  const users = await ctx.db.query("users").collect();
  return users.map((u) => ({
    id: u._id,
    clerkId: u.clerkId,
    email: u.email,
    name: u.name,
  }));
});
