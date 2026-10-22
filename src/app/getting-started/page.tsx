import Link from "next/link";
import { setupLinks } from "@/site/guides/setup-content";
import { isLocalRegistry, registryOrigin } from "@/site/catalog/registry-address";

export default function GettingStartedPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Getting Started</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Install components in your app</h1>
        <p className="max-w-2xl text-muted-foreground">Choose the guide for your setup. These instructions install editable AsteroidUI component source into your project through the registry.</p>
      </header>
      <aside className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
        <h2 className="font-semibold">{isLocalRegistry ? "Local registry requirement" : "Registry address"}</h2>
        <p className="mt-2 text-muted-foreground">Registry origin: <code>{registryOrigin}</code>.{isLocalRegistry ? " Start the catalog and keep it running while you install. This address is for local development and is not a public registry URL." : " Use this origin for component installation."}</p>
      </aside>
      <section aria-labelledby="guide-title" className="space-y-4">
        <h2 id="guide-title" className="text-xl font-semibold">Choose a setup guide</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {setupLinks.slice(1).map((item) => <li key={item.href}><Link className="block rounded-lg border border-border p-4 font-medium underline underline-offset-4 hover:bg-muted/40" href={item.href}>{item.label}<span className="mt-1 block text-sm font-normal text-muted-foreground">Setup steps, commands, and import examples</span></Link></li>)}
        </ul>
      </section>
      <section aria-labelledby="install-title" className="space-y-3 border-t border-border pt-6">
        <h2 id="install-title" className="text-xl font-semibold">Install a component</h2>
        <p className="text-muted-foreground">Use the component&apos;s installation section for its exact command and dependencies.</p>
        <p><Link className="font-medium underline underline-offset-4" href="/components">Browse all components</Link> or start with <Link className="font-medium underline underline-offset-4" href="/components/button#installation">Button installation</Link>.</p>
      </section>
      <section aria-labelledby="pitfalls-title" className="space-y-3 border-t border-border pt-6">
        <h2 id="pitfalls-title" className="text-xl font-semibold">Installation troubleshooting</h2>
        <p className="text-muted-foreground">If a local item URL returns 404, confirm that this catalog is serving it. On Windows, a different server may own localhost&apos;s IPv6 address; setting <code>NODE_OPTIONS=--dns-result-order=ipv4first</code> before the CLI selects an IPv4 catalog server.</p>
        <p className="text-muted-foreground">For a batch of item URLs, add <code>--yes</code> to skip the CLI&apos;s component-library selection prompt. Import the installed stylesheet after Tailwind, and put variable overrides after both imports. Custom font URLs must point to an asset supplied by your application.</p>
      </section>
    </div>
  );
}
