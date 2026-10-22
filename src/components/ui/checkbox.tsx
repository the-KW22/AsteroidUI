"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckboxProps = Omit<React.ComponentProps<typeof BaseCheckbox.Root>, "size"> & {
  size?: "sm" | "default" | "lg";
  variant?: "solid" | "soft";
  animation?: "none" | "ink-mark";
};

const sizes = { sm: "size-3.5", default: "size-4", lg: "size-5" };

const Checkbox = React.forwardRef<HTMLElement, CheckboxProps>(
  ({ className, size = "default", variant = "solid", animation = "none", disabled, readOnly, ...props }, ref) => (
    <BaseCheckbox.Root
      {...props}
      disabled={disabled}
      readOnly={readOnly}
      ref={ref}
      className={(state) =>
        cn(
          "group inline-flex shrink-0 items-center justify-center rounded-sm border border-input bg-background text-primary-foreground outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[checked]:border-primary data-[checked]:bg-primary data-[indeterminate]:border-primary data-[indeterminate]:bg-primary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 aria-invalid:border-destructive aria-invalid:outline-destructive",
          sizes[size],
          variant === "soft" && "data-[checked]:border-primary/50 data-[checked]:bg-primary/15 data-[checked]:text-primary data-[indeterminate]:border-primary/50 data-[indeterminate]:bg-primary/15 data-[indeterminate]:text-primary",
          animation === "ink-mark" && "choice-checkbox",
          animation === "ink-mark" && (state.disabled || state.readOnly) && "choice-checkbox--still",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      <BaseCheckbox.Indicator
        keepMounted={animation === "ink-mark"}
        className={cn(
          "flex items-center justify-center",
          animation === "ink-mark" && "choice-checkbox__indicator",
        )}
      >
        <Check className={cn("size-3.5 group-data-[indeterminate]:hidden", animation === "ink-mark" && "choice-checkbox__mark", size === "sm" && "size-3", size === "lg" && "size-4")} aria-hidden="true" />
        <Minus className={cn("hidden size-3.5 group-data-[indeterminate]:block", size === "sm" && "size-3", size === "lg" && "size-4")} aria-hidden="true" />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
