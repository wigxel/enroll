import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment | CMK",
};

export type PayLayoutProps = { children: React.ReactNode };

export function PayLayout(props: PayLayoutProps) {
  const { children } = props;

  return children;
}
