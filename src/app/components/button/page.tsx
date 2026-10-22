import Link from "next/link";
import { getCatalogItems } from "@/site/catalog/data";
import { installCommand, isLocalRegistry, registryOrigin } from "@/site/catalog/registry-address";
import { ButtonPreview } from "@/site/catalog/button-preview";
import { ButtonContract } from "@/site/catalog/button-contract";
import { CodeBlock } from "@/site/catalog/code-block";
import { AgentCopyMenu } from "@/site/catalog/agent-copy-menu";
import { DetailPageShell } from "@/site/catalog/detail-page-shell";
import styles from "@/site/catalog/button-detail.module.css";

const timeline = [
  { id: "preview", label: "Preview" },
  { id: "customize", label: "Customize" },
  { id: "api", label: "Contract" },
  { id: "usage", label: "Usage" },
  { id: "installation", label: "Installation" },
];

export default function ButtonPage() {
  const item = getCatalogItems().find(entry => entry.slug === "button");
  if (!item) throw new Error("The Button registry item is missing.");
  const registryDependencies = item.registryDependencies.map(dependency => dependency.split("/").at(-1)?.replace(/\.json$/, "")).join(", ") || "None";
  const command = installCommand("button");
  const localNote = isLocalRegistry ? `Keep the local registry at ${registryOrigin} running while installing.\n` : "";
  const guidance = [
    "Choose variant: default, secondary, outline, ghost, destructive, or link.",
    "Choose size: sm, default, lg, icon-sm, icon, or icon-lg. Give icon-only Buttons an accessible name.",
    "Choose animation: none (default), compression-bloom, light-through-glass, or precision-snap. Respect reduced-motion preferences.",
    "Use disabled or application-controlled loading when needed; loading prevents repeat activation and accepts loadingLabel.",
    "Button defaults to type=button. Set type=submit for forms; use an anchor for navigation.",
    "Adjust colors and radius through the project's shared theme or component classes if requested.",
  ];
  const plainText = `Install and configure AsteroidUI Button in my project.\n\nFollow the guide for my setup: ${registryOrigin}/getting-started/nextjs or ${registryOrigin}/getting-started/vite, and import the shared stylesheet: ${registryOrigin}/getting-started/theme.\n${localNote}Run from the project root: ${command}\nPackages: ${item.dependencies.join(", ") || "None"}. Related registry items: ${registryDependencies}.\n\nCustomization options:\n${guidance.map(line => `- ${line}`).join("\n")}\n\nUse the installed Button from @/components/ui/button. Ask me which options to use if I have not specified them.`;
  const markdown = `# Install and configure AsteroidUI Button\n\nFollow the [Next.js guide](${registryOrigin}/getting-started/nextjs) or [Vite guide](${registryOrigin}/getting-started/vite), and import the [shared stylesheet](${registryOrigin}/getting-started/theme).\n\n${isLocalRegistry ? `Keep the local registry at ${registryOrigin} running while installing.\n\n` : ""}Run from the project root:\n\n\`\`\`sh\n${command}\n\`\`\`\n\nPackages: ${item.dependencies.join(", ") || "None"}. Related registry items: ${registryDependencies}.\n\n## Customization options\n\n${guidance.map(line => `- ${line}`).join("\n")}\n\nUse the installed \`Button\` from \`@/components/ui/button\`. Ask me which options to use if I have not specified them.`;

  return <DetailPageShell title={item.title} description={item.description} mainId="button-detail-content" action={<AgentCopyMenu plainText={plainText} markdown={markdown} />} sections={timeline}>
        <ButtonPreview contractSection={<ButtonContract />} />

        <section id="installation" className={styles.section} aria-labelledby="installation-title">
          <div className={styles.sectionIntro}><h2 id="installation-title">Install it.</h2><p>Bring the maintained Button source into your project.</p></div>
          <CodeBlock code={command} label="Install Button" />
          <p>Run this from your project root after following the <Link href="/getting-started/nextjs">Next.js guide</Link> or <Link href="/getting-started/vite">Vite guide</Link> and importing the <Link href="/getting-started/theme">shared stylesheet</Link>.{isLocalRegistry && <> Keep the local registry at <code>{registryOrigin}</code> running during installation.</>}</p>
          <p>Packages: {item.dependencies.join(", ") || "None"}. Related registry items: {registryDependencies}. In Next.js, call the client-exported <code>buttonVariants</code> helper from a client module.</p>
        </section>
  </DetailPageShell>;
}
