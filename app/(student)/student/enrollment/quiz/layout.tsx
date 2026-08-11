import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz | CMK",
};

export type QuizLayoutProps = {
  children: React.ReactNode;
};

export function QuizLayout(props: QuizLayoutProps) {
  const { children } = props;

  return children;
}
export default QuizLayout;
