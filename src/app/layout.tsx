import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Infiny board — Infinite Canvas Bookmarks",
  description:
    "An infinite canvas for bookmarking and organizing anything — notes, links, images, quotes, videos, and files. Your personal creative pinboard.",
  keywords: ["bookmarks", "infinite canvas", "notes", "organization", "pinboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
