"use client";

import Link from "next/link";
import styles from "@/site/support/support-page.module.css";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className={styles.page}>
    <div className={`${styles.frame} ${styles.errorFrame}`}>
      <div className={styles.intro}>
        <h1>We couldn&apos;t load this page</h1>
        <p>Something interrupted this page. Try again, or browse the available components.</p>
        <div className={styles.links}><button className={styles.retry} type="button" onClick={reset}>Try again</button><Link className={styles.secondaryLink} href="/components">Explore components</Link><Link className={styles.secondaryLink} href="/">Back home</Link></div>
      </div>
    </div>
  </main>;
}
