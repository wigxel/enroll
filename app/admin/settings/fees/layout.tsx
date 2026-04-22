import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fee Settings | CMK",
};

export default function FeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
