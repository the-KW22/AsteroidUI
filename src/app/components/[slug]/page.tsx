import { notFound } from "next/navigation";
import { catalogComponents } from "@/site/catalog/components";
import { getCatalogItems } from "@/site/catalog/data";
import { ComponentDetail } from "@/site/catalog/component-detail";

const detailSlugs = catalogComponents.map(({ slug }) => slug).filter((slug) => slug !== "button");

export function generateStaticParams() {
  return detailSlugs.map((slug) => ({ slug }));
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!detailSlugs.includes(slug as (typeof detailSlugs)[number])) notFound();
  const item = getCatalogItems().find(entry => entry.slug === slug);
  if (!item) notFound();
  return <ComponentDetail item={item} />;
}
