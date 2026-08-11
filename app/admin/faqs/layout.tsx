import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage FAQs | CMK",
};

export type FAQsLayoutProps = {
  children: React.ReactNode;
};

export function FAQsLayout(props: FAQsLayoutProps) {
  const { children } = props;

  return children;
}
export default FAQsLayout;
