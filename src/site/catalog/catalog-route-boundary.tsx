"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Keep redesigned catalog routes from changing not-yet-redesigned destinations. */
export function CatalogRouteBoundary({ children, legacy }: { children: ReactNode; legacy: ReactNode }) {
  const pathname = usePathname();
  return pathname === "/components" || pathname.startsWith("/components/") || pathname === "/getting-started" || pathname.startsWith("/getting-started/") ? children : legacy;
}

export function DirectorySkipLink({ className }: { className: string }) {
  return <a className={className} href="#directory-content" onClick={event => {
    event.preventDefault();
    document.getElementById("directory-content")?.focus();
  }}>Skip to content</a>;
}
