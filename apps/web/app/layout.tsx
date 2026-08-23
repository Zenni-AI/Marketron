import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marketron",
  description: "Raw job footage in, branded ad-ready videos out.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <nav className="topbar">
          <Link href="/" className="brand">
            Marketron
          </Link>
          <Link href="/jobs/new">New job</Link>
          <Link href="/library">Library</Link>
          <Link href="/queue">Review queue</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
