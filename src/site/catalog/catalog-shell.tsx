import type { ReactNode } from "react";
import Link from "next/link";
import { getCatalogItems } from "@/site/catalog/data";
import { CatalogNavigation } from "@/site/catalog/catalog-navigation";
import { CatalogRouteBoundary } from "./catalog-route-boundary";

export function CatalogShell({ children }: { children: ReactNode }) {
  return <CatalogRouteBoundary legacy={<LegacyCatalogShell>{children}</LegacyCatalogShell>}>{children}</CatalogRouteBoundary>;
}

export function LegacyCatalogShell({ children }: { children: ReactNode }) {
  const items = getCatalogItems();
  return (
    <div className="min-h-screen">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12 lg:py-10">
        <CatalogNavigation items={items} />
        <main id="catalog-content" tabIndex={-1} className="min-w-0 focus:outline-none">{children}</main>
      </div>
      <footer className="mx-auto flex w-full max-w-7xl flex-wrap gap-5 px-5 py-6 text-sm sm:px-8">
        <a href="https://github.com/the-KW22/AsteroidUI" className="underline underline-offset-4">GitHub source</a>
        <Link href="/license" className="underline underline-offset-4">MIT License</Link>
      </footer>
    </div>
  );
}
