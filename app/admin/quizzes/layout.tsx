import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Quizzes | CMK",
};

export type QuizzesLayoutProps = {
  children: React.ReactNode;
};

export function QuizzesLayout(props: QuizzesLayoutProps) {
  const { children } = props;

  return children;
}
