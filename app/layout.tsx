import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { ConvexClientProvider } from "~/components/providers/ConvexClientProvider";
import { Toaster } from "~/components/ui/sonner";
import { QueryProvider } from "~/providers/react-query";
import "./globals.css";
import { bodyFont, condensedFont, displayFont } from "~/styles/font";
import { Footer } from "./footer";
import { Header } from "./header";

export const metadata = {
  title: "Launch a career in Hospitality - CMK",
  description:
    "Browse programs, apply online, and join a community of hospitality",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${displayFont.variable} ${bodyFont.variable} ${condensedFont.variable} antialiased font-body bg-background-100`}
        >
          <QueryProvider>
            <ConvexClientProvider>
              <Header />
              {children}
              <Footer />

              <div className="z-0 translate-x-1/2 blur-[45px] pointer-events-none translate-y-1/2 w-[50svh] aspect-square rounded-full bg-gradient-to-bl opacity-50 from-red-400 to-red-600 fixed bottom-0 right-0" />
            </ConvexClientProvider>
          </QueryProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
