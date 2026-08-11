import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Settings | CMK",
};

export type PartnersLayoutProps = {
  children: React.ReactNode;
};

export function PartnersLayout(props: PartnersLayoutProps) {
  const { children } = props;

  return children;
}
export default PartnersLayout;
