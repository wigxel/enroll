"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    // We use sign-out and tell it to navigate back home after completion
    signOut({ redirectUrl: "/" }).catch((err) => {
      console.error("Sign-out failed:", err);
      // Fallback redirect if sign-out crashes
      router.push("/");
    });
  }, [signOut, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-gray-50 dark:bg-zinc-950 px-4 text-center">
      <div className="rounded-full bg-white dark:bg-zinc-900 p-4 shadow-sm border border-gray-100 dark:border-zinc-800">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Signing you out...
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cleaning up your session, please wait.
        </p>
      </div>
    </div>
  );
}
