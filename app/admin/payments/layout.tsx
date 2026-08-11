import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Payments | CMK",
};

export type PaymentsLayoutProps = {
  children: React.ReactNode;
};

export function PaymentsLayout(props: PaymentsLayoutProps) {
  const { children } = props;

  return children;
}
export default PaymentsLayout;
