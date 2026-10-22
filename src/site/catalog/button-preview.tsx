"use client";

import { useState, type ReactNode } from "react";
import { Copy, Heart, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./button-detail.module.css";

const variants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const;
const sizes = ["sm", "default", "lg", "icon-sm", "icon", "icon-lg"] as const;
const animations = ["none", "compression-bloom", "light-through-glass", "precision-snap"] as const;

type Variant = (typeof variants)[number];
type Size = (typeof sizes)[number];
type Animation = (typeof animations)[number];
const animationNames: Record<Animation, string> = {
  none: "None",
  "compression-bloom": "Compression Bloom",
  "light-through-glass": "Light Through Glass",
  "precision-snap": "Precision Snap",
};
const animationDescriptions: Record<Animation, string> = {
  none: "Native feedback, with no special motion.",
  "compression-bloom": "A soft squash while held; release for a spring return and expanding wave.",
  "light-through-glass": "A shallow sink, then a contrasting glint and lit edge.",
  "precision-snap": "A short, firm press with an immediate rebound and crisp edge pulse.",
};

export function ButtonPreview({ contractSection }: { contractSection: ReactNode }) {
  const [variant, setVariant] = useState<Variant>("default");
  const [size, setSize] = useState<Size>("default");
  const [animation, setAnimation] = useState<Animation>("none");
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lightPreview, setLightPreview] = useState(false);
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

  return <>
    <div className={styles.workbench}>
      <section id="preview" className={styles.previewSurface} data-preview-appearance={lightPreview ? "light" : "dark"} aria-labelledby="preview-title">
        <div className={styles.previewToolbar}>
          <h2 id="preview-title">Live preview</h2>
          <div className={styles.previewModes} role="group" aria-label="Preview appearance">
            <button type="button" aria-pressed={lightPreview} onClick={() => setLightPreview(true)}><Sun size={15} aria-hidden="true" /> Light</button>
            <button type="button" aria-pressed={!lightPreview} onClick={() => setLightPreview(false)}><Moon size={15} aria-hidden="true" /> Dark</button>
          </div>
        </div>
        <div className={styles.previewStage}>
          <Button {...previewProps}>{iconOnly ? <Heart aria-hidden="true" /> : "Save changes"}</Button>
        </div>
        <p className={styles.previewFoot}>Press and hold, then release to feel the preset. Light/Dark changes this preview only.</p>
      </section>

      <section id="customize" className={styles.customize} aria-labelledby="customize-title">
        <div className={styles.controlIntro}><span>Customize</span><h2 id="customize-title">Shape the interaction.</h2><p>The preview responds here. The code stays in sync below.</p></div>
        <div className={styles.controls}>
          <label>Style<select aria-label="Style" value={variant} onChange={event => setVariant(event.target.value as Variant)}>{variants.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <label>Size<select aria-label="Size" value={size} onChange={event => setSize(event.target.value as Size)}>{sizes.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <label>Animation<select aria-label="Animation" value={animation} onChange={event => setAnimation(event.target.value as Animation)}>{animations.map(item => <option key={item} value={item}>{animationNames[item]}</option>)}</select></label>
          <p className={styles.motionDescription}>{animationDescriptions[animation]} Motion follows your device&apos;s reduced-motion setting.</p>
          <div className={styles.checks}>
            <label><input type="checkbox" checked={disabled} onChange={event => setDisabled(event.target.checked)} /> Disabled</label>
            <label><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Loading</label>
          </div>
        </div>
      </section>
    </div>

    {contractSection}

    <section id="usage" className={styles.usageSection} aria-labelledby="usage-title">
      <div><h2 id="usage-title">Take the code.</h2><p>Copy the usage that matches your preview.</p></div>
      <div className={styles.usageCode}>
        <div className={styles.codeToolbar}><span>Usage</span><div><span role="status" aria-live="polite">{copyError ? "Clipboard unavailable; select the code below." : copied ? "Copied" : ""}</span><button type="button" onClick={() => void copySnippet()}><Copy size={14} aria-hidden="true" /> Copy</button></div></div>
        <pre tabIndex={0} aria-label="Button usage code"><code>{snippet}</code></pre>
      </div>
    </section>
  </>;
}
