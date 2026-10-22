"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ButtonAsyncExample() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("No changes saved yet.");

  async function saveChanges() {
    setSaving(true);
    setMessage("Saving your changes.");
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    setSaving(false);
    setMessage("Your changes are saved.");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={(event) => { event.preventDefault(); void saveChanges(); }} className="flex flex-wrap gap-3">
        <Button type="submit" loading={saving} loadingLabel="Saving">Save changes</Button>
        <Button type="button" variant="outline" disabled={saving} onClick={() => setMessage("Draft kept for later.")}>Keep as draft</Button>
      </form>
      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
