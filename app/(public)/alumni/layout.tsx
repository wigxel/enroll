import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alumni | CMK",
};

export default function AlumniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
