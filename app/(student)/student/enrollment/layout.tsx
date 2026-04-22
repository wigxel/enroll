import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enrollment | CMK",
};

export default function EnrollmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
