"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useLenis } from "lenis/react";
import { storyProgress, storyScroll } from "./story-progress";
import styles from "./story-timeline.module.css";

const stages = [
  { id: "stage-particles", label: "Particles" },
  { id: "stage-asteroid", label: "Asteroid" },
  { id: "stage-galaxy", label: "Galaxy" },
];

export function StoryTimeline() {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const lenis = useLenis();

  useEffect(() => {
    let frame = 0;
    const journey = document.querySelector<HTMLElement>("[data-horizontal-journey]");
    const track = journey?.querySelector<HTMLElement>("[data-story-track]");
    const viewport = track?.parentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    journey?.setAttribute("data-story-ready", "");

    const updateStage = () => {
      frame = 0;
      if (!journey || !track || !viewport) return;
      const rect = journey.getBoundingClientRect();
      const scroll = storyScroll(journey);
      journey.toggleAttribute("data-story-entered", !motion.matches && rect.top <= 0 && scroll < 0.82);
      let nextStage: string | null;
      if (motion.matches) {
        const midpoint = window.innerHeight / 2;
        nextStage = null;
        for (const article of journey.querySelectorAll<HTMLElement>("[data-tier]")) {
          if (article.getBoundingClientRect().top <= midpoint) nextStage = `stage-${article.dataset.tier}`;
        }
      } else {
        const progress = storyProgress(journey);
        const distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
        const exit = Math.max(0, Math.min(1, (scroll - 0.82) / 0.18));
        track.style.transform = `translate3d(${-progress * distance - exit * viewport.clientWidth}px, 0, 0)`;
        nextStage = stages[Math.round(progress * 2)].id;
      }
      setActiveStage((current) => current === nextStage ? current : nextStage);
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateStage);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    motion.addEventListener("change", scheduleUpdate);
    scheduleUpdate();
    if (window.location.hash.startsWith("#stage-")) {
      requestAnimationFrame(() => {
        const anchor = document.getElementById(window.location.hash.slice(1));
        if (anchor?.closest("[data-horizontal-journey]")) {
          window.scrollTo({ top: window.scrollY + anchor.getBoundingClientRect().top, behavior: "instant" });
          scheduleUpdate();
        }
      });
    }

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      motion.removeEventListener("change", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      journey?.removeAttribute("data-story-entered");
      journey?.removeAttribute("data-story-ready");
    };
  }, []);

  const navigateToStage = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = document.getElementById(id);
    const journey = anchor?.closest<HTMLElement>("[data-horizontal-journey]");
    if (!anchor || !journey) return;

    event.preventDefault();
    window.history.pushState({}, "", `#${id}`);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const article = journey.querySelector<HTMLElement>(`[data-tier="${id.slice(6)}"]`);
    const top = reduced && article
      ? window.scrollY + article.getBoundingClientRect().top + article.offsetHeight / 2 - window.innerHeight / 2
      : window.scrollY + anchor.getBoundingClientRect().top;
    if (lenis) lenis.scrollTo(top);
    else window.scrollTo({ top, behavior: reduced ? "instant" : "smooth" });
    setActiveStage(id);
  };

  return (
    <nav className={styles.timeline} aria-label="Story stages">
      <span className={styles.track} aria-hidden="true" />
      {stages.map(({ id, label }) => (
        <a
          className={styles.stage}
          href={`#${id}`}
          key={id}
          aria-current={activeStage === id ? "location" : undefined}
          onClick={(event) => navigateToStage(event, id)}
        >
          <span className={styles.marker} aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
