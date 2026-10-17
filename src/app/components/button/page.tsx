import { installCommand, isLocalRegistry, registryOrigin } from "@/catalog/registry-address";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { getComponentDetails } from "@/catalog/data";
import { CodeBlock } from "@/components/catalog/code-block";
import { ButtonAsyncExample } from "@/examples/button-async-example";
import { ButtonBehaviorExample } from "@/examples/button-behavior";
import { ButtonExamples } from "@/examples/button-examples";
import { SpinnerExample } from "@/examples/spinner-example";
import { ButtonPreview } from "@/components/catalog/button-preview";

async function getButtonDetails() {
  const details = await getComponentDetails("button");
  if (!details) throw new Error("The Button registry item is missing.");
  const examples = await Promise.all([
    "button-examples", "button-async-example", "button-behavior", "spinner-example",
  ].map(async (name) => ({
    name: `src/examples/${name}.tsx`,
    code: await readFile(path.join(process.cwd(), `src/examples/${name}.tsx`), "utf8"),
  })));
  return { ...details, sources: [...details.sources, ...examples] };
}

function Code({ children }: { children: string }) {
  return <CodeBlock code={children} />;
}

export default async function ButtonPage() {
  const { item, sources } = await getButtonDetails();
  const packageDeps = item.dependencies?.join(", ") || "None";
  const registryDeps = item.registryDependencies?.map((dependency) => dependency.split("/").at(-1)?.replace(/\.json$/, "")).join(", ") || "None";

  return (
    <div className="min-w-0 space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Components / Button</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{item.title}</h1>
        <p className="max-w-2xl text-muted-foreground">{item.description}</p>
      </header>

      <section aria-labelledby="preview-title" className="space-y-5">
        <div><h2 id="preview-title" className="text-xl font-semibold">Preview</h2><p className="mt-1 text-sm text-muted-foreground">Adjust the controls to see the matching component and usage code.</p></div>
        <ButtonPreview />
      </section>

      <section aria-labelledby="examples-title" className="space-y-6 border-t border-border pt-8">
        <div><h2 id="examples-title" className="text-xl font-semibold">Examples</h2><p className="mt-1 text-sm text-muted-foreground">Styles, sizes, interaction effects, and semantic usage.</p></div>
        <ButtonExamples />
        <div className="space-y-3"><h3 className="font-medium">Application-controlled async form</h3><p className="text-sm text-muted-foreground">The application owns the pending work and communicates its result outside the Button.</p><ButtonAsyncExample /></div>
        <div className="space-y-3"><h3 className="font-medium">Native events</h3><p className="text-sm text-muted-foreground">Try native action, form submission, ref focus, prevented activation, and application-owned loading behavior.</p><ButtonBehaviorExample /></div>
      </section>

      <section aria-labelledby="spinner-title" className="space-y-4 border-t border-border pt-8">
        <div><h2 id="spinner-title" className="text-xl font-semibold">Spinner</h2><p className="mt-1 text-sm text-muted-foreground">The Button uses this same reusable indicator while loading. Standalone use includes a polite status label.</p></div>
        <SpinnerExample />
      </section>

      <section id="installation" aria-labelledby="installation-title" className="space-y-6 border-t border-border pt-8">
        <div><h2 id="installation-title" className="text-xl font-semibold">Installation</h2><p className="mt-1 text-sm text-muted-foreground">Install the maintained source into a React project with shadcn configured.</p></div>
        <p className="text-sm text-muted-foreground">Prepare your project with the <Link className="underline underline-offset-4" href="/getting-started/nextjs">Next.js setup</Link> or <Link className="underline underline-offset-4" href="/getting-started/vite">Vite setup</Link>, and follow the <Link className="underline underline-offset-4" href="/getting-started/theme">shared theme guide</Link>. Registry origin: <code>{registryOrigin}</code>.{isLocalRegistry && " These commands use the local development registry; public addressing is pending."}</p>
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
          <div className="min-w-0 space-y-3"><h3 className="font-medium">Next.js App Router</h3><ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground"><li>Use React, TypeScript, Tailwind CSS 4, and the Base UI shadcn style.</li><li>In <code>components.json</code>, set <code>style</code> to <code>base-nova</code> and aliases <code>components</code>: <code>@/components</code>, <code>ui</code>: <code>@/components/ui</code>, <code>lib</code>: <code>@/lib</code>, and <code>utils</code>: <code>@/lib/utils</code>.</li><li>Put any module that calls <code>buttonVariants</code> behind a <code>&quot;use client&quot;</code> boundary; the helper is exported from the client Button module.</li>{isLocalRegistry && <li>Start this catalog at <code>{registryOrigin}</code> and keep it running while installing.</li>}<li>Run this command from your app&apos;s project root.</li></ol><Code>{installCommand("button")}</Code></div>
          <div className="min-w-0 space-y-3"><h3 className="font-medium">Vite React</h3><ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground"><li>Use React, TypeScript, Tailwind CSS 4 with the Vite plugin, and the Base UI shadcn style.</li><li>Configure the <code>@</code> alias to <code>src</code> in Vite and TypeScript, and matching shadcn aliases for the component and utility folders.</li>{isLocalRegistry && <li>Start this catalog at <code>{registryOrigin}</code> and keep it running while installing.</li>}<li>Run the same command from your app&apos;s project root.</li></ol><Code>{installCommand("button")}</Code></div>
        </div>
        <div className="min-w-0 space-y-3"><h3 className="font-medium">Global styles and theme</h3><p className="text-sm text-muted-foreground">Import the installed stylesheet once after Tailwind in your app&apos;s global CSS. In Next.js, edit <code>src/app/globals.css</code>; in Vite, edit <code>src/index.css</code>.</p><div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2"><div className="min-w-0"><p className="mb-2 text-sm font-medium">Next.js · src/app/globals.css</p><Code>{'@import "tailwindcss";\n@import "../components/ui/library.css";'}</Code></div><div className="min-w-0"><p className="mb-2 text-sm font-medium">Vite · src/index.css</p><Code>{'@import "tailwindcss";\n@import "./components/ui/library.css";'}</Code></div></div><p className="text-sm text-muted-foreground">Your app owns appearance switching and persistence: add or remove <code>.dark</code> on its theme root. Override shared color, font, and radius variables after the imports; load any custom font yourself and set <code>--font-sans</code> to its family.</p><Code>{':root { --primary: #303846; --font-sans: "Brand Sans", sans-serif; --radius: 0.75rem; }\n.dark { --background: #101418; --foreground: #f4f6f8; }'}</Code></div>
        <div className="space-y-2"><h3 className="font-medium">Dependencies</h3><p className="text-sm text-muted-foreground">Packages: {packageDeps}. Related registry items: {registryDeps}.</p></div>
      </section>

      <section aria-labelledby="source-title" className="space-y-5 border-t border-border pt-8">
        <div><h2 id="source-title" className="text-xl font-semibold">Full source</h2><p className="mt-1 text-sm text-muted-foreground">Read directly from maintained files; generated registry output is built from these sources.</p></div>
        {sources.map(({ name, code }) => <details key={name} className="min-w-0 rounded-lg border border-border"><summary className="cursor-pointer break-all px-4 py-3 font-medium">{name}</summary><CodeBlock code={code} label={name} /></details>)}
      </section>
    </div>
  );
}
