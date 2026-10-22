"use client";

import { useEffect, useRef } from "react";
import styles from "./component-directory.module.css";

export function DirectoryStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    function draw() {
      if (!canvas || !context) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      let seed = 20261020;
      const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
      for (let index = 0; index < 1700; index++) {
        const angle = random() * Math.PI * 2;
        const distance = Math.sqrt(random());
        const x = width * .69 + Math.cos(angle) * distance * width * .38;
        const y = height * .36 + Math.sin(angle) * distance * height * .36;
        const radius = random() > .94 ? 1.2 : .5;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(222, 228, 236, ${.09 + random() * .35})`;
        context.fill();
      }
    }

    window.addEventListener("resize", draw);
    draw();
    return () => {
      window.removeEventListener("resize", draw);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.stars} aria-hidden="true" />;
}
