"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function FieldsExample() {
  const [name, setName] = React.useState("");
  const [results, setResults] = React.useState("No submission yet");
  const nameRef = React.useRef<HTMLInputElement>(null);
  const messageRef = React.useRef<HTMLTextAreaElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResults(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())));
  }

  return (
    <section aria-label="Fields examples" className="grid max-w-xl gap-6 rounded-lg border border-border bg-card p-6 text-card-foreground">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="fields-name">Name</Label>
          <Input
            id="fields-name"
            ref={nameRef}
            name="name"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            aria-describedby="fields-name-help"
          />
          <p id="fields-name-help" className="text-sm text-muted-foreground">Enter your display name.</p>
          <button className="w-fit text-sm underline underline-offset-4" type="button" onClick={() => nameRef.current?.focus()}>
            Focus name field
          </button>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fields-message">Message</Label>
          <Textarea ref={messageRef} id="fields-message" name="message" defaultValue="Hello" aria-describedby="fields-message-help" />
          <p id="fields-message-help" className="text-sm text-muted-foreground">This field can be resized vertically.</p>
          <button className="w-fit text-sm underline underline-offset-4" type="button" onClick={() => messageRef.current?.focus()}>
            Focus message field
          </button>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fields-readonly">Read-only value</Label>
          <Input id="fields-readonly" name="readonly" value="Cannot edit" readOnly />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fields-readonly-message">Read-only message</Label>
          <Textarea id="fields-readonly-message" name="readonlyMessage" value="Cannot edit this message" readOnly />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fields-disabled">Disabled value</Label>
          <Input id="fields-disabled" name="disabled" value="Not submitted" disabled readOnly />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fields-invalid">Invalid value</Label>
          <Input id="fields-invalid" aria-invalid="true" aria-describedby="fields-error" defaultValue="Check this value" />
          <p id="fields-error" className="text-sm text-destructive">Example error message.</p>
        </div>

        <button className="w-fit rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" type="submit">
          Submit fields
        </button>
      </form>
      <output aria-label="Submitted fields" className="break-words text-sm">{results}</output>
    </section>
  );
}
