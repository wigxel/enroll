import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application | CMK",
};

export type ApplicationLayoutProps = {
  children: React.ReactNode;
};

export function ApplicationLayout(props: ApplicationLayoutProps) {
  const { children } = props;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col pt-10 pb-20">
      {children}
    </main>
  );
}
