import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";

export default async function DashboardProxy() {
  const { userId, getToken } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get the token for Convex authentication
  const token = await getToken({ template: "convex" });

  // Fetch the current user's Convex record with their role name
  // If the user record isn't created yet, the query returns null
  const userResult = await fetchQuery(
    api.users.getCurrentUser,
    {},
    token ? { token } : undefined,
  );

  // If the user doesn't exist in Convex yet, or query failed, redirect
  // them somewhere to trigger user creation or just go to home.
  if (!userResult || !userResult.success || !userResult.data) {
    redirect("/");
  }

  const user = userResult.data;

  console.log("User", user);

  // Define admin roles
  const ADMIN_ROLES = ["admin", "staff", "auditor"];

  if (ADMIN_ROLES.includes(user.role.toLowerCase())) {
    redirect("/admin/dashboard");
  }

  // Fallback to student dashboard
  redirect("/student/dashboard");
}
