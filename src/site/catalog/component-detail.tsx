import { installCommand, isLocalRegistry, registryOrigin } from "@/site/catalog/registry-address";
import type { CatalogItem } from "@/site/catalog/data";
import { defaultCatalogOptions, getDetailContent } from "@/site/catalog/detail-content";
import { ComponentDetailClient } from "./component-detail-client";

export function ComponentDetail({ item }: { item: CatalogItem }) {
  const content = getDetailContent(item.slug);
  if (!content) throw new Error(`Missing detail content for ${item.slug}`);
  const install = installCommand(item.slug);
  const companionInstalls = content.companions.map(slug => ({ slug, command: installCommand(slug) }));
  const registryDependencies = item.registryDependencies.map(dependency => dependency.split("/").at(-1)?.replace(/\.json$/, "")).join(", ") || "None";
  const companionNote = companionInstalls.length ? `Usage companions: ${companionInstalls.map(({ slug, command }) => `${slug} (${command})`).join(", ")}.` : "";
  const localNote = isLocalRegistry ? `Keep the local registry at ${registryOrigin} running during installation.` : "";
  const plainText = `Install AsteroidUI ${item.title} in my project.\n\nFollow the setup guide for my framework: ${registryOrigin}/getting-started/nextjs or ${registryOrigin}/getting-started/vite. Import the shared stylesheet using ${registryOrigin}/getting-started/theme.\n${localNote}\nRun from the project root: ${install}\n${companionNote}\nPackages: ${item.dependencies.join(", ") || "None"}. Related registry items: ${registryDependencies}.\n\nBehavior and customization: ${content.note} ${content.exampleNote}\n\nUse the installed component from @/components/ui/${item.slug}. Ask me which supported options to use if unspecified.`;
  const markdown = `# Install AsteroidUI ${item.title}\n\nFollow the [Next.js guide](${registryOrigin}/getting-started/nextjs) or the [Vite guide](${registryOrigin}/getting-started/vite), and import the [shared stylesheet](${registryOrigin}/getting-started/theme).\n\n${localNote ? `${localNote}\n\n` : ""}Run from the project root:\n\n\`\`\`sh\n${install}\n\`\`\`\n\n${companionNote ? `${companionNote}\n\n` : ""}Packages: ${item.dependencies.join(", ") || "None"}. Related registry items: ${registryDependencies}.\n\n## Behavior and customization\n\n${content.note} ${content.exampleNote}\n\nUse the installed component from \`@/components/ui/${item.slug}\`. Ask me which supported options to use if unspecified.`;

  return <ComponentDetailClient
    key={item.slug}
    item={item}
    initialOptions={defaultCatalogOptions[item.slug]}
    registryOrigin={registryOrigin}
    isLocalRegistry={isLocalRegistry}
    install={install}
    companionInstalls={companionInstalls}
    registryDependencies={registryDependencies}
    brief={{ plainText, markdown }}
    content={{ note: content.note, exampleNote: content.exampleNote, exampleSlugs: content.exampleSlugs }}
  />;
}
