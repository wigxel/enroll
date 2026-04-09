"use client";

import { Loader2 } from "lucide-react";
import type React from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { useCreateOrGetUser } from "@/hooks/use-create-or-get-user";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useCreateOrGetUser();
  const isLoading = useAdminGuard();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto w-full">{children}</main>
      </div>
    </div>
  );
}
