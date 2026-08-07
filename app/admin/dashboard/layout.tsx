import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | CMK",
};

export type AdminDashboardLayoutProps = {
  children: React.ReactNode;
};

export function AdminDashboardLayout(props: AdminDashboardLayoutProps) {
  const { children } = props;

  return children;
}
