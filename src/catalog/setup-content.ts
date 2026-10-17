import { installCommand } from "./registry-address";

export const setupLinks = [
  { href: "/getting-started", label: "Overview" },
  { href: "/getting-started/nextjs", label: "Next.js App Router" },
  { href: "/getting-started/vite", label: "Vite React" },
  { href: "/getting-started/theme", label: "Shared styling" },
] as const;

export const setupSnippets = {
  nextInstall: installCommand("button"),
  viteInstall: installCommand("button"),
  nextCss: '@import "tailwindcss";\n@import "../components/ui/library.css";',
  viteCss: '@import "tailwindcss";\n@import "./components/ui/library.css";',
  variables: '@font-face {\n  font-family: "Brand Sans";\n  src: url("/fonts/brand-sans.woff2") format("woff2");\n  font-style: normal;\n  font-weight: 100 900;\n  font-display: swap;\n}\n\n:root {\n  --font-sans: "Brand Sans", sans-serif;\n  --radius: 0.75rem;\n  --background: #ffffff;\n  --foreground: #171717;\n  --card: #ffffff;\n  --card-foreground: #171717;\n  --popover: #ffffff;\n  --popover-foreground: #171717;\n  --primary: #303846;\n  --primary-foreground: #ffffff;\n  --secondary: #f5f5f5;\n  --secondary-foreground: #171717;\n  --muted: #f5f5f5;\n  --muted-foreground: #525252;\n  --accent: #f5f5f5;\n  --accent-foreground: #171717;\n  --destructive: #b91c1c;\n  --destructive-foreground: #ffffff;\n  --border: #737373;\n  --input: #737373;\n  --ring: #525252;\n}\n\n.dark {\n  --background: #171717;\n  --foreground: #fafafa;\n  --card: #262626;\n  --card-foreground: #fafafa;\n  --popover: #262626;\n  --popover-foreground: #fafafa;\n  --primary: #cbd5e1;\n  --primary-foreground: #101418;\n  --secondary: #404040;\n  --secondary-foreground: #fafafa;\n  --muted: #262626;\n  --muted-foreground: #a3a3a3;\n  --accent: #404040;\n  --accent-foreground: #fafafa;\n  --destructive: #f87171;\n  --destructive-foreground: #171717;\n  --border: #737373;\n  --input: #737373;\n  --ring: #d4d4d4;\n}',
  darkMode: 'function applyDarkAppearance(isDark: boolean) {\n  document.documentElement.classList.toggle("dark", isDark);\n}\n\napplyDarkAppearance(true);',
  nextUsage: '"use client";\n\nimport { useState } from "react";\nimport { Button } from "@/components/ui/button";\nimport { Spinner } from "@/components/ui/spinner";\n\nexport function SaveAction() {\n  const [saving, setSaving] = useState(false);\n  return (\n    <div>\n      <Button loading={saving} loadingLabel="Saving" onClick={() => setSaving(true)}>Save changes</Button>\n      <Spinner label="Loading preview" />\n    </div>\n  );\n}',
  viteUsage: 'import { useState } from "react";\nimport { Button } from "@/components/ui/button";\nimport { Spinner } from "@/components/ui/spinner";\n\nexport default function App() {\n  const [saving, setSaving] = useState(false);\n  return (\n    <main>\n      <Button loading={saving} loadingLabel="Saving" onClick={() => setSaving(true)}>Save changes</Button>\n      <Spinner label="Loading preview" />\n    </main>\n  );\n}',
} as const;

export const prerequisites = [
  "React and TypeScript",
  "Tailwind CSS 4 configured for your framework",
  "shadcn configured with the Base UI base-nova style",
  "The @/* TypeScript alias mapped to src/*",
] as const;
