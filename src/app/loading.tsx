import styles from "@/site/support/support-page.module.css";

export default function Loading() {
  return <main className={styles.page}>
    <div className={`${styles.frame} ${styles.errorFrame}`}>
      <div className={styles.intro}>
        <h1>Loading page</h1>
        <p>The next page is on its way.</p>
      </div>
      <div className={styles.loadingPanel} role="status" aria-label="Loading page">
        <p>Preparing content…</p><div className={styles.loadingLine} aria-hidden="true" /><div className={styles.loadingLine} aria-hidden="true" />
      </div>
    </div>
  </main>;
}
