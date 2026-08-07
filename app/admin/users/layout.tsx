import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Users | CMK",
};

export type UsersLayoutProps = {
  children: React.ReactNode;
};

export function UsersLayout(props: UsersLayoutProps) {
  const { children } = props;

  return children;
}
