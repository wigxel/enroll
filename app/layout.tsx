import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { ConvexClientProvider } from "~/components/providers/ConvexClientProvider";
import { Toaster } from "~/components/ui/sonner";
import { QueryProvider } from "~/providers/react-query";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Enroll — Launch Your Tech Career",
  description:
    "Browse programs, apply online, and join a community of graduates building the future of technology.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <QueryProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </QueryProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
