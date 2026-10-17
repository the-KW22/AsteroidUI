import Link from "next/link";
import { ThemeSelect } from "@/components/catalog/theme-select";
import { ButtonAsyncExample } from "@/examples/button-async-example";
import { SpinnerExample } from "@/examples/spinner-example";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-12 px-6 py-10 sm:px-10 sm:py-16">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">AsteroidUI</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">A shared visual foundation</h1>
        </div>
        <ThemeSelect />
      </header>

      <section aria-labelledby="intro-title" className="max-w-2xl">
        <h2 id="intro-title" className="text-lg font-semibold">Components for your next interface</h2>
        <p className="mt-2 text-muted-foreground">Explore reusable React components, try live examples, and add the maintained source to your project.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="rounded-md border border-border bg-card px-4 py-3 font-medium text-card-foreground hover:bg-accent" href="/components">Browse catalog <span aria-hidden="true">→</span></Link>
          <Link className="rounded-md border border-border bg-card px-4 py-3 font-medium text-card-foreground hover:bg-accent" href="/getting-started">Getting Started <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section aria-label="Component examples" className="grid gap-4 sm:grid-cols-2">
        <div className="flex min-h-32 flex-col justify-between gap-4 rounded-md border border-border bg-card p-5 text-card-foreground">
          <p className="text-sm font-medium text-muted-foreground">Button · application controlled loading</p>
          <ButtonAsyncExample />
        </div>
        <div className="flex min-h-32 flex-col justify-between gap-4 rounded-md border border-border bg-card p-5 text-card-foreground">
          <p className="text-sm font-medium text-muted-foreground">Spinner · status feedback</p>
          <SpinnerExample />
        </div>
      </section>

      <section aria-labelledby="foundation-title" className="max-w-2xl">
        <h2 id="foundation-title" className="text-lg font-semibold">Theme tokens in use</h2>
        <p className="mt-2 text-muted-foreground">The catalog and reusable source share editable color, font, and radius settings.</p>
        <div className="mt-6 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Surface sample</p>
          <p className="mt-2 text-xl font-semibold">Readable by default</p>
          <p className="mt-2 text-sm text-muted-foreground">Change the shared values in <code>src/styles/library.css</code> to customize this sample.</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-md bg-primary px-3 py-2 text-primary-foreground">Primary surface</span>
            <span className="rounded-md border border-border bg-background px-3 py-2 text-foreground">Base surface</span>
          </div>
        </div>
      </section>
      <footer className="flex flex-wrap gap-5 text-sm">
        <a href="https://github.com/the-KW22/AsteroidUI" className="underline underline-offset-4">GitHub source</a>
        <Link href="/license" className="underline underline-offset-4">MIT License</Link>
      </footer>
    </main>
  );
}
