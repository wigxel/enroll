import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Notifications | CMK",
};

export type NotificationsLayoutProps = {
  children: React.ReactNode;
};

export function NotificationsLayout(props: NotificationsLayoutProps) {
  const { children } = props;

  return children;
}
export default NotificationsLayout;
