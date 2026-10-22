import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/site/shell/theme-provider";
import { SiteHeader } from "@/site/shell/site-header";
import { SmoothScroll } from "@/site/shell/smooth-scroll";
import "lenis/dist/lenis.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "AsteroidUI",
  description: "A cohesive collection of reusable interface components."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider><SmoothScroll /><SiteHeader /><div id="main-content" tabIndex={-1} className="focus:outline-none">{children}</div></ThemeProvider>
      </body>
    </html>
  );
}
