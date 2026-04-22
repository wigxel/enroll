import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Window | CMK",
};

export default function ApplicationWindowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
