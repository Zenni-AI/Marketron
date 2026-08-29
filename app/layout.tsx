import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JVS Painting Inc.",
  description:
    "Commercial and government contract painting contractors serving New Jersey for over 40 years.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/*
        Typography is system-stack only (Georgia display / Arial UI), so there is
        no webfont round-trip and no font-swap layout shift.
      */}
      <body className="bg-offWhite font-sans text-steel antialiased">
        {children}
      </body>
    </html>
  );
}
