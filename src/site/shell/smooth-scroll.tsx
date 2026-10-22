"use client";

import { ReactLenis } from "lenis/react";

export function SmoothScroll() {
  return <ReactLenis root options={{
    autoRaf: true,
    anchors: true,
    stopInertiaOnNavigate: true,
    prevent: (node) => node.getAttribute("role") === "listbox",
  }} />;
}
