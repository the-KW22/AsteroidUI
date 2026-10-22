import { FieldsExample } from "@/site/examples/fields-example";
import { ChoicesExample } from "@/site/examples/choices-example";
import { SelectExample } from "@/site/examples/select-example";
import { CollectionExample } from "@/site/examples/collection-example";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/site/support/support-page.module.css";

export const metadata: Metadata = { title: "Collection examples | AsteroidUI", description: "Try the nine AsteroidUI Particles together in a working form." };

export default function CollectionPage() {
  return (
    <main className={styles.collectionPage}>
      <div className={styles.collectionFrame}>
        <header className={styles.intro}>
          <h1>Collection examples</h1>
          <p>Try the nine Particles together: native fields and choices, a Select, and a form that serializes their values.</p>
          <div className={styles.links}><Link className={styles.secondaryLink} href="/components">Browse Particles</Link></div>
        </header>
        <div className={styles.exampleSurface}>
          <CollectionExample />
          <FieldsExample />
          <ChoicesExample />
          <SelectExample />
        </div>
      </div>
    </main>
  );
}
