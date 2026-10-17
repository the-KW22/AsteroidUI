import Link from "next/link";
import { ThemeSelect } from "@/components/catalog/theme-select";
import { FieldsExample } from "@/examples/fields-example";
import { ChoicesExample } from "@/examples/choices-example";
import { SelectExample } from "@/examples/select-example";
import { CollectionExample } from "@/examples/collection-example";

export default function CollectionPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-5 py-8 sm:px-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4"><Link href="/" className="text-sm underline underline-offset-4">AsteroidUI</Link><ThemeSelect /></div>
        <h1 className="text-3xl font-semibold tracking-tight">Collection examples</h1>
        <p className="text-muted-foreground">Form controls, states, and a composition example for the selected collection.</p>
      </header>
      <FieldsExample />
      <ChoicesExample />
      <SelectExample />
      <CollectionExample />
    </main>
  );
}
