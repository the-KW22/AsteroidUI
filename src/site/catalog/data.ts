import { readFile } from "node:fs/promises";
import path from "node:path";
import registry from "../../../registry.json";
import { catalogComponents } from "./components";

type RegistryItem = {
  name: string;
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: { path: string }[];
};

export type CatalogItem = {
  slug: string;
  title: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
};

const registryItems: RegistryItem[] = registry.items;

export function getCatalogItems(): CatalogItem[] {
  return catalogComponents.map(({ slug }) => {
    const item = registryItems.find((entry) => entry.name === slug);
    if (!item) throw new Error(`Missing registry item: ${slug}`);
    return {
      slug,
      title: item.title,
      description: item.description,
      dependencies: item.dependencies ?? [],
      registryDependencies: item.registryDependencies ?? [],
    };
  });
}

export async function getComponentDetails(slug: string) {
  const item = getCatalogItems().find((entry) => entry.slug === slug);
  if (!item) return undefined;
  const sourcePaths = new Set<string>();
  const visited = new Set<string>();
  function collect(name: string) {
    if (visited.has(name)) return;
    visited.add(name);
    const entry = registryItems.find((candidate) => candidate.name === name);
    if (!entry) throw new Error(`Missing registry dependency: ${name}`);
    for (const file of entry.files) sourcePaths.add(file.path);
    for (const dependency of entry.registryDependencies ?? []) {
      collect(dependency.split("/").at(-1)!.replace(/\.json$/, ""));
    }
  }
  collect(slug);
  const sources = await Promise.all([...sourcePaths].map(async (filePath) => ({
    name: filePath,
    code: await readFile(filePath === "LICENSE" ? path.join(process.cwd(), "LICENSE") : filePath === "THIRD_PARTY_NOTICES.md"
      ? path.join(process.cwd(), "THIRD_PARTY_NOTICES.md")
      : path.join(process.cwd(), "src", filePath.slice("src/".length)), "utf8"),
  })));
  return { item, sources };
}
