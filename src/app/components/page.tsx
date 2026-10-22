import { getCatalogItems } from "@/site/catalog/data";
import { ComponentDirectory } from "@/site/catalog/component-directory";

export default function ComponentsPage() {
  const items = getCatalogItems()
    .map(({ slug, title }) => ({ slug, title }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return <ComponentDirectory items={items} />;
}
