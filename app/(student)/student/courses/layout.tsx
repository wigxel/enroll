import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Courses | CMK",
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
