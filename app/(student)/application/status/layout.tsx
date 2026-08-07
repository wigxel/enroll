import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Status | CMK",
};

export type StatusLayoutProps = {
  children: React.ReactNode;
};

export function StatusLayout(props: StatusLayoutProps) {
  const { children } = props;

  return children;
}
