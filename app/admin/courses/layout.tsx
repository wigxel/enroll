import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Courses | CMK",
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
