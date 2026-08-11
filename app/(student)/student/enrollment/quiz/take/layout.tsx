import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Take Quiz | CMK",
};

export type TakeQuizLayoutProps = {
  children: React.ReactNode;
};

export function TakeQuizLayout(props: TakeQuizLayoutProps) {
  const { children } = props;

  return children;
}
export default TakeQuizLayout;
