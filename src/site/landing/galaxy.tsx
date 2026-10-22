"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./landing.module.css";

function subscribe(callback: () => void) {
  const desktop = matchMedia("(min-width: 1024px)");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  desktop.addEventListener("change", callback);
  motion.addEventListener("change", callback);
  return () => {
    desktop.removeEventListener("change", callback);
    motion.removeEventListener("change", callback);
  };
}
function snapshot() {
  return `${matchMedia("(min-width: 1024px)").matches}:${matchMedia("(prefers-reduced-motion: reduce)").matches}`;
}

export function Galaxy() {
  const preference = useSyncExternalStore(subscribe, snapshot, () => "false:true");
  const [desktop, reduced] = preference.split(":").map((value) => value === "true");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtime = useRef<ReturnType<typeof import("./galaxy-renderer").mountGalaxy> | null>(null);
  useEffect(() => {
    if (!desktop || reduced || failed) return;
    let cancelled = false;
    import("./galaxy-renderer").then(({ mountGalaxy }) => {
      if (cancelled || !canvasRef.current) return;
      const region = canvasRef.current.closest<HTMLElement>("[data-landing-journey]");
      if (!region) return;
      try {
        runtime.current = mountGalaxy(canvasRef.current, region, () => setFailed(true));
        setReady(true);
      } catch { setFailed(true); }
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; runtime.current?.dispose(); runtime.current = null; setReady(false); };
  }, [desktop, reduced, failed]);
  const live = ready && desktop && !reduced && !failed;
  return (
    <>
      <div className={styles.scene} data-scene-state={failed ? "fallback" : live ? "ready" : "still"}>
        <div className={styles.poster} aria-hidden="true" />
        <canvas ref={canvasRef} className={styles.canvas} style={{ opacity: live ? 1 : 0 }} aria-hidden="true" />
        <div className={styles.scrim} aria-hidden="true" />
      </div>
    </>
  );
}
