import type { ReactNode } from "react";
import "../globals.css";
import type { Metadata } from "next";
import { Footer } from "./footer";
import { Header } from "./header";

export const metadata: Metadata = {
  title: "Launch a career in Hospitality - CMK",
  description:
    "Browse programs, apply online, and join a community of hospitality",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <div className="z-0 translate-x-1/2 blur-[45px] pointer-events-none translate-y-1/2 w-[50svh] aspect-square rounded-full bg-gradient-to-bl opacity-50 from-red-400 to-red-600 fixed bottom-0 right-0" />
    </>
  );
}
