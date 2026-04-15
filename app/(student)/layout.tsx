"use client";

import { TopNav } from "@/components/student/TopNav";
import { useStudentGuard } from "@/hooks/use-student-guard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoading = useStudentGuard();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <TopNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
