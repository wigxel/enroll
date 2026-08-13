"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ReactNode } from "react";
import { useCreateOrGetUser } from "@/hooks/use-create-or-get-user";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

function UserSync() {
  useCreateOrGetUser();
  return null;
}

export type ConvexClientProviderProps = { children: ReactNode };

export function ConvexClientProvider(props: ConvexClientProviderProps) {
  const { children } = props;

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <UserSync />
      {children}
    </ConvexProviderWithClerk>
  );
}
