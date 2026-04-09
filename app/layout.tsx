import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConvexClientProvider } from "~/components/providers/ConvexClientProvider";
import { Toaster } from "~/components/ui/sonner";
import { QueryProvider } from "~/providers/react-query";
import "./globals.css";
import { bodyFont, condensedFont, displayFont } from "~/styles/font";

export const metadata: Metadata = {
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
              {children}
            </ConvexClientProvider>
          </QueryProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
