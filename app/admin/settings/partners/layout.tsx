import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Settings | CMK",
};

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
