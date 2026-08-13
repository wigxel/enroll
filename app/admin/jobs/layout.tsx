import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Opportunities | CMK",
};

export type JobsLayoutProps = {
  children: React.ReactNode;
};

export function JobsLayout(props: JobsLayoutProps) {
  const { children } = props;

  return children;
}
export default JobsLayout;
