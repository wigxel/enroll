import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under Review | CMK",
};

export type UnderReviewLayoutProps = {
  children: React.ReactNode;
};

export function UnderReviewLayout(props: UnderReviewLayoutProps) {
  const { children } = props;

  return children;
}
