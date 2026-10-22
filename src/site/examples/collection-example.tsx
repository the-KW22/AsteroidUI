"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel } from "@/components/ui/select";

const topics = [{ value: "product", label: "Product" }, { value: "engineering", label: "Engineering" }];

export function CollectionExample() {
  const [result, setResult] = useState("No submission yet");
  const [pending, setPending] = useState(false);

  return (
    <section aria-label="Collection form" className="min-w-0 space-y-4 rounded-lg border border-border bg-card p-5 text-card-foreground">
      <h2 className="text-xl font-semibold">Components together</h2>
      <p className="text-sm text-muted-foreground">An application-owned form using all nine basics. Finish the pending action to restore submission.</p>
      <form className="grid min-w-0 gap-5" onSubmit={(event) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        setResult(JSON.stringify(Object.fromEntries(values)));
        setPending(true);
      }}>
        <div className="grid gap-2"><Label htmlFor="collection-name">Name</Label><Input id="collection-name" name="name" defaultValue="Alex" required /></div>
        <div className="grid gap-2"><Label htmlFor="collection-notes">Notes</Label><Textarea id="collection-notes" name="notes" defaultValue="A shared foundation" /></div>
        <div className="grid gap-2">
          <Select name="topic" items={topics} defaultValue="product">
            <SelectLabel>Topic</SelectLabel>
            <SelectTrigger className="w-full"><SelectValue placeholder="Choose a topic" /></SelectTrigger>
            <SelectContent>{topics.map((topic) => <SelectItem key={topic.value} value={topic.value}>{topic.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <fieldset className="grid gap-2"><legend className="mb-2 text-sm font-medium">Delivery</legend>
          <RadioGroup name="delivery" defaultValue="weekly" aria-label="Delivery" className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="weekly" />Weekly</label>
            <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="monthly" />Monthly</label>
          </RadioGroup>
        </fieldset>
        <label className="flex items-center gap-2 text-sm"><Checkbox name="terms" value="accepted" defaultChecked />Accept terms</label>
        <label className="flex items-center gap-2 text-sm"><Switch name="updates" value="enabled" defaultChecked />Email updates</label>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" loading={pending} loadingLabel="Submitting">Submit preferences</Button>
          <Button variant="outline" onClick={() => setPending(false)}>Finish submission</Button>
          {pending && <span className="inline-flex items-center gap-2 text-sm"><Spinner decorative />Pending submission</span>}
        </div>
      </form>
      <p role="status" className="break-all text-sm">{result}</p>
    </section>
  );
}
