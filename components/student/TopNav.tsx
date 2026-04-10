"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { cn } from "~/lib/utils";
import { NotificationBell } from "./NotificationBell";

interface NavItem {
  name: string;
  href: string;
}

const applicantNav: NavItem[] = [
  { name: "Home", href: "/student/dashboard" },
  { name: "My Application", href: "/student/application-pending" },
];

const enrollmentNav: NavItem[] = [
  { name: "Enrollment", href: "/student/enrollment" },
];

const studentNav: NavItem[] = [
  { name: "Home", href: "/student/dashboard" },
  { name: "Certifications", href: "/student/certifications" },
];

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const name = user?.fullName ?? user?.username ?? "User";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const imageUrl = user?.imageUrl;
  const initials = getInitials(name);

  // Basic nav logic: show student nav when on /student/* routes
  const navItems: NavItem[] = pathname.startsWith("/student")
    ? studentNav
    : [...applicantNav, ...enrollmentNav];

  const handleSignOut = () => {
    router.push("/logout");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-primary">
              <Image src={"/logo.svg"} className="w-30" alt={"CMK Logo"} width={505.74} height={171.5} />
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
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
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
                {/* Avatar — photo if available, else initials */}
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                  {isLoaded && imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={name}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold leading-none text-primary">
                      {isLoaded ? initials : "…"}
                    </span>
                  )}
                </div>
                <span className="hidden text-sm font-medium text-gray-700 sm:inline-block">
                  {isLoaded ? name : "Loading…"}
                </span>
              </button>
            </HoverCardTrigger>
            <HoverCardContent
              side="bottom"
              align="end"
              sideOffset={8}
              className="w-56 p-2"
            >
              <div className="mb-1 flex items-center gap-3 border-b border-gray-100 px-2 py-2">
                {/* Mini avatar inside dropdown */}
                <div className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary/10">
                  {isLoaded && imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={name}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="m-auto text-xs font-semibold text-primary">
                      {isLoaded ? initials : "…"}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {name}
                  </p>
                  <p className="truncate text-xs text-gray-500">{email}</p>
                </div>
              </div>
              <button
                type="button"
                className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={handleSignOut}
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
