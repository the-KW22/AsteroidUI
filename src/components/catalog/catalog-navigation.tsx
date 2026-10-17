"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CatalogItem } from "@/catalog/data";

export function CatalogNavigation({ items }: { items: CatalogItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const links = items.map((item) => {
    const href = `/components/${item.slug}`;
    const current = pathname === href;
    return <li key={item.slug}><Link href={href} aria-current={current ? "page" : undefined} onClick={() => setOpen(false)} className={`block rounded-md px-3 py-2 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${current ? "bg-accent font-medium text-foreground" : "text-muted-foreground"}`}>{item.title}</Link></li>;
  });

  return (
    <nav aria-label="Component navigation" className="min-w-0">
      <button ref={trigger} type="button" aria-expanded={open} aria-controls="component-navigation-list" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between rounded-md border border-border bg-card px-4 py-3 text-left font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden">
        Components <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div id="component-navigation-list" className={`${open ? "block" : "hidden"} mt-2 rounded-lg border border-border bg-card p-2 lg:mt-0 lg:block lg:border-0 lg:bg-transparent lg:p-0`}>
        <h2 className="mb-2 hidden px-3 text-sm font-semibold lg:block">Components</h2>
        <ul className="space-y-1">{links}</ul>
      </div>
    </nav>
  );
}
