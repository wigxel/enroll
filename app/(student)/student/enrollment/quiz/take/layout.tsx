import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Take Quiz | CMK",
};

export default function TakeQuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
