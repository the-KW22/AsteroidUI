"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { gsap } from "gsap";
import { defaultCatalogOptions, type CatalogOptions } from "@/site/catalog/detail-content";
import { CatalogDemo } from "./demos";
import styles from "./button-contract.module.css";
import detailStyles from "./generic-detail.module.css";

type Choice = { value: string; purpose: string };
type Contract = {
  intro: string;
  settings: { name: string; key: string; choices: Choice[] }[];
  response?: { title: string; key: string; choices: Choice[]; hint: string };
};

const contracts: Record<string, Contract> = {
  input: {
    intro: "Choose the field surface and density, then try its focus response.",
    settings: [
      { name: "Surface", key: "variant", choices: [{ value: "outline", purpose: "A defined boundary for a standard form field." }, { value: "filled", purpose: "A quieter border on a tinted field surface." }] },
      { name: "Density", key: "density", choices: [{ value: "compact", purpose: "Tighter forms with limited space." }, { value: "default", purpose: "The baseline field height." }, { value: "comfortable", purpose: "More room for touch and reading." }] },
    ],
    response: { title: "What happens on focus?", key: "animation", hint: "A visual focus cycle plays here without moving keyboard focus.", choices: [{ value: "none", purpose: "Immediate focus styling without authored motion." }, { value: "focus-wake", purpose: "A light follows the border while focus remains; the text surface stays clear." }] },
  },
  textarea: {
    intro: "Compare writing surfaces and space for longer input.",
    settings: [
      { name: "Surface", key: "variant", choices: [{ value: "outline", purpose: "A clear boundary around editable content." }, { value: "filled", purpose: "A tinted writing surface with a quieter border." }] },
      { name: "Density", key: "density", choices: [{ value: "compact", purpose: "A tighter multiline field." }, { value: "default", purpose: "The baseline writing space." }, { value: "comfortable", purpose: "More breathing room around text." }] },
    ],
    response: { title: "What happens on focus?", key: "animation", hint: "A visual focus cycle plays here without moving keyboard focus.", choices: [{ value: "none", purpose: "Immediate focus styling without authored motion." }, { value: "focus-wake", purpose: "A light follows the writing border without washing over its text." }] },
  },
  label: {
    intro: "Set readable hierarchy without changing the field it names.",
    settings: [
      { name: "Size", key: "size", choices: [{ value: "sm", purpose: "Compact supporting labels." }, { value: "default", purpose: "The standard form label." }] },
      { name: "Emphasis", key: "emphasis", choices: [{ value: "normal", purpose: "A quiet field name." }, { value: "strong", purpose: "Stronger hierarchy for an important field." }] },
    ],
  },
  checkbox: {
    intro: "Choose the mark's scale and surface, then toggle it.",
    settings: [
      { name: "Size", key: "size", choices: [{ value: "sm", purpose: "Dense preference lists." }, { value: "default", purpose: "The baseline control." }, { value: "lg", purpose: "A more prominent choice." }] },
      { name: "Surface", key: "variant", choices: [{ value: "solid", purpose: "A filled checked state." }, { value: "soft", purpose: "A quieter checked surface." }] },
    ],
    response: { title: "How does the mark arrive?", key: "animation", hint: "The checked state cycles automatically in this comparison.", choices: [{ value: "none", purpose: "The mark appears immediately." }, { value: "ink-mark", purpose: "A drawn-in mark and bounded confirmation halo; selection changes immediately." }] },
  },
  "radio-group": {
    intro: "Show one selection clearly within a group.",
    settings: [
      { name: "Size", key: "size", choices: [{ value: "sm", purpose: "Dense option lists." }, { value: "default", purpose: "The baseline group control." }, { value: "lg", purpose: "A more prominent selection." }] },
      { name: "Surface", key: "variant", choices: [{ value: "solid", purpose: "A distinct selected center." }, { value: "soft", purpose: "A quieter selected surface." }] },
    ],
    response: { title: "How does selection settle?", key: "animation", hint: "The selected option cycles automatically in this comparison.", choices: [{ value: "none", purpose: "Selection appears immediately." }, { value: "center-fill", purpose: "A center grows into place with a disappearing confirmation ring." }] },
  },
  select: {
    intro: "Match the trigger to its form, then inspect the popup.",
    settings: [
      { name: "Surface", key: "variant", choices: [{ value: "outline", purpose: "A defined trigger boundary." }, { value: "filled", purpose: "A tinted trigger with a quieter border." }] },
      { name: "Density", key: "density", choices: [{ value: "compact", purpose: "Tighter form layouts." }, { value: "default", purpose: "The baseline trigger height." }, { value: "comfortable", purpose: "More room for long labels and touch." }] },
    ],
    response: { title: "How does the list open?", key: "animation", hint: "This visual popup preview cycles without opening a focus-managed menu.", choices: [{ value: "none", purpose: "The popup opens without authored motion." }, { value: "bounce-open", purpose: "The list drops past its anchor, rebounds, and settles; selection behavior is unchanged." }] },
  },
  switch: {
    intro: "Make an on/off setting legible at the right scale.",
    settings: [
      { name: "Size", key: "size", choices: [{ value: "sm", purpose: "Compact setting rows." }, { value: "default", purpose: "The baseline toggle." }, { value: "lg", purpose: "A more prominent setting." }] },
      { name: "Surface", key: "variant", choices: [{ value: "solid", purpose: "A decisive on state." }, { value: "soft", purpose: "A quieter on surface." }] },
    ],
    response: { title: "How does the toggle respond?", key: "animation", hint: "The on/off state cycles automatically in this comparison.", choices: [{ value: "none", purpose: "The thumb moves without authored transition." }, { value: "guided-glide", purpose: "A slower glide across the padded track with a soft traveling highlight." }] },
  },
  spinner: {
    intro: "Tune one loading ring without changing its meaning.",
    settings: [
      { name: "Size", key: "size", choices: [{ value: "16", purpose: "Beside compact text or controls." }, { value: "20", purpose: "A medium inline status." }, { value: "24", purpose: "A more visible standalone status." }] },
      { name: "Stroke", key: "strokeWidth", choices: [{ value: "1.5", purpose: "A light ring." }, { value: "2", purpose: "The baseline ring." }, { value: "2.5", purpose: "A stronger visible stroke." }] },
      { name: "Color", key: "color", choices: [{ value: "inherit", purpose: "Follow surrounding text color." }, { value: "primary", purpose: "Use the current theme's primary color." }, { value: "destructive", purpose: "Use the current theme's destructive color." }] },
    ],
    response: { title: "How quickly does it turn?", key: "speed", hint: "Reduced-motion preference stops both rotations.", choices: [{ value: "default", purpose: "The baseline loading pace." }, { value: "calm", purpose: "A slower, quieter rotation." }] },
  },
};

function Sample({ slug, option, value }: { slug: string; option: string; value: string }) {
  const options: CatalogOptions = { ...defaultCatalogOptions[slug], [option]: value };
  return <CatalogDemo slug={slug} options={options} decorative={slug === "spinner"} />;
}

function MotionSample({ slug, option, value }: { slug: string; option: string; value: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [active, setActive] = useState(false);
  const options: CatalogOptions = { ...defaultCatalogOptions[slug], [option]: value };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      setReducedMotion(reduced.matches);
      setRunning(visible && !document.hidden && !reduced.matches);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.4 });
    observer.observe(element);
    sync();
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!running || slug === "spinner") return;
    const element = ref.current;
    if (!element) return;
    const context = gsap.context(() => {
      const clock = { t: 0 };
      const activeDuration = slug === "input" || slug === "textarea" ? 2.25 : 0.95;
      gsap.timeline({ repeat: -1 })
        .call(() => setActive(true), undefined, 0)
        .call(() => setActive(false), undefined, activeDuration)
        .to(clock, { t: 1, duration: activeDuration + 1.55, ease: "none" }, 0);
    }, element);
    return () => context.revert();
  }, [running, reducedMotion, slug, value]);

  const previewActive = reducedMotion || (running && active);

  return <div ref={ref} className={`${detailStyles.autoSample} ${slug === "select" ? detailStyles.selectSample : ""}`} data-loop-active={running || undefined} aria-hidden="true" inert>
    <CatalogDemo slug={slug} options={options} decorative={slug === "spinner"} demoActive={previewActive} />
    {slug === "select" && <div className={`cl-select-popup ${value === "bounce-open" ? "cl-select-bounce-open" : ""} ${detailStyles.selectGhost}`} data-select-motion-preview={previewActive ? "" : undefined}>
      <div className="cl-select-option">Apple</div>
      <div className="cl-select-option">Pear</div>
    </div>}
  </div>;
}

export function ParticleContract({ slug, note, exampleNote, children }: { slug: string; note: string; exampleNote: string; children: ReactNode }) {
  const contract = contracts[slug];
  if (!contract) throw new Error(`Missing contract board for ${slug}`);
  const response = contract.response;

  return <section id="api" aria-labelledby="contract-title" className={`${styles.section} ${detailStyles.comparison}`}>
    <div className={styles.intro}><h2 id="contract-title">Know the contract.</h2><p>{contract.intro}</p></div>
    <div className={styles.tableWrap}><table className={styles.table}>
      <thead><tr><th scope="col">Setting</th><th scope="col">Use it for</th><th scope="col">In context</th></tr></thead>
      <tbody>{contract.settings.flatMap(group => group.choices.map(choice => <tr key={`${group.key}-${choice.value}`}>
        <th scope="row"><strong>{group.name} · {choice.value}</strong></th>
        <td>{choice.purpose}</td>
        <td><Sample slug={slug} option={group.key} value={choice.value} /></td>
      </tr>))}</tbody>
    </table></div>
    {response && <>
      <h3 className={styles.motionIntro}>{response.title}</h3>
      <div className={`${styles.motionGrid} ${detailStyles.responseGrid}`}>{response.choices.map(choice => <div className={styles.motionItem} key={choice.value}>
        <strong>{choice.value}</strong>
        <p>{choice.purpose}</p>
        <div className={styles.motionSample}><MotionSample slug={slug} option={response.key} value={choice.value} /></div>
      </div>)}</div>
      <p className={detailStyles.responseHint}>{response.hint} The visual previews loop while visible and pause when hidden or reduced motion is preferred; use the live workbench above to interact.</p>
    </>}
    <p className={detailStyles.contractNote}>{note} {exampleNote}</p>
    {children}
  </section>;
}
