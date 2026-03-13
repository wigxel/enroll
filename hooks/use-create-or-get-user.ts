"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "@/convex/_generated/api";

/**
 * Automatically upserts the signed-in Clerk user into the Convex `users` table.
 * Drop this hook into any layout that requires an authenticated user record.
 */
export function useCreateOrGetUser() {
  const { user, isLoaded } = useUser();
  const createOrGetUser = useMutation(api.users.createOrGetUser);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || hasRun.current) return;
    hasRun.current = true;

    const email = user.primaryEmailAddress?.emailAddress ?? "";
    const name = user.fullName ?? user.username ?? email;
    const profileImage = user.imageUrl;

    createOrGetUser({
      clerkId: user.id,
      email,
      name,
      profileImage,
    }).catch(console.error);
  }, [isLoaded, user, createOrGetUser]);
}
