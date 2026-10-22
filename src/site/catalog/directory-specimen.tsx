"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import styles from "./component-directory.module.css";

/** Only the hovered/focused specimen rehearses a short, local interaction. */
export function DirectoryCard({ slug, title }: { slug: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  function stop() { setPlaying(false); setStep(0); }
  function start() {
    if (playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setStep(1);
    setPlaying(true);
  }
  useEffect(() => {
    if (!playing) return;
    const timers = [650, 1000, 1500, 2300].map((delay, index) => window.setTimeout(() => setStep(index + 2), delay));
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreference = () => { if (preference.matches) stop(); };
    const onVisibility = () => { if (document.hidden) stop(); };
    preference.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      timers.forEach(window.clearTimeout);
      preference.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [playing]);
  return (
    <li className={styles.tile} data-preview={slug} data-step={step}
      onPointerEnter={event => { if (event.pointerType !== "touch") start(); }}
      onPointerLeave={event => { if (!event.currentTarget.matches(":focus-within")) stop(); }}
      onFocus={start} onBlur={event => { if (!event.currentTarget.matches(":hover")) stop(); }}>
      <div className={styles.specimen} inert aria-hidden="true">
        <div className={styles.control}><DirectorySpecimen slug={slug} step={step} /></div>
        {playing && step < 5 && slug !== "spinner" ? <span className={styles.demoCursor}><span className={styles.clickRing} /><MousePointer2 size={23} fill="currentColor" /></span> : null}
      </div>
      <div className={styles.caption}>
        <h2 id={`directory-${slug}-title`}>{title}<ArrowUpRight size={16} aria-hidden="true" /></h2>
      </div>
      <Link className={styles.tileLink} href={`/components/${slug}`} aria-labelledby={`directory-${slug}-title`} />
    </li>
  );
}

function DirectorySpecimen({ slug, step }: { slug: string; step: number }) {
  const clicked = step >= 2;
  const typed = step >= 4;
  switch (slug) {
    case "button": return <Button className="w-full">{step >= 3 ? <>Done <Check size={16} aria-hidden="true" /></> : <>Continue <ArrowRight size={16} aria-hidden="true" /></>}</Button>;
    case "input": return <Input placeholder="Enter your email" type="email" value={typed ? "hello@asteroid.ui" : step >= 3 ? "hello@" : ""} readOnly aria-label="Email specimen" />;
    case "textarea": return <Textarea placeholder="Write something…" rows={3} value={typed ? "Small pieces.\nA whole new world." : step >= 3 ? "Small pieces." : ""} readOnly aria-label="Textarea specimen" />;
    case "label": return <div className="grid w-full gap-3"><Label htmlFor="directory-project">Project name</Label><Input id="directory-project" value="My next idea" readOnly /></div>;
    case "checkbox": return <div className="flex items-center gap-3"><Checkbox checked={clicked} aria-label="Checkbox specimen" /><span>Keep me in the loop</span></div>;
    case "radio-group": return <RadioGroup value={clicked ? "team" : "personal"} aria-label="Plan specimen"><div className="flex items-center gap-3"><RadioGroupItem value="personal" aria-label="Personal" /><span>Personal</span></div><div className="flex items-center gap-3"><RadioGroupItem value="team" aria-label="Team" /><span>Team</span></div></RadioGroup>;
    case "select": return <div className={styles.selectDemo}><Select value={typed ? "personal" : null} items={[{ value: "personal", label: "Personal" }, { value: "team", label: "Team" }]}><SelectTrigger aria-label="Select specimen"><SelectValue placeholder="Choose an option" /></SelectTrigger></Select>{clicked && !typed ? <div className={styles.demoOptions}><span>Personal <Check size={13} /></span><span>Team</span></div> : null}</div>;
    case "switch": return <div className="flex items-center gap-3"><Switch checked={clicked} aria-label="Switch specimen" /><span>Notifications</span></div>;
    case "spinner": return <Spinner size={30} decorative />;
    default: return null;
  }
}
