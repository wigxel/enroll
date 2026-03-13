"use client";

import { Calendar, DollarSign, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";

const settingsTabs = [
  { name: "Team", href: "/admin/settings/team", icon: Users },
  {
    name: "Application Window",
    href: "/admin/settings/application-window",
    icon: Calendar,
  },
  { name: "Fees", href: "/admin/settings/fees", icon: DollarSign },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

        <div className="mt-6 flex gap-8">
          {/* Left Nav — 30% */}
          <nav className="w-[30%] flex-shrink-0">
            <ul className="space-y-1">
              {settingsTabs.map((tab) => {
                const isActive = pathname === tab.href;
                const Icon = tab.icon;
                return (
                  <li key={tab.href}>
                    <Link
                      href={tab.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {tab.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right Content — 70% */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
