import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Portal | CMK",
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
