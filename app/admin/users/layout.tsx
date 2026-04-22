import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Users | CMK",
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
