import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Instructors | CMK",
};

export type InstructorsLayoutProps = {
  children: React.ReactNode;
};

export function InstructorsLayout(props: InstructorsLayoutProps) {
  const { children } = props;

  return children;
}
