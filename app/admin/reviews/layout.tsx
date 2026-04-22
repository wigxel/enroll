import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Reviews | CMK",
};

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
