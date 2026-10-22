"use client";

import { useId, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import styles from "./generic-detail.module.css";
import type { CatalogOptions } from "@/site/catalog/detail-content";

function Demo({ slug, light, options, decorative = false, demoActive }: { slug: string; light: boolean; options: CatalogOptions; decorative?: boolean; demoActive?: boolean }) {
  const id = useId();
  const [enabled, setEnabled] = useState(false);
  if (slug === "input") return <div className="grid max-w-sm gap-2"><Label htmlFor={id}>Name</Label><Input id={id} name="name" placeholder="Your name" data-preview-focus={demoActive ? "" : undefined} variant={options.variant as "outline" | "filled"} density={options.density as "compact" | "default" | "comfortable"} animation={options.animation as "none" | "focus-wake"} /></div>;
  if (slug === "textarea") return <div className="grid max-w-sm gap-2"><Label htmlFor={id}>Message</Label><Textarea id={id} name="message" defaultValue="Hello" data-preview-focus={demoActive ? "" : undefined} variant={options.variant as "outline" | "filled"} density={options.density as "compact" | "default" | "comfortable"} animation={options.animation as "none" | "focus-wake"} /></div>;
  if (slug === "label") return <div className="grid max-w-sm gap-2"><Label htmlFor={id} size={options.size as "sm" | "default"} emphasis={options.emphasis as "normal" | "strong"}>Email address</Label><Input id={id} name="email" type="email" /></div>;
  if (slug === "checkbox") return <label className="flex items-center gap-2 text-sm"><Checkbox aria-label="Receive product updates" name="updates" value="yes" checked={demoActive} size={options.size as "sm" | "default" | "lg"} variant={options.variant as "solid" | "soft"} animation={options.animation as "none" | "ink-mark"} />Receive product updates</label>;
  if (slug === "radio-group") return <RadioGroup aria-label="Density" name="density" defaultValue={demoActive === undefined ? "comfortable" : undefined} value={demoActive === undefined ? undefined : demoActive ? "compact" : "comfortable"}><label className="flex items-center gap-2 text-sm"><RadioGroupItem value="compact" size={options.size as "sm" | "default" | "lg"} variant={options.variant as "solid" | "soft"} animation={options.animation as "none" | "center-fill"} />Compact</label><label className="flex items-center gap-2 text-sm"><RadioGroupItem value="comfortable" size={options.size as "sm" | "default" | "lg"} variant={options.variant as "solid" | "soft"} animation={options.animation as "none" | "center-fill"} />Comfortable</label><label className="flex items-center gap-2 text-sm"><RadioGroupItem value="spacious" size={options.size as "sm" | "default" | "lg"} variant={options.variant as "solid" | "soft"} animation={options.animation as "none" | "center-fill"} />Spacious</label></RadioGroup>;
  if (slug === "select") return <div className="w-full max-w-xs"><Select name="fruit" defaultValue="apple" items={{ apple: "Apple", pear: "Pear" }}><SelectLabel>Favorite fruit</SelectLabel><SelectTrigger aria-label="Favorite fruit" variant={options.variant as "outline" | "filled"} density={options.density as "compact" | "default" | "comfortable"}><SelectValue placeholder="Choose a fruit" /></SelectTrigger><SelectContent animation={options.animation as "none" | "bounce-open"} popupClassName={light ? styles.lightPopup : styles.darkPopup}><SelectItem value="apple">Apple</SelectItem><SelectItem value="pear">Pear</SelectItem></SelectContent></Select></div>;
  if (slug === "switch") return <label className="flex items-center gap-2 text-sm"><Switch aria-label="Notifications" name="notifications" checked={demoActive ?? enabled} onCheckedChange={demoActive === undefined ? setEnabled : undefined} size={options.size as "sm" | "default" | "lg"} variant={options.variant as "solid" | "soft"} animation={options.animation as "none" | "guided-glide"} />Notifications</label>;
  const color = options.color === "primary" ? "var(--primary)" : options.color === "destructive" ? "var(--destructive)" : undefined;
  return <Spinner label="Loading messages" decorative={decorative} size={Number(options.size)} strokeWidth={Number(options.strokeWidth)} speed={options.speed as "calm" | "default"} style={color ? { color } : undefined} />;
}

export function CatalogDemo({ slug, light = false, options, decorative = false, demoActive }: { slug: string; light?: boolean; options: CatalogOptions; decorative?: boolean; demoActive?: boolean }) {
  return <Demo slug={slug} light={light} options={options} decorative={decorative} demoActive={demoActive} />;
}

export function TextareaStates() {
  return <div className="grid max-w-sm gap-4">
    <div className="grid gap-2"><Label htmlFor="detail-disabled-message">Disabled message</Label><Textarea id="detail-disabled-message" disabled defaultValue="This field is unavailable" /></div>
    <div className="grid gap-2"><Label htmlFor="detail-invalid-message">Invalid message</Label><Textarea id="detail-invalid-message" aria-invalid="true" aria-describedby="detail-message-error" defaultValue="Review this message" /><p id="detail-message-error" className="text-sm text-destructive">Example error message.</p></div>
  </div>;
}
