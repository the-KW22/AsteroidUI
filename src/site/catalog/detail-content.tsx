import type { ReactNode } from "react";

export type DetailContent = { preview: ReactNode; usage: string; note: string; exampleNote: string; exampleSlugs: string[]; companions: string[] };

export type CatalogOptions = Record<string, string>;

export const defaultCatalogOptions: Record<string, CatalogOptions> = {
  input: { variant: "outline", density: "default", animation: "none" },
  textarea: { variant: "outline", density: "default", animation: "none" },
  label: { size: "default", emphasis: "normal" },
  checkbox: { size: "default", variant: "solid", animation: "none" },
  "radio-group": { size: "default", variant: "solid", animation: "none" },
  select: { variant: "outline", density: "default", animation: "none" },
  switch: { size: "default", variant: "solid", animation: "none" },
  spinner: { size: "16", strokeWidth: "2", speed: "default", color: "inherit" },
};

const snippets: Record<string, string> = {
  input: `import { Input } from "@/components/ui/input";\nimport { Label } from "@/components/ui/label";\n\nexport function NameField() {\n  return (\n    <div className="grid gap-2">\n      <Label htmlFor="name">Name</Label>\n      <Input id="name" name="name" placeholder="Your name" {{OPTIONS}} />\n    </div>\n  );\n}`,
  textarea: `import { Label } from "@/components/ui/label";\nimport { Textarea } from "@/components/ui/textarea";\n\nexport function MessageField() {\n  return (\n    <div className="grid gap-2">\n      <Label htmlFor="message">Message</Label>\n      <Textarea id="message" name="message" defaultValue="Hello" {{OPTIONS}} />\n    </div>\n  );\n}`,
  label: `import { Input } from "@/components/ui/input";\nimport { Label } from "@/components/ui/label";\n\nexport function EmailField() {\n  return (\n    <div className="grid gap-2">\n      <Label htmlFor="email" {{OPTIONS}}>Email address</Label>\n      <Input id="email" name="email" type="email" />\n    </div>\n  );\n}`,
  checkbox: `import { Checkbox } from "@/components/ui/checkbox";\n\nexport function UpdatesChoice() {\n  return (\n    <label className="flex items-center gap-2">\n      <Checkbox name="updates" value="yes" {{OPTIONS}} />\n      Receive product updates\n    </label>\n  );\n}`,
  "radio-group": `import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";\n\nexport function DensityChoice() {\n  return (\n    <RadioGroup aria-label="Density" name="density" defaultValue="comfortable">\n      <label><RadioGroupItem value="compact" {{OPTIONS}} /> Compact</label>\n      <label><RadioGroupItem value="comfortable" {{OPTIONS}} /> Comfortable</label>\n      <label><RadioGroupItem value="spacious" {{OPTIONS}} /> Spacious</label>\n    </RadioGroup>\n  );\n}`,
  select: `import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";\n\nexport function FruitChoice() {\n  return (\n    <Select name="fruit" defaultValue="apple" items={{ apple: "Apple", pear: "Pear" }}>\n      <SelectLabel>Favorite fruit</SelectLabel>\n      <SelectTrigger {{TRIGGER_OPTIONS}}><SelectValue placeholder="Choose a fruit" /></SelectTrigger>\n      <SelectContent {{CONTENT_OPTIONS}}>\n        <SelectItem value="apple">Apple</SelectItem>\n        <SelectItem value="pear">Pear</SelectItem>\n      </SelectContent>\n    </Select>\n  );\n}`,
  switch: `"use client";\n\nimport { useState } from "react";\nimport { Switch } from "@/components/ui/switch";\n\nexport function NotificationsSetting() {\n  const [enabled, setEnabled] = useState(false);\n  return (\n    <label className="flex items-center gap-2">\n      <Switch name="notifications" checked={enabled} onCheckedChange={setEnabled} {{OPTIONS}} />\n      Notifications\n    </label>\n  );\n}`,
  spinner: `import { Spinner } from "@/components/ui/spinner";\n\nexport function LoadingMessages() {\n  return <Spinner label="Loading messages" {{OPTIONS}} />;\n}`,
};

export function getUsage(slug: string, options: CatalogOptions = defaultCatalogOptions[slug] ?? {}): string | undefined {
  const usage = snippets[slug];
  if (!usage) return undefined;
  if (slug === "select") {
    const trigger = Object.entries(options).filter(([key]) => key !== "animation").map(([key, value]) => `${key}={${JSON.stringify(value)}}`).join(" ");
    return usage.replace("{{TRIGGER_OPTIONS}}", trigger).replace("{{CONTENT_OPTIONS}}", `animation={${JSON.stringify(options.animation)}}`);
  }
  if (slug === "spinner") {
    const color = options.color === "primary" ? "var(--primary)" : options.color === "destructive" ? "var(--destructive)" : undefined;
    const attrs = `size={${Number(options.size)}} strokeWidth={${Number(options.strokeWidth)}} speed={${JSON.stringify(options.speed)}}${color ? ` style={{ color: ${JSON.stringify(color)} }}` : ""}`;
    return usage.replace("{{OPTIONS}}", attrs);
  }
  const attrs = Object.entries(options).map(([key, value]) => `${key}={${JSON.stringify(value)}}`).join(" ");
  return usage.replaceAll("{{OPTIONS}}", attrs);
}

export function getDetailContent(slug: string, options?: CatalogOptions): Omit<DetailContent, "preview"> | undefined {
  const usage = getUsage(slug, options);
  if (!usage) return undefined;
  const notes: Record<string, string> = {
    input: "Input keeps native input behavior and size. Choose outline or filled variant, compact/default/comfortable density, and optional focus-wake border glow; defaults are outline, default, and none. The focus outline remains immediate.",
    textarea: "Textarea keeps native rows and vertical resize. Choose outline or filled variant, compact/default/comfortable density, and optional focus-wake border glow; defaults are outline, default, and none.",
    label: "Label supports sm/default size and normal/strong emphasis, defaulting to default and normal. Connect it to a field with matching htmlFor and id; help and error descriptions remain application-owned.",
    checkbox: "Checkbox supports sm/default/lg size, solid/soft variant, and optional ink-mark animation. Defaults are default, solid, and none; checked and indeterminate remain distinct.",
    "radio-group": "RadioGroup has one selected value and needs an accessible group name. Each RadioGroupItem supports sm/default/lg size, solid/soft variant, and optional center-fill animation; defaults are default, solid, and none.",
    select: "SelectTrigger supports outline/filled variant and compact/default/comfortable density. SelectContent supports optional bounce-open animation. Defaults preserve the current outline trigger, default density, and no popup motion; Base UI keeps keyboard, focus and form behavior.",
    switch: "Switch supports sm/default/lg size, solid/soft variant, and optional guided-glide animation. Defaults are default, solid, and none; checked state changes immediately.",
    spinner: "Spinner supports numeric size, strokeWidth, currentColor and calm/default speed on the same ring. Standalone use announces its label; set decorative when a parent provides status text. Reduced motion stops rotation.",
  };
  const note = notes[slug];
  const exampleSlugs: Record<string, string[]> = {
    input: ["input", "textarea", "label"], textarea: ["input", "textarea", "label"], label: ["input", "textarea", "label"],
    checkbox: ["checkbox", "radio-group", "switch"], "radio-group": ["checkbox", "radio-group", "switch"],
    select: ["select"], switch: ["checkbox", "radio-group", "switch"], spinner: ["spinner"],
  };
  const exampleNote = slug === "input" || slug === "textarea" || slug === "label"
    ? "The maintained fields example also demonstrates controlled values, read-only fields, disabled input, and invalid input. It imports Input, Textarea, and Label."
    : slug === "checkbox" || slug === "radio-group" || slug === "switch"
      ? "The maintained choices example demonstrates controlled and uncontrolled state, disabled and read-only states, indeterminate Checkbox, keyboard interaction, and form values. It imports Checkbox, RadioGroup, and Switch."
      : slug === "select"
        ? "The maintained example demonstrates controlled and uncontrolled values, disabled states, keyboard selection, and long option text."
        : "The maintained example demonstrates 16px, 20px, and 24px sizes, color customization, and standalone status labeling.";
  const companions: Record<string, string[]> = { input: ["label"], textarea: ["label"], label: ["input"] };
  return { usage, note, exampleNote, exampleSlugs: exampleSlugs[slug], companions: companions[slug] ?? [] };
}
