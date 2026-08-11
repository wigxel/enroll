import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Portal | CMK",
};

export type StudentLayoutProps = {
  children: React.ReactNode;
};

export function StudentLayout(props: StudentLayoutProps) {
  const { children } = props;

  return children;
}
export default StudentLayout;
