import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talent Requests | CMK",
};

export type TalentRequestsLayoutProps = {
  children: React.ReactNode;
};

export function TalentRequestsLayout(props: TalentRequestsLayoutProps) {
  const { children } = props;

  return children;
}
export default TalentRequestsLayout;
