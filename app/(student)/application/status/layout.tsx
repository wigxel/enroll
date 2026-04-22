import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Status | CMK",
};

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
