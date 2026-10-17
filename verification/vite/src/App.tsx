import { useRef, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "./components/ui/button";
import { Spinner } from "./components/ui/spinner";
import { CollectionExample } from "./components/collection-example";

export default function App() {
  const actionRef = useRef<HTMLButtonElement>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [actions, setActions] = useState(0);
  const [submissions, setSubmissions] = useState(0);
  const [iconSaving, setIconSaving] = useState(false);

  function toggleAppearance(dark: boolean) {
    document.documentElement.classList.toggle("dark", dark);
  }

  function customizeTheme() {
    const root = document.documentElement;
    root.style.setProperty("--primary", "#123456");
    root.style.setProperty("--primary-foreground", "#ffffff");
    root.style.setProperty("--font-sans", "monospace");
    root.style.setProperty("--radius", "20px");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 bg-background px-6 py-12 font-sans text-foreground">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Vite React consumer</p>
        <h1 className="text-3xl font-semibold tracking-tight">Installed Button and Spinner</h1>
        <p className="text-muted-foreground">Installed from the local registry. Try native keyboard activation with Tab, Enter, and Space.</p>
      </header>

      <section aria-labelledby="installed-title" className="space-y-4">
        <h2 id="installed-title" className="text-lg font-semibold">Button behavior</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button ref={actionRef} animation="press" onClick={() => setActions((count) => count + 1)}>Record action</Button>
          <button type="button" className="rounded-md border border-border px-3 py-2 text-sm" onClick={() => actionRef.current?.focus()}>Focus action ref</button>
          <span data-testid="installed-count" className="text-sm">{actions}</span>
        </div>
        <form className="flex flex-wrap items-center gap-3" onSubmit={(event) => { event.preventDefault(); setSubmissions((count) => count + 1); }}>
          <Button onClick={() => setStatus("Default button acted")}>Default action</Button>
          <Button type="submit">Submit form</Button>
          <span className="text-sm">Form submissions: {submissions}</span>
        </form>
        <div className="flex flex-wrap items-center gap-3">
          <Button data-testid="installed-button" loading={saving} loadingLabel="Saving" onClick={() => { setActions((count) => count + 1); setSaving(true); setStatus("Saving") }}>Save changes</Button>
          <button type="button" className="rounded-md border border-border px-3 py-2 text-sm" onClick={() => { setSaving(false); setStatus("Saved") }}>Finish saving</button>
          <p data-testid="installed-status" role="status" aria-live="polite" className="text-sm">{status}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="icon" aria-label="Save favorite" loading={iconSaving} loadingLabel="Saving favorite" onClick={() => setIconSaving(true)}><Heart aria-hidden="true" /></Button>
          <button type="button" className="rounded-md border border-border px-3 py-2 text-sm" onClick={() => setIconSaving(false)}>Finish icon save</button>
        </div>
      </section>

      <section aria-labelledby="spinner-title" className="space-y-4">
        <h2 id="spinner-title" className="text-lg font-semibold">Standalone Spinner</h2>
        <div data-testid="installed-spinner"><Spinner label="Loading preview" /></div>
      </section>

      <section aria-labelledby="theme-title" className="space-y-4">
        <h2 id="theme-title" className="text-lg font-semibold">Consumer theme ownership</h2>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" aria-label="Dark appearance" onChange={(event) => toggleAppearance(event.target.checked)} />Dark appearance</label>
          <button type="button" onClick={customizeTheme} className="rounded-md border border-border px-3 py-2 text-sm">Customize theme</button>
        </div>
      </section>
      <CollectionExample />
    </main>
  )
}
