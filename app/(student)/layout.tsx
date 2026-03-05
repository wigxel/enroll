"use client";

import { TopNav } from "@/components/student/TopNav";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <TopNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
