"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "~/convex/_generated/api";
import { isAdminRole } from "~/lib/roles";

export function useAdminGuard(): boolean {
  const router = useRouter();
  const result = useQuery(api.users.getCurrentUser);

  const isLoading = result === undefined;
  const role = result?.success ? result.data?.role : null;

  useEffect(() => {
    if (isLoading) return;

    const interval = setTimeout(() => {
      router.replace("/");
      if (!role || !isAdminRole(role)) {
        router.replace("/");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoading, role, router]);

  return isLoading;
}
