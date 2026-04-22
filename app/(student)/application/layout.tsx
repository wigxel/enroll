import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application | CMK",
};

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col pt-10 pb-20">
      {children}
    </main>
  );
}
