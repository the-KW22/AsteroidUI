"use client";

import { useState } from "react";
import Link from "next/link";
import type { CatalogItem } from "@/site/catalog/data";
import { getUsage, type CatalogOptions } from "@/site/catalog/detail-content";
import { AgentCopyMenu } from "./agent-copy-menu";
import { CodeBlock } from "./code-block";
import { DetailPageShell } from "./detail-page-shell";
import { TextareaStates } from "./demos";
import { ParticleWorkbench } from "./particle-workbench";
import { ChoicesExample } from "@/site/examples/choices-example";
import { FieldsExample } from "@/site/examples/fields-example";
import { SelectExample } from "@/site/examples/select-example";
import { SpinnerExample } from "@/site/examples/spinner-example";
import { ParticleContract } from "./particle-contract";
import styles from "./button-detail.module.css";
import detailStyles from "./generic-detail.module.css";

const componentLabels: Record<string, string> = {
  input: "Input", textarea: "Textarea", label: "Label", checkbox: "Checkbox",
  "radio-group": "Radio group", select: "Select", switch: "Switch", spinner: "Spinner",
};

const sections = [
  { id: "preview", label: "Preview" },
  { id: "api", label: "Contract" },
  { id: "usage", label: "Usage" },
  { id: "installation", label: "Installation" },
];

function MaintainedExamples({ slug }: { slug: string }) {
  if (["input", "textarea", "label"].includes(slug)) return <FieldsExample />;
  if (["checkbox", "radio-group", "switch"].includes(slug)) return <ChoicesExample />;
  if (slug === "select") return <SelectExample />;
  return <SpinnerExample />;
}

type ComponentDetailClientProps = {
  item: CatalogItem;
  initialOptions: CatalogOptions;
  registryOrigin: string;
  isLocalRegistry: boolean;
  install: string;
  companionInstalls: { slug: string; command: string }[];
  registryDependencies: string;
  brief: { plainText: string; markdown: string };
  content: { note: string; exampleNote: string; exampleSlugs: string[] };
};

export function ComponentDetailClient({ item, initialOptions, registryOrigin, isLocalRegistry, install, companionInstalls, registryDependencies, brief, content }: ComponentDetailClientProps) {
  const [options, setOptions] = useState<CatalogOptions>(() => ({ ...initialOptions }));
  const usage = getUsage(item.slug, options);
  if (!usage) throw new Error(`Missing usage content for ${item.slug}`);

  return <DetailPageShell title={item.title} description={item.description} mainId="catalog-content" action={<AgentCopyMenu plainText={brief.plainText} markdown={brief.markdown} />} sections={sections}>
    <ParticleWorkbench slug={item.slug} options={options} onOptionChange={(key, value) => setOptions(current => ({ ...current, [key]: value }))} />

    <ParticleContract slug={item.slug} note={content.note} exampleNote={content.exampleNote}>
      <details className={detailStyles.states}>
        <summary>Explore examples and states</summary>
        <div className={detailStyles.statesBody}>
          {item.slug === "textarea" && <TextareaStates />}
          <MaintainedExamples slug={item.slug} />
          <p>These examples compose related components for state and form demonstrations. {content.exampleSlugs.map((slug, index) => <span key={slug}>{index > 0 ? ", " : ""}<Link href={`/components/${slug}`}>{componentLabels[slug]}</Link></span>)} can be installed from their own detail pages.</p>
        </div>
      </details>
    </ParticleContract>

    <section id="usage" className={styles.usageSection} aria-labelledby="usage-title">
      <div><h2 id="usage-title">Take the code.</h2><p>Copy a working starting point.</p></div>
      <CodeBlock code={usage} label={`${item.title} usage`} />
    </section>

    <section id="installation" className={`${styles.section} ${detailStyles.install}`} aria-labelledby="installation-title">
      <div className={styles.sectionIntro}><h2 id="installation-title">Install it.</h2><p>Bring the maintained {item.title} into your project.</p></div>
      <CodeBlock code={install} label="Install command" />
      <p>Run from your project root after following the <Link href="/getting-started/nextjs">Next.js guide</Link> or <Link href="/getting-started/vite">Vite guide</Link> and importing the <Link href="/getting-started/theme">shared stylesheet</Link>.{isLocalRegistry && <> Keep the local registry at <code>{registryOrigin}</code> running.</>}</p>
      {companionInstalls.length > 0 && <div className={detailStyles.companions}><h3>Usage companions</h3><p>The example above imports these separately installable components:</p>{companionInstalls.map(({ slug, command }) => <div key={slug}><Link href={`/components/${slug}`}>{componentLabels[slug]}</Link><CodeBlock code={command} label={`Install ${componentLabels[slug]}`} /></div>)}</div>}
      <p>Packages: {item.dependencies.join(", ") || "None"}. Related registry items: {registryDependencies}.</p>
    </section>
  </DetailPageShell>;
}
