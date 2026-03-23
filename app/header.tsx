import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { BookOpen, GraduationCap, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export async function Header() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <header className="sticky top-0 z-50 bg-background-100">
      <div className="mx-auto flex h-16 container items-center justify-between">
        <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          <Image
            alt="CMK Brand Logo"
            src="/logo.svg"
            className="w-30 object-cover"
            width={505.74}
            height={171.5}
          />
        </span>

        <nav className="flex items-center gap-1">
          <Link
            href="/applications"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <BookOpen className="h-4 w-4" />
            Programs
          </Link>
          <Link
            href="/alumni"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <GraduationCap className="h-4 w-4" />
            Alumni
          </Link>

          {isSignedIn ? (
            <div className="ml-2 flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                Dashboard
              </Link>
              <UserButton />
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <SignInButton mode="redirect">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-800"
                >
                  <LogIn className="h-4 w-4" />
                  Log in
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  Sign up
                </button>
              </SignUpButton>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
