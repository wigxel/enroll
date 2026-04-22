import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Cohorts | CMK",
};

export default function CohortsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
