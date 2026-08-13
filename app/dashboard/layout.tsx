import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | CMK",
};

export type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout(props: DashboardLayoutProps) {
  const { children } = props;

  return children;
}
export default DashboardLayout;
