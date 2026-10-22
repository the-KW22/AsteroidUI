"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { CatalogDemo } from "./demos";
import styles from "./button-detail.module.css";
import type { CatalogOptions } from "@/site/catalog/detail-content";

const choices: Record<string, { key: string; label: string; values: string[] }[]> = {
  input: [{ key: "variant", label: "Variant", values: ["outline", "filled"] }, { key: "density", label: "Density", values: ["compact", "default", "comfortable"] }, { key: "animation", label: "Animation", values: ["none", "focus-wake"] }],
  textarea: [{ key: "variant", label: "Variant", values: ["outline", "filled"] }, { key: "density", label: "Density", values: ["compact", "default", "comfortable"] }, { key: "animation", label: "Animation", values: ["none", "focus-wake"] }],
  label: [{ key: "size", label: "Size", values: ["sm", "default"] }, { key: "emphasis", label: "Emphasis", values: ["normal", "strong"] }],
  checkbox: [{ key: "size", label: "Size", values: ["sm", "default", "lg"] }, { key: "variant", label: "Variant", values: ["solid", "soft"] }, { key: "animation", label: "Animation", values: ["none", "ink-mark"] }],
  "radio-group": [{ key: "size", label: "Size", values: ["sm", "default", "lg"] }, { key: "variant", label: "Variant", values: ["solid", "soft"] }, { key: "animation", label: "Animation", values: ["none", "center-fill"] }],
  select: [{ key: "variant", label: "Variant", values: ["outline", "filled"] }, { key: "density", label: "Density", values: ["compact", "default", "comfortable"] }, { key: "animation", label: "Animation", values: ["none", "bounce-open"] }],
  switch: [{ key: "size", label: "Size", values: ["sm", "default", "lg"] }, { key: "variant", label: "Variant", values: ["solid", "soft"] }, { key: "animation", label: "Animation", values: ["none", "guided-glide"] }],
  spinner: [{ key: "size", label: "Size", values: ["16", "20", "24"] }, { key: "strokeWidth", label: "Stroke width", values: ["1.5", "2", "2.5"] }, { key: "speed", label: "Speed", values: ["calm", "default"] }, { key: "color", label: "Color", values: ["inherit", "primary", "destructive"] }],
};

const tryHints: Record<string, string> = {
  input: "Type into the field, then use Tab to inspect its focus state.",
  textarea: "Edit the message and try multiline text. More field states are below.",
  label: "Select the label to focus its connected field.",
  checkbox: "Toggle the choice with a click or Space.",
  "radio-group": "Change the selected density with click or arrow keys.",
  select: "Open the list, choose another fruit, or dismiss it with Escape.",
  switch: "Toggle notifications with a click or Space.",
  spinner: "Tune the same loading ring's size, stroke, speed and color; the label remains visible.",
};

export function ParticleWorkbench({ slug, options, onOptionChange }: { slug: string; options: CatalogOptions; onOptionChange: (key: string, value: string) => void }) {
  const [light, setLight] = useState(false);

  return <div className={styles.workbench}>
    <section id="preview" className={styles.previewSurface} data-preview-appearance={light ? "light" : "dark"} aria-labelledby="preview-title">
      <div className={styles.previewToolbar}>
        <h2 id="preview-title">Live preview</h2>
        <div className={styles.previewModes} role="group" aria-label="Preview appearance">
          <button type="button" aria-pressed={light} onClick={() => setLight(true)}><Sun size={15} aria-hidden="true" /> Light</button>
          <button type="button" aria-pressed={!light} onClick={() => setLight(false)}><Moon size={15} aria-hidden="true" /> Dark</button>
        </div>
      </div>
      <div className={styles.previewStage}><CatalogDemo slug={slug} light={light} options={options} /></div>
      <p className={styles.previewFoot}>Light/Dark changes this preview only.</p>
    </section>
    <aside className={styles.customize} aria-label="How to try this component">
      <div className={styles.controlIntro}><span>Explore</span><h2>Try the real behavior.</h2><p>{tryHints[slug]}</p></div>
      <div className={styles.controls}>
        {choices[slug].map(({ key, label, values }) => <label key={key} htmlFor={`catalog-${slug}-${key}`}>{label}<select id={`catalog-${slug}-${key}`} value={options[key]} onChange={event => onOptionChange(key, event.target.value)}>{values.map(value => <option key={value} value={value}>{value}</option>)}</select></label>)}
      </div>
    </aside>
  </div>;
}
