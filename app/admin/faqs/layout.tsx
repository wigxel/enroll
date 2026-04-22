import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage FAQs | CMK",
};

export default function FAQsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
