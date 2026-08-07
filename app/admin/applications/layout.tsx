import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Applications | CMK",
};

export type ApplicationsLayoutProps = {
  children: React.ReactNode;
};

export function ApplicationsLayout(props: ApplicationsLayoutProps) {
  const { children } = props;

  return children;
}
