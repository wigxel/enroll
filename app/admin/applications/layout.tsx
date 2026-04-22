import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Applications | CMK",
};

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
