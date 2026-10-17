import { installCommand, isLocalRegistry, registryOrigin } from "@/catalog/registry-address";
import Link from "next/link";
import type { CatalogItem } from "@/catalog/data";
import { getDetailContent } from "@/catalog/detail-content";
import { CodeBlock } from "@/components/catalog/code-block";
import { CatalogDemo, TextareaStates } from "@/components/catalog/demos";
import { ChoicesExample } from "@/examples/choices-example";
import { FieldsExample } from "@/examples/fields-example";
import { SelectExample } from "@/examples/select-example";
import { SpinnerExample } from "@/examples/spinner-example";

const componentLabels: Record<string, string> = {
  input: "Input", textarea: "Textarea", label: "Label", checkbox: "Checkbox",
  "radio-group": "Radio group", select: "Select", switch: "Switch", spinner: "Spinner",
};

function MaintainedExamples({ slug }: { slug: string }) {
  if (["input", "textarea", "label"].includes(slug)) return <FieldsExample />;
  if (["checkbox", "radio-group", "switch"].includes(slug)) return <ChoicesExample />;
  if (slug === "select") return <SelectExample />;
  return <SpinnerExample />;
}

export function ComponentDetail({ item, sources, exampleSource }: { item: CatalogItem; sources: { name: string; code: string }[]; exampleSource: { name: string; code: string } }) {
  const content = getDetailContent(item.slug);
  if (!content) throw new Error(`Missing detail content for ${item.slug}`);
  const install = installCommand(item.slug);
  const companionInstalls = content.companions.map((slug) => ({ slug, command: installCommand(slug) }));
  const registryDependencies = item.registryDependencies.map((dependency) => dependency.split("/").at(-1)?.replace(/\.json$/, "")).join(", ") || "None";
  return <article className="min-w-0 space-y-10">
    <header className="space-y-3"><p className="text-sm text-muted-foreground">Components / {item.title}</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{item.title}</h1><p className="max-w-2xl text-muted-foreground">{item.description}</p></header>
    <section aria-labelledby="detail-preview"><h2 id="detail-preview" className="mb-4 text-xl font-semibold">Preview</h2><CatalogDemo slug={item.slug} /><p className="mt-3 text-sm text-muted-foreground">{content.note}</p></section>
    <section aria-labelledby="detail-examples" className="space-y-4 border-t border-border pt-8"><h2 id="detail-examples" className="text-xl font-semibold">Examples and states</h2><p className="text-sm text-muted-foreground">{content.exampleNote}</p>{item.slug === "textarea" && <TextareaStates />}<MaintainedExamples slug={item.slug} /><p className="text-sm text-muted-foreground">Example component sources: {content.exampleSlugs.map((slug, index) => <span key={slug}>{index > 0 ? ", " : ""}<Link className="underline underline-offset-4" href={`/components/${slug}`}>{componentLabels[slug]}</Link></span>)}. These maintained examples compose related components for state and form demonstrations. Each linked component can be installed from its detail page.</p></section>
    <section aria-labelledby="detail-usage" className="space-y-4 border-t border-border pt-8"><h2 id="detail-usage" className="text-xl font-semibold">Usage</h2><CodeBlock code={content.usage} label={`${item.title} usage`} /></section>
    <section id="installation" aria-labelledby="detail-install" className="space-y-5 border-t border-border pt-8"><h2 id="detail-install" className="text-xl font-semibold">Installation</h2><p className="text-sm text-muted-foreground">Registry origin: <code>{registryOrigin}</code>. Run this from your project root.{isLocalRegistry && " Start the local catalog first; public registry availability is pending."}</p><CodeBlock code={install} label="Install command" />{companionInstalls.length > 0 && <div className="space-y-3"><h3 className="font-medium">Usage companions</h3><p className="text-sm text-muted-foreground">The copyable usage imports these additional components. Install each companion from the same registry:</p>{companionInstalls.map(({ slug, command }) => <div key={slug} className="space-y-2"><Link href={`/components/${slug}`} className="text-sm underline underline-offset-4">{componentLabels[slug]}</Link><CodeBlock code={command} label={`Install ${componentLabels[slug]}`} /></div>)}</div>}<div className="flex flex-wrap gap-4 text-sm"><Link className="underline underline-offset-4" href="/getting-started/nextjs">Next.js setup</Link><Link className="underline underline-offset-4" href="/getting-started/vite">Vite setup</Link><Link className="underline underline-offset-4" href="/getting-started/theme">Theme setup</Link></div><p className="text-sm text-muted-foreground">Packages: {item.dependencies.join(", ") || "None"}. Related registry items: {registryDependencies}.</p></section>
    <section aria-labelledby="detail-source" className="space-y-4 border-t border-border pt-8"><h2 id="detail-source" className="text-xl font-semibold">Maintained source</h2>{[...sources, exampleSource].map(({ name, code }) => <details key={name} className="min-w-0"><summary className="cursor-pointer break-all rounded-lg border border-border px-4 py-3 font-medium">{name}</summary><div className="mt-2"><CodeBlock code={code} label={name} /></div></details>)}</section>
  </article>;
}
