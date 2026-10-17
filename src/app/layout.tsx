import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/catalog/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "AsteroidUI",
  description: "A cohesive collection of reusable interface components."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
