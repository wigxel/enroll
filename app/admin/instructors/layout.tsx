import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Instructors | CMK",
};

export default function InstructorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
