import type { ReactNode } from "react";

export type DetailContent = { preview: ReactNode; usage: string; note: string; exampleNote: string; exampleSlugs: string[]; companions: string[] };

const snippets: Record<string, string> = {
  input: `import { Input } from "@/components/ui/input";\nimport { Label } from "@/components/ui/label";\n\nexport function NameField() {\n  return (\n    <div className="grid gap-2">\n      <Label htmlFor="name">Name</Label>\n      <Input id="name" name="name" placeholder="Your name" />\n    </div>\n  );\n}`,
  textarea: `import { Label } from "@/components/ui/label";\nimport { Textarea } from "@/components/ui/textarea";\n\nexport function MessageField() {\n  return (\n    <div className="grid gap-2">\n      <Label htmlFor="message">Message</Label>\n      <Textarea id="message" name="message" defaultValue="Hello" />\n    </div>\n  );\n}`,
  label: `import { Input } from "@/components/ui/input";\nimport { Label } from "@/components/ui/label";\n\nexport function EmailField() {\n  return (\n    <div className="grid gap-2">\n      <Label htmlFor="email">Email address</Label>\n      <Input id="email" name="email" type="email" />\n    </div>\n  );\n}`,
  checkbox: `import { Checkbox } from "@/components/ui/checkbox";\n\nexport function UpdatesChoice() {\n  return (\n    <label className="flex items-center gap-2">\n      <Checkbox name="updates" value="yes" />\n      Receive product updates\n    </label>\n  );\n}`,
  "radio-group": `import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";\n\nexport function DensityChoice() {\n  return (\n    <RadioGroup aria-label="Density" name="density" defaultValue="comfortable">\n      <label><RadioGroupItem value="compact" /> Compact</label>\n      <label><RadioGroupItem value="comfortable" /> Comfortable</label>\n      <label><RadioGroupItem value="spacious" /> Spacious</label>\n    </RadioGroup>\n  );\n}`,
  select: `import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";\n\nexport function FruitChoice() {\n  return (\n    <Select name="fruit" defaultValue="apple" items={{ apple: "Apple", pear: "Pear" }}>\n      <SelectLabel>Favorite fruit</SelectLabel>\n      <SelectTrigger><SelectValue placeholder="Choose a fruit" /></SelectTrigger>\n      <SelectContent>\n        <SelectItem value="apple">Apple</SelectItem>\n        <SelectItem value="pear">Pear</SelectItem>\n      </SelectContent>\n    </Select>\n  );\n}`,
  switch: `"use client";\n\nimport { useState } from "react";\nimport { Switch } from "@/components/ui/switch";\n\nexport function NotificationsSetting() {\n  const [enabled, setEnabled] = useState(false);\n  return (\n    <label className="flex items-center gap-2">\n      <Switch name="notifications" checked={enabled} onCheckedChange={setEnabled} />\n      Notifications\n    </label>\n  );\n}`,
  spinner: `import { Spinner } from "@/components/ui/spinner";\n\nexport function LoadingMessages() {\n  return <Spinner label="Loading messages" />;\n}`,
};

export function getDetailContent(slug: string): Omit<DetailContent, "preview"> | undefined {
  const usage = snippets[slug];
  if (!usage) return undefined;
  const note = slug === "label"
    ? "Connect each Label to its field with a matching htmlFor and id. Help and error descriptions remain application-owned."
    : slug === "spinner"
      ? "Standalone Spinner announces its label as a polite status. Set decorative when the parent already provides accessible loading text; reduced-motion preferences stop rotation."
      : slug === "radio-group"
        ? "RadioGroup has one selected value. Give the group an accessible name and keep each value unique."
        : "The preview shows the component with its associated accessible name and useful initial state.";
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
