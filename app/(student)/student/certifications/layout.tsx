import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certifications | CMK",
};

export type CertificationsLayoutProps = {
  children: React.ReactNode;
};

export function CertificationsLayout(props: CertificationsLayoutProps) {
  const { children } = props;

  return children;
}
export default CertificationsLayout;
