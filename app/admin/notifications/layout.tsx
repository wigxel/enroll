import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Notifications | CMK",
};

export type NotificationsLayoutProps = {
  children: React.ReactNode;
};

export function NotificationsLayout(props: NotificationsLayoutProps) {
  const { children } = props;

  return children;
}
