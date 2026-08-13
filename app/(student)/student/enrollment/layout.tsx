import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enrollment | CMK",
};

export type EnrollmentLayoutProps = {
  children: React.ReactNode;
};

export function EnrollmentLayout(props: EnrollmentLayoutProps) {
  const { children } = props;

  return children;
}
export default EnrollmentLayout;
