"use client";

import { ArrowRight, Heart } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

const variants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const;
const sizes = ["sm", "default", "lg", "icon-sm", "icon", "icon-lg"] as const;
const animations = ["none", "compression-bloom", "light-through-glass", "precision-snap"] as const;

export function ButtonExamples() {
  return (
    <div className="space-y-8">
      <section aria-labelledby="variant-examples" className="space-y-3">
        <h3 id="variant-examples" className="font-medium">Styles</h3>
        <div className="flex flex-wrap gap-3">
          {variants.map((variant) => <Button key={variant} variant={variant}>{variant}</Button>)}
        </div>
      </section>
      <section aria-labelledby="size-examples" className="space-y-3">
        <h3 id="size-examples" className="font-medium">Sizes and icons</h3>
        <div className="flex flex-wrap items-center gap-3">
          {sizes.slice(0, 3).map((size) => <Button key={size} size={size}>Continue</Button>)}
          {sizes.slice(3).map((size) => <Button key={size} size={size} variant="outline" aria-label="Add to favorites"><Heart aria-hidden="true" /></Button>)}
          <Button><ArrowRight aria-hidden="true" /> Next step</Button>
        </div>
        <p className="text-sm text-muted-foreground">Decorative icons accompany text; icon-only buttons need an accessible name.</p>
      </section>
      <section aria-labelledby="animation-examples" className="space-y-3">
        <h3 id="animation-examples" className="font-medium">Motion presets</h3>
        <div className="flex flex-wrap gap-3">
          {animations.map((animation) => <Button key={animation} animation={animation} variant="outline">{animation}</Button>)}
        </div>
      </section>
      <section aria-labelledby="states-examples" className="space-y-3">
        <h3 id="states-examples" className="font-medium">States and navigation</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Unavailable</Button>
          <Button loading loadingLabel="Saving">Save</Button>
          <a href="#installation" className={buttonVariants({ variant: "secondary" })}>Go to installation</a>
        </div>
        <p className="text-sm text-muted-foreground">Use a native anchor for navigation and Button for actions.</p>
      </section>
    </div>
  );
}
