import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { catalogComponents } from "@/catalog/components";
import { getComponentDetails } from "@/catalog/data";
import { ComponentDetail } from "@/components/catalog/component-detail";

const detailSlugs = catalogComponents.map(({ slug }) => slug).filter((slug) => slug !== "button");
const examplePaths: Record<string, string> = {
  input: "src/examples/fields-example.tsx", textarea: "src/examples/fields-example.tsx", label: "src/examples/fields-example.tsx",
  checkbox: "src/examples/choices-example.tsx", "radio-group": "src/examples/choices-example.tsx", switch: "src/examples/choices-example.tsx",
  select: "src/examples/select-example.tsx", spinner: "src/examples/spinner-example.tsx",
};

export function generateStaticParams() {
  return detailSlugs.map((slug) => ({ slug }));
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!detailSlugs.includes(slug as (typeof detailSlugs)[number])) notFound();
  const details = await getComponentDetails(slug);
  if (!details) notFound();
  const examplePath = examplePaths[slug];
  if (!examplePath) notFound();
  const exampleSource = await readFile(path.join(process.cwd(), "src/examples", path.basename(examplePath)), "utf8");
  return <ComponentDetail {...details} exampleSource={{ name: examplePath, code: exampleSource }} />;
}
