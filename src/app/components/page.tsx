import Link from "next/link";
import { getCatalogItems } from "@/catalog/data";

export default function ComponentsPage() {
  const items = getCatalogItems();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">AsteroidUI</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Components</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Browse the collection and open a component to try its preview and see how to use it.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.slug}>
            <Link className="block h-full rounded-lg border border-border bg-card p-5 text-card-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href={`/components/${item.slug}`}>
              <span className="font-medium">{item.title}</span>
              <span className="mt-2 block text-sm text-muted-foreground">{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
