import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hire Talent | CMK",
  description:
    "Tell us the culinary talent your business needs and our placement team will match you with trained graduates.",
};

export type HireLayoutProps = {
  children: React.ReactNode;
};

export function HireLayout(props: HireLayoutProps) {
  const { children } = props;

  return children;
}
export default HireLayout;
