"use client";

import { useEffect, useRef } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import styles from "./button-contract.module.css";

const variants = [
  { name: "default", meaning: "The main action in a view.", label: "Continue" },
  { name: "secondary", meaning: "A visible alternative with less emphasis.", label: "Save draft" },
  { name: "outline", meaning: "A bordered action that stays measured.", label: "View details" },
  { name: "ghost", meaning: "Minimal chrome for nearby actions.", label: "Dismiss" },
  { name: "destructive", meaning: "An action with destructive consequences.", label: "Delete item" },
  { name: "link", meaning: "A low-chrome action styled as a link.", label: "Read guide" },
] as const;

const motions = [
  { name: "None", token: "none", detail: "No authored motion; native interaction feedback remains." },
  { name: "Compression Bloom", token: "compression-bloom", detail: "A soft squash, spring return, and expanding wave." },
  { name: "Light Through Glass", token: "light-through-glass", detail: "A shallow sink followed by a contrasting glint and lit edge." },
  { name: "Precision Snap", token: "precision-snap", detail: "A short firm press, immediate rebound, and crisp edge pulse." },
] as const;

type Motion = (typeof motions)[number];

function VariantSample({ item }: { item: (typeof variants)[number] }) {
  return item.name === "link"
    ? <a className={buttonVariants({ variant: "link" })} href="/getting-started/nextjs">{item.label}</a>
    : <Button variant={item.name} type="button">{item.label}</Button>;
}

function LoopingMotionButton({ motion, offset }: { motion: Exclude<Motion["token"], "none">; offset: number }) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let startTimer: number | undefined;
    let releaseTimer: number | undefined;

    function pause() {
      window.clearTimeout(startTimer);
      window.clearTimeout(releaseTimer);
      button?.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true }));
    }

    function schedule(delay: number) {
      window.clearTimeout(startTimer);
      if (visible && !document.hidden && !reducedMotion.matches) startTimer = window.setTimeout(play, delay);
    }

    function play() {
      if (document.activeElement === button) { schedule(2200); return; }
      button?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }));
      releaseTimer = window.setTimeout(() => {
        button?.click();
        button?.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: "Enter" }));
        schedule(2600);
      }, 180);
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule(500 + offset);
      else pause();
    }, { threshold: 0.4 });
    observer.observe(button);
    const onVisibilityChange = () => document.hidden ? pause() : schedule(500 + offset);
    const onMotionChange = () => reducedMotion.matches ? pause() : schedule(500 + offset);
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      pause();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, [offset]);

  return <Button ref={buttonRef} animation={motion} type="button">Press to try</Button>;
}

export function ButtonContract() {
  return <section id="api" aria-labelledby="api-title" className={styles.section}>
    <div className={styles.intro}><h2 id="api-title">Know the contract.</h2><p>Compare the styles, then choose the response that fits your action.</p></div>

    <div className={styles.tableWrap}><table className={styles.table}>
      <thead><tr><th scope="col">Variant</th><th scope="col">Use it for</th><th scope="col">In context</th></tr></thead>
      <tbody>{variants.map(item => <tr key={item.name}>
        <th scope="row"><strong>{item.name}</strong></th>
        <td>{item.meaning}</td>
        <td><VariantSample item={item} /></td>
      </tr>)}</tbody>
    </table></div>

    <h3 className={styles.motionIntro}>What happens when you press?</h3>
    <div className={styles.motionGrid}>{motions.map((motion, index) => <div className={styles.motionItem} key={motion.token}>
      <strong>{motion.name}</strong>
      <p>{motion.detail}</p>
      <div className={styles.motionSample}>{motion.token === "none" ? <Button type="button">No motion</Button> : <LoopingMotionButton motion={motion.token} offset={(index - 1) * 450} />}</div>
    </div>)}</div>

  </section>;
}
