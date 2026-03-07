"use client";

import { ReactNode } from "react";

export default function ApplicationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col pt-10 pb-20">
      {children}
    </main>
  );
}
