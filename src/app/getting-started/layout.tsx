import type { ReactNode } from "react";
import { CatalogShell } from "@/components/catalog/catalog-shell";

export default function GettingStartedLayout({ children }: { children: ReactNode }) {
  return <CatalogShell>{children}</CatalogShell>;
}
