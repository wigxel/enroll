import {
  Barlow_Condensed,
  Figtree,
  Geist,
  Geist_Mono,
  GFS_Didot,
} from "next/font/google";

export const bodyFont = Figtree({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const condensedFont = Barlow_Condensed({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-cnd",
});

export const displayFont = GFS_Didot({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-display",
});

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
