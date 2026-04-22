import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under Review | CMK",
};

export default function UnderReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
