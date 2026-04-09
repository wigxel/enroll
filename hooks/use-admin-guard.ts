"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "~/convex/_generated/api";

/**
 * Roles with access to the admin dashboard.
 * Any role not in this set will be redirected to the homepage.
 */
const ADMIN_ROLES = new Set(["Admin", "Staff", "Auditor"]);

/**
 * Guards the admin area against non-admin roles (Applicant, Student, etc.).
 * Must be used inside a Convex provider + Clerk provider.
 *
 * Returns `true` while the role check is still loading so the caller can
 * show a loading state instead of a flash of protected content.
 */
export function useAdminGuard(): boolean {
  const router = useRouter();
  const result = useQuery(api.users.getCurrentUser);

  const isLoading = result === undefined;
  const role = result?.success ? result.data?.role : null;

  useEffect(() => {
    // Still loading — wait
    if (isLoading) return;

    // Role resolved but is not an admin role → redirect
    if (!role || !ADMIN_ROLES.has(role)) {
      router.replace("/");
    }
  }, [isLoading, role, router]);

  return isLoading;
}
