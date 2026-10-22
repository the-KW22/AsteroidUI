"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { setupLinks } from "@/site/guides/setup-content";
import styles from "./getting-started.module.css";

const shortLabels: Record<string, string> = {
  "/getting-started": "Overview",
  "/getting-started/nextjs": "Next.js",
  "/getting-started/vite": "Vite",
  "/getting-started/theme": "Theme",
};

export function GuideNavigation() {
  const pathname = usePathname();
  return <nav className={styles.navigation} aria-label="Getting Started guides">
    <p>Guide index</p>
    <ul>{setupLinks.map(item => <li key={item.href} data-active={pathname === item.href}><Link href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{shortLabels[item.href]}</Link></li>)}</ul>
    <Link className={styles.allComponents} href="/components">Browse Particles</Link>
  </nav>;
}
