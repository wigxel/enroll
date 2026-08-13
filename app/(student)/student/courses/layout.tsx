import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Courses | CMK",
};

export type CoursesLayoutProps = {
  children: React.ReactNode;
};

export function CoursesLayout(props: CoursesLayoutProps) {
  const { children } = props;

  return children;
}
export default CoursesLayout;
