import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Cohorts | CMK",
};

export type CohortsLayoutProps = {
  children: React.ReactNode;
};

export function CohortsLayout(props: CohortsLayoutProps) {
  const { children } = props;

  return children;
}
