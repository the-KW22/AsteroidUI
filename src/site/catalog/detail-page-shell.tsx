import type { ReactNode } from "react";
import Link from "next/link";
import { DirectoryStars } from "./directory-stars";
import { DetailTimeline } from "./detail-timeline";
import styles from "./button-detail.module.css";

type Section = { id: string; label: string };

export function DetailPageShell({ title, description, action, sections, mainId, children }: {
  title: string;
  description: string;
  action: ReactNode;
  sections: Section[];
  mainId: string;
  children: ReactNode;
}) {
  return <div className={styles.page}>
    <DirectoryStars />
    <div className={styles.layout}>
      <main id={mainId} tabIndex={-1} className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/components">Components</Link><span>/</span><Link href="/components">Particles</Link><span>/</span><span aria-current="page">{title}</span></nav>
        <div className={styles.intro}><div><h1>{title}<span>.</span></h1><p>{description}</p></div>{action}</div>
        {children}
      </main>
      <DetailTimeline sections={sections} />
    </div>
    <footer className={styles.footer}><span>Editable React components. Yours to build with.</span><Link href="/license">MIT licensed</Link></footer>
  </div>;
}
