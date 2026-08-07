import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Reviews | CMK",
};

export type ReviewsLayoutProps = {
  children: React.ReactNode;
};

export function ReviewsLayout(props: ReviewsLayoutProps) {
  const { children } = props;

  return children;
}
