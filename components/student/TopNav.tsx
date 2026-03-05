"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";

interface NavItem {
  name: string;
  href: string;
}

const applicantNav: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Application", href: "/application" },
  { name: "Status", href: "/application/status" },
];

const enrollmentNav: NavItem[] = [{ name: "Enrollment", href: "/enrollment" }];

const studentNav: NavItem[] = [
  { name: "Home", href: "/student/dashboard" },
  { name: "Certifications", href: "/student/certifications" },
];

// TODO: Replace with actual user data from Convex
function useCurrentUser() {
  return {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    initials: "JD",
    role: "Applicant" as "Applicant" | "Student",
    applicationStatus: "approved" as
      | "draft"
      | "submitted"
      | "under_review"
      | "approved"
      | "declined",
    enrollmentStatus: null as "pending" | "completed" | null,
  };
}

function getNavigationItems(
  user: ReturnType<typeof useCurrentUser>,
): NavItem[] {
  const items: NavItem[] = [];

  if (user.role === "Student") {
    items.push(...studentNav);
  } else {
    // Applicant role
    if (
      user.applicationStatus === "draft" ||
      user.applicationStatus === "submitted" ||
      user.applicationStatus === "under_review" ||
      user.applicationStatus === "declined"
    ) {
      items.push(...applicantNav);
    }
    if (user.applicationStatus === "approved") {
      items.push(...applicantNav, ...enrollmentNav);
    }
  }

  return items;
}

export function TopNav() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const navItems = getNavigationItems(user);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-primary">
              Enrollment
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Notification Bell + User avatar */}
        <div className="flex items-center gap-2">
          <NotificationBell />

          <HoverCard openDelay={200} closeDelay={300}>
            <HoverCardTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-xs font-semibold leading-none">
                    {user.initials}
                  </span>
                </div>
                <span className="hidden text-sm font-medium text-gray-700 sm:inline-block">
                  {user.name}
                </span>
              </button>
            </HoverCardTrigger>
            <HoverCardContent
              side="bottom"
              align="end"
              sideOffset={8}
              className="w-56 p-2"
            >
              <div className="px-2 py-1.5 mb-1 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                type="button"
                className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => {
                  // TODO: Implement actual sign out via Clerk
                  console.log("Sign out clicked");
                }}
              >
                <LogOut
                  className="mr-3 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                Sign Out
              </button>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </header>
  );
}
