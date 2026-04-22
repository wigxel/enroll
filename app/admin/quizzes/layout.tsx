import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Quizzes | CMK",
};

export default function QuizzesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
