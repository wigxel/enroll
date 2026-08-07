import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Opportunities | CMK",
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
