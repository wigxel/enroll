"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "~/convex/_generated/api";
import { isStudentRole } from "~/lib/roles";

export function useStudentGuard(): boolean {
  const router = useRouter();
  const result = useQuery(api.users.getCurrentUser);

  const isLoading = result === undefined;
  const role = result?.success ? result.data?.role : null;

  useEffect(() => {
    if (isLoading) return;

    if (!role || !isStudentRole(role)) {
      router.replace("/");
    }
  }, [isLoading, role, router]);

  return isLoading;
}
