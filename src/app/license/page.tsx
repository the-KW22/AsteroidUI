import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/site/support/support-page.module.css";

export const metadata: Metadata = { title: "MIT License | AsteroidUI", description: "Read the AsteroidUI MIT License and distributed third-party notices." };

export default async function LicensePage() {
  const license = await readFile(path.join(process.cwd(), "LICENSE"), "utf8");
  const notices = await readFile(path.join(process.cwd(), "THIRD_PARTY_NOTICES.md"), "utf8");
  return (
    <main className={styles.page}>
      <div className={styles.frame}>
        <header className={styles.intro}>
          <h1>MIT License</h1>
          <p>AsteroidUI source includes this license and the third-party notices distributed with the collection.</p>
          <div className={styles.links}><a className={styles.secondaryLink} href="#third-party-notices">Third-party notices</a><a className={styles.secondaryLink} href="https://github.com/the-KW22/AsteroidUI">Source on GitHub</a><Link className={styles.secondaryLink} href="/components">Browse Particles</Link></div>
        </header>
        <div className={styles.reading}>
          <section aria-labelledby="license-text"><h2 id="license-text">AsteroidUI license</h2><pre>{license}</pre></section>
          <section aria-labelledby="third-party-notices"><h2 id="third-party-notices">Third-party notices</h2><p>These notices accompany the installed source. GSAP uses its own license; review the terms before using Button motion.</p><div className={styles.noticeText} role="region" aria-label="Third-party notices text" tabIndex={0}>{notices}</div></section>
        </div>
      </div>
    </main>
  );
}
