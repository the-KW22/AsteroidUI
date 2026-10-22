"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const subscribe = () => () => {};

export function ThemeSelect({ id = "appearance" }: { id?: string }) {
  const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="text-sm font-medium">
        Appearance
      </label>
      <select
        id={id}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        disabled={!mounted}
        value={mounted ? theme ?? "system" : "system"}
        onChange={(event) => setTheme(event.currentTarget.value)}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
