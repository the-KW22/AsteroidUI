"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

export function ChoicesExample() {
  const [checked, setChecked] = React.useState(true);
  const [radio, setRadio] = React.useState("comfortable");
  const [enabled, setEnabled] = React.useState(false);
  const [submitted, setSubmitted] = React.useState("");
  const checkboxRef = React.useRef<HTMLElement>(null);
  const checkboxInputRef = React.useRef<HTMLInputElement>(null);
  const [refInfo, setRefInfo] = React.useState("");

  return (
    <section aria-label="Choices examples" className="grid gap-8">
      <form
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(Array.from(new FormData(event.currentTarget).entries()).map(([name, value]) => `${name}=${value}`).join("&"));
        }}
      >
        <fieldset className="grid gap-3">
          <legend className="font-medium">Checkboxes</legend>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              id="choices-controlled-checkbox"
              name="updates"
              value="yes"
              checked={checked}
              onCheckedChange={setChecked}
              ref={checkboxRef}
              inputRef={checkboxInputRef}
              className={(state) => state.checked ? "shadow-md" : "shadow-none"}
            />
            Receive updates (controlled)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox id="choices-uncontrolled-checkbox" name="terms" value="accepted" defaultChecked />
            Accept terms (uncontrolled)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox id="choices-disabled-checkbox" disabled checked />
            Disabled checkbox
          </label>
          <span className="flex items-center gap-2 text-sm">
            <Checkbox aria-label="Partially selected items" indeterminate />
            Indeterminate checkbox
          </span>
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="font-medium">Density</legend>
          <RadioGroup aria-label="Density" name="density" value={radio} onValueChange={(value) => setRadio(String(value))}>
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="compact" /> Compact
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="comfortable" /> Comfortable
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="spacious" disabled /> Spacious (unavailable)
            </label>
          </RadioGroup>
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="font-medium">Switches</legend>
          <label className="flex items-center gap-2 text-sm">
            <Switch id="choices-controlled-switch" name="notifications" value="enabled" checked={enabled} onCheckedChange={setEnabled} />
            Notifications (controlled)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch id="choices-uncontrolled-switch" name="sync" value="enabled" defaultChecked />
            Sync settings (uncontrolled)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch aria-label="Unavailable option" disabled />
            Disabled switch
          </label>
        </fieldset>

        <button className="w-fit rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" type="submit">Submit values</button>
        <output aria-live="polite" aria-label="Submitted values" role="status">{submitted}</output>
      </form>
      <fieldset className="grid gap-3">
        <legend className="font-medium">Read-only choices</legend>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox aria-label="Read-only checkbox" checked readOnly />
          Checkbox cannot be changed
        </label>
        <RadioGroup aria-label="Read-only preference" defaultValue="first" readOnly>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="first" /> First option</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="second" /> Second option</label>
        </RadioGroup>
        <label className="flex items-center gap-2 text-sm">
          <Switch aria-label="Read-only switch" checked readOnly />
          Switch cannot be changed
        </label>
      </fieldset>
      <div className="grid justify-items-start gap-2">
        <button
          className="rounded-md border border-border px-3 py-2 text-sm"
          type="button"
          onClick={() => {
            checkboxRef.current?.focus();
            const input = checkboxInputRef.current;
            setRefInfo(input ? `${input.type} input named ${input.name}` : "Checkbox input unavailable");
          }}
        >
          Focus checkbox and inspect input ref
        </button>
        <output aria-label="Checkbox ref result" role="status">{refInfo}</output>
      </div>
    </section>
  );
}
