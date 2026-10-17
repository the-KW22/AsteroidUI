"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const variants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const;
const sizes = ["sm", "default", "lg", "icon-sm", "icon", "icon-lg"] as const;
const animations = ["none", "press", "lift", "highlight", "ripple", "inset"] as const;

type Variant = (typeof variants)[number];
type Size = (typeof sizes)[number];
type Animation = (typeof animations)[number];

export function ButtonPreview() {
  const [variant, setVariant] = useState<Variant>("default");
  const [size, setSize] = useState<Size>("default");
  const [animation, setAnimation] = useState<Animation>("none");
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const iconOnly = size === "icon-sm" || size === "icon" || size === "icon-lg";
  const previewProps = {
    variant,
    size,
    animation,
    disabled,
    loading,
    ...(loading ? { loadingLabel: "Saving changes" } : {}),
    ...(iconOnly ? { "aria-label": "Save changes" } : {}),
  };
  const snippet = [
    'import { Button } from "@/components/ui/button"',
    ...(iconOnly ? ['import { Heart } from "lucide-react"'] : []),
    "",
    `<Button variant="${previewProps.variant}" size="${previewProps.size}" animation="${previewProps.animation}"${previewProps.disabled ? " disabled" : ""}${previewProps.loading ? ' loading loadingLabel="Saving changes"' : ""}${iconOnly ? ' aria-label="Save changes"' : ""}>`,
    iconOnly ? '  <Heart aria-hidden="true" />' : "  Save changes",
    "</Button>",
  ].join("\n");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium">
          Style
          <select aria-label="Style" className="rounded-md border border-input bg-background px-3 py-2 text-foreground" value={variant} onChange={(event) => setVariant(event.target.value as Variant)}>
            {variants.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Size
          <select aria-label="Size" className="rounded-md border border-input bg-background px-3 py-2 text-foreground" value={size} onChange={(event) => setSize(event.target.value as Size)}>
            {sizes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Animation
          <select aria-label="Animation" className="rounded-md border border-input bg-background px-3 py-2 text-foreground" value={animation} onChange={(event) => setAnimation(event.target.value as Animation)}>
            {animations.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.target.checked)} /> Disabled</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={loading} onChange={(event) => setLoading(event.target.checked)} /> Loading</label>
      </div>
      <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6">
        <Button {...previewProps}>
          {iconOnly ? <Heart aria-hidden="true" /> : "Save changes"}
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-muted/50">
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
          <p className="text-sm font-medium">Usage</p>
          <div className="flex items-center gap-3"><span role="status" aria-live="polite" className="text-sm text-muted-foreground">{copyError ? "Clipboard unavailable" : copied ? "Copied" : ""}</span><button type="button" onClick={() => void copySnippet()} className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent">{copied ? "Copied" : "Copy code"}</button></div>
        </div>
        <pre className="overflow-x-auto p-4 text-sm"><code>{snippet}</code></pre>
      </div>
    </div>
  );
}
