"use client";

import { useState } from "react";

export function CodeBlock({ code, label = "code" }: { code: string; label?: string }) {
  const [status, setStatus] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Copied");
    } catch {
      setStatus("Clipboard unavailable. Select and copy the code below.");
    }
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-muted/50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <span className="min-w-0 break-all text-sm font-medium">{label}</span>
        <button type="button" aria-label={`Copy ${label}`} onClick={() => void copy()} className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Copy</button>
        <span role="status" className="w-full text-sm text-muted-foreground">{status}</span>
      </div>
      <pre tabIndex={0} role="region" aria-label={label} className="overflow-x-auto p-4 text-sm focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-ring"><code>{code}</code></pre>
    </div>
  );
}
