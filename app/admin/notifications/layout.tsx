import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Notifications | CMK",
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
