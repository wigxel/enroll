import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Payments | CMK",
};

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
