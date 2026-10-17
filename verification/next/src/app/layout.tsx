import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js consumer fixture",
  description: "A clean Next.js consumer foundation for registry verification.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
