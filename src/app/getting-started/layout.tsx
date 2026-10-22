import type { ReactNode } from "react";
import Link from "next/link";
import { CatalogShell } from "@/site/catalog/catalog-shell";
import { DirectoryStars } from "@/site/catalog/directory-stars";
import { GuideNavigation } from "@/site/guides/guide-navigation";
import pageStyles from "@/site/catalog/button-detail.module.css";
import styles from "@/site/guides/getting-started.module.css";

export default function GettingStartedLayout({ children }: { children: ReactNode }) {
  return <CatalogShell><div className={pageStyles.page} data-guide-page>
    <DirectoryStars />
    <div className={styles.frame}>
      <GuideNavigation />
      <main id="catalog-content" tabIndex={-1} className={styles.main}>{children}</main>
    </div>
    <footer className={pageStyles.footer}><span>Editable React components. Yours to build with.</span><Link href="/license">MIT licensed</Link></footer>
  </div></CatalogShell>;
}
