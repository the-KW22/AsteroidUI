import type { ReactNode } from "react";
import Link from "next/link";
import { getCatalogItems } from "@/catalog/data";
import { ThemeSelect } from "@/components/catalog/theme-select";
import { CatalogNavigation } from "@/components/catalog/catalog-navigation";

export function CatalogShell({ children }: { children: ReactNode }) {
  const items = getCatalogItems();
  return (
    <div className="min-h-screen">
      <a href="#catalog-content" className="sr-only rounded-md bg-background p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus-visible:outline-2 focus-visible:outline-ring">Skip to content</a>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-8">
        <Link href="/" className="font-semibold tracking-tight">AsteroidUI</Link>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/components" className="text-sm text-muted-foreground underline-offset-4 hover:underline">Components</Link>
          <Link href="/getting-started" className="text-sm text-muted-foreground underline-offset-4 hover:underline">Getting Started</Link>
          <ThemeSelect />
        </div>
      </header>
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
