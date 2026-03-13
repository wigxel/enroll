"use client";

import type React from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { useCreateOrGetUser } from "@/hooks/use-create-or-get-user";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useCreateOrGetUser();
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto w-full">{children}</main>
      </div>
    </div>
  );
}
