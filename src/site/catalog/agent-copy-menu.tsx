"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Copy } from "lucide-react";
import styles from "./button-detail.module.css";

export function AgentCopyMenu({ plainText, markdown }: { plainText: string; markdown: string }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!detailsRef.current?.contains(event.target as Node)) detailsRef.current?.removeAttribute("open");
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  async function copy(value: string, format: string) {
    try {
      await navigator.clipboard.writeText(value);
      detailsRef.current?.removeAttribute("open");
      triggerRef.current?.focus();
      setStatus(`Copied ${format} brief`);
    } catch {
      setStatus("Clipboard unavailable. Check browser permissions and try again.");
    }
  }

  return <div className={styles.agentCopy}>
    <details ref={detailsRef} onKeyDown={event => {
      if (event.key === "Escape") { detailsRef.current?.removeAttribute("open"); triggerRef.current?.focus(); }
    }}>
      <summary ref={triggerRef} onClick={() => setStatus("")}><Copy size={15} aria-hidden="true" /> Copy for agent <ChevronDown size={15} aria-hidden="true" /></summary>
      <div className={styles.agentCopyOptions}>
        <button type="button" onClick={() => void copy(plainText, "plain-text")}>Copy as plain text</button>
        <button type="button" onClick={() => void copy(markdown, "Markdown")}>Copy as Markdown</button>
      </div>
    </details>
    <span role="status" aria-live="polite" className={styles.agentCopyStatus}>{status}</span>
  </div>;
}
