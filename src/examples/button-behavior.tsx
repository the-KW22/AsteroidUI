"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function ButtonBehaviorExample() {
  const [actions, setActions] = useState(0);
  const [preventAction, setPreventAction] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formSubmissions, setFormSubmissions] = useState(0);
  const [status, setStatus] = useState("Ready");
  const actionRef = useRef<HTMLButtonElement>(null);

  return (
    <section aria-labelledby="native-events-title" className="space-y-4 rounded-lg border border-border p-4">
      <h3 id="native-events-title" className="font-medium">Native events and application-controlled loading</h3>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          ref={actionRef}
          animation="ripple"
          onClick={(event) => {
            if (preventAction) event.preventDefault();
            if (!event.defaultPrevented) setActions((count) => count + 1);
          }}
        >
          Record action
        </Button>
        <button type="button" onClick={() => actionRef.current?.focus()} className="rounded-md border border-border px-3 py-2 text-sm">Focus action ref</button>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={preventAction} onChange={(event) => setPreventAction(event.target.checked)} />
          Prevent action
        </label>
        <span aria-live="polite" role="status" className="text-sm">Actions: {actions}</span>
      </div>

      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setFormSubmissions((count) => count + 1);
        }}
      >
        <Button>Default action</Button>
        <Button type="submit">Submit form</Button>
        <span aria-live="polite" role="status" className="text-sm">Form submissions: {formSubmissions}</span>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          loading={loading}
          loadingLabel="Saving changes"
          onClick={() => {
            setLoading(true);
            setStatus("Saving changes");
          }}
        >
          Save changes
        </Button>
        <button type="button" onClick={() => { setLoading(false); setStatus("Save finished"); }} className="rounded-md border border-border px-3 py-2 text-sm">Finish save</button>
        <button type="button" onClick={() => { setLoading(false); setStatus("Ready"); }} className="rounded-md border border-border px-3 py-2 text-sm">Reset save</button>
        <span aria-live="polite" role="status" className="text-sm">{status}</span>
      </div>
    </section>
  );
}
