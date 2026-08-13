import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Settings | CMK",
};

export type TeamLayoutProps = {
  children: React.ReactNode;
};

export function TeamLayout(props: TeamLayoutProps) {
  const { children } = props;

  return children;
}
export default TeamLayout;
