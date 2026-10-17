"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

function Demo({ slug }: { slug: string }) {
  const [enabled, setEnabled] = useState(false);
  if (slug === "input") return <div className="grid max-w-sm gap-2"><Label htmlFor="detail-name">Name</Label><Input id="detail-name" name="name" placeholder="Your name" /></div>;
  if (slug === "textarea") return <div className="grid max-w-sm gap-2"><Label htmlFor="detail-message">Message</Label><Textarea id="detail-message" name="message" defaultValue="Hello" /></div>;
  if (slug === "label") return <div className="grid max-w-sm gap-2"><Label htmlFor="detail-email">Email address</Label><Input id="detail-email" name="email" type="email" /></div>;
  if (slug === "checkbox") return <label className="flex items-center gap-2 text-sm"><Checkbox aria-label="Receive product updates" name="updates" value="yes" />Receive product updates</label>;
  if (slug === "radio-group") return <RadioGroup aria-label="Density" name="density" defaultValue="comfortable"><label className="flex items-center gap-2 text-sm"><RadioGroupItem value="compact" />Compact</label><label className="flex items-center gap-2 text-sm"><RadioGroupItem value="comfortable" />Comfortable</label><label className="flex items-center gap-2 text-sm"><RadioGroupItem value="spacious" />Spacious</label></RadioGroup>;
  if (slug === "select") return <div className="w-full max-w-xs"><Select name="fruit" defaultValue="apple" items={{ apple: "Apple", pear: "Pear" }}><SelectLabel>Favorite fruit</SelectLabel><SelectTrigger aria-label="Favorite fruit"><SelectValue placeholder="Choose a fruit" /></SelectTrigger><SelectContent><SelectItem value="apple">Apple</SelectItem><SelectItem value="pear">Pear</SelectItem></SelectContent></Select></div>;
  if (slug === "switch") return <label className="flex items-center gap-2 text-sm"><Switch aria-label="Notifications" name="notifications" checked={enabled} onCheckedChange={setEnabled} />Notifications</label>;
  return <Spinner label="Loading messages" />;
}

export function CatalogDemo({ slug }: { slug: string }) {
  return <div className="min-h-24 rounded-lg border border-border bg-card p-6 text-card-foreground"><Demo slug={slug} /></div>;
}

export function TextareaStates() {
  return <div className="grid max-w-sm gap-4">
    <div className="grid gap-2"><Label htmlFor="detail-disabled-message">Disabled message</Label><Textarea id="detail-disabled-message" disabled defaultValue="This field is unavailable" /></div>
    <div className="grid gap-2"><Label htmlFor="detail-invalid-message">Invalid message</Label><Textarea id="detail-invalid-message" aria-invalid="true" aria-describedby="detail-message-error" defaultValue="Review this message" /><p id="detail-message-error" className="text-sm text-destructive">Example error message.</p></div>
  </div>;
}
