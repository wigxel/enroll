import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz | CMK",
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
