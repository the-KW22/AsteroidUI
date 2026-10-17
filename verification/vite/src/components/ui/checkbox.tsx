"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckboxProps = React.ComponentProps<typeof BaseCheckbox.Root>;

const Checkbox = React.forwardRef<HTMLElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <BaseCheckbox.Root
      {...props}
      ref={ref}
      className={(state) =>
        cn(
          "group inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-input bg-background text-primary-foreground outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[checked]:border-primary data-[checked]:bg-primary data-[indeterminate]:border-primary data-[indeterminate]:bg-primary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 aria-invalid:border-destructive aria-invalid:outline-destructive",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      <BaseCheckbox.Indicator className="flex items-center justify-center">
        <Check className="size-3.5 group-data-[indeterminate]:hidden" aria-hidden="true" />
        <Minus className="hidden size-3.5 group-data-[indeterminate]:block" aria-hidden="true" />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
