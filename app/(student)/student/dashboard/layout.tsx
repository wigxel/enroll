import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Dashboard | CMK",
};

export type StudentDashboardLayoutProps = {
  children: React.ReactNode;
};

export function StudentDashboardLayout(props: StudentDashboardLayoutProps) {
  const { children } = props;

  return children;
}
export default StudentDashboardLayout;
