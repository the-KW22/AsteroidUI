import Link from "next/link";
import styles from "@/site/support/support-page.module.css";

export default function NotFound() {
  return <main className={styles.page}>
    <div className={`${styles.frame} ${styles.errorFrame}`}>
      <div className={styles.intro}>
        <h1>Page not found</h1>
        <p>This page may have moved, or the address may be incorrect. Explore the available Particles or return home.</p>
        <div className={styles.links}><Link className={styles.primaryLink} href="/components">Explore components</Link><Link className={styles.secondaryLink} href="/">Back home</Link></div>
      </div>
    </div>
  </main>;
}
