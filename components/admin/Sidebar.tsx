"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  Bell,
  BookOpen,
  CircleHelp,
  CreditCard,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { cn } from "~/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Applications", href: "/admin/applications", icon: FileText },
  { name: "Students", href: "/admin/users", icon: GraduationCap },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Instructors", href: "/admin/instructors", icon: Users },
  { name: "Quizzes", href: "/admin/quizzes", icon: BookOpen },
  { name: "Cohorts", href: "/admin/cohorts", icon: Layers },
  { name: "FAQs", href: "/admin/faqs", icon: CircleHelp },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const name = user?.fullName ?? user?.username ?? "Admin";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const avatarUrl = user?.imageUrl;

  // Retrieve user object from Convex to show their assigned role
  const currentUserResult = useQuery(api.users.getCurrentUser);
  const currentUser = currentUserResult?.success
    ? currentUserResult.data
    : null;
  const role = currentUser?.role ?? "User";

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 shrink-0 items-center px-6">
        <span className="text-xl font-bold tracking-tight text-primary">
          Enrollment
        </span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-4 py-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-gray-400 group-hover:text-gray-500",
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-gray-200 p-4">
        <HoverCard openDelay={200} closeDelay={300}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center rounded-md px-2 py-2 transition-colors hover:bg-gray-50"
            >
              {/* Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary overflow-hidden">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={name}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium leading-none">
                    {initials}
                  </span>
                )}
              </div>
              <div className="ml-3 flex min-w-0 flex-1 flex-col text-left">
                <span className="truncate text-sm font-medium text-gray-900">
                  {name}
                </span>
                {currentUser && (
                  <span className="mt-1 w-fit truncate rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    {role
                      .replace("_", " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                )}
              </div>
            </button>
          </HoverCardTrigger>
          <HoverCardContent
            side="top"
            align="end"
            sideOffset={8}
            className="w-56 p-2"
          >
            <div className="px-2 py-1.5 mb-1 border-b border-gray-100 flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-900">{name}</p>
              <p className="text-xs text-gray-500">{email}</p>
              {currentUser && (
                <span className="w-fit rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  {role
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              )}
            </div>
            <button
              type="button"
              className={cn(
                "group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900",
              )}
              onClick={() => router.push("/logout")}
            >
              <LogOut
                className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
              Sign Out
            </button>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
}
