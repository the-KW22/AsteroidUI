"use client";

import { useEffect, useState } from "react";
import styles from "./button-detail.module.css";

export function DetailTimeline({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    let frame = 0;
    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let closest = -Infinity;
        const current = sections.reduce((found, section) => {
          const element = document.getElementById(section.id);
          const top = element?.getBoundingClientRect().top;
          if (top !== undefined && top <= 170 && top > closest) {
            closest = top;
            return section.id;
          }
          return found;
        }, sections[0]?.id);
        setActive(current);
      });
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  return <nav className={styles.timeline} aria-label="On this page">
    <p>On this page</p>
    <ol>{sections.map(section => <li key={section.id} data-active={active === section.id}><a href={`#${section.id}`} aria-current={active === section.id ? "location" : undefined} onClick={() => setActive(section.id)}>{section.label}</a></li>)}</ol>
  </nav>;
}
