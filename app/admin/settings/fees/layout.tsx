import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fee Settings | CMK",
};

export type FeesLayoutProps = {
  children: React.ReactNode;
};

export function FeesLayout(props: FeesLayoutProps) {
  const { children } = props;

  return children;
}
export default FeesLayout;
