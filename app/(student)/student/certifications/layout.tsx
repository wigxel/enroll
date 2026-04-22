import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certifications | CMK",
};

export default function CertificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
