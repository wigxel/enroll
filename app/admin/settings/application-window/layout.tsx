import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Window | CMK",
};

export type ApplicationWindowLayoutProps = {
  children: React.ReactNode;
};

export function ApplicationWindowLayout(props: ApplicationWindowLayoutProps) {
  const { children } = props;

  return children;
}
