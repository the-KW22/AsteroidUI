"use client";

import * as React from "react";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type RadioGroupProps = React.ComponentProps<typeof BaseRadioGroup>;
type RadioGroupItemProps = Omit<React.ComponentProps<typeof BaseRadio.Root>, "size"> & {
  size?: "sm" | "default" | "lg";
  variant?: "solid" | "soft";
  animation?: "none" | "center-fill";
};

const sizes = { sm: "size-3.5", default: "size-4", lg: "size-5" };

function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <BaseRadioGroup
      {...props}
      className={(state) => cn("grid gap-2", typeof className === "function" ? className(state) : className)}
    />
  );
}

const RadioGroupItem = React.forwardRef<HTMLElement, RadioGroupItemProps>(
  ({ className, size = "default", variant = "solid", animation = "none", disabled, readOnly, ...props }, ref) => (
    <BaseRadio.Root
      {...props}
      disabled={disabled}
      readOnly={readOnly}
      ref={ref}
      className={(state) =>
        cn(
          "inline-flex shrink-0 items-center justify-center rounded-full border border-input bg-background text-primary outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[checked]:border-primary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 aria-invalid:border-destructive aria-invalid:outline-destructive",
          sizes[size],
          variant === "soft" && "data-[checked]:border-primary/50 data-[checked]:bg-primary/15",
          animation === "center-fill" && "choice-radio",
          animation === "center-fill" && (state.disabled || state.readOnly) && "choice-radio--still",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      <BaseRadio.Indicator
        keepMounted={animation === "center-fill"}
        className={cn("flex items-center justify-center", animation === "center-fill" && "size-full")}
      >
        {animation === "center-fill" ? (
          <span className="choice-radio__indicator" aria-hidden="true">
            <span className="choice-radio__center" />
            <span className="choice-radio__ring" />
          </span>
        ) : (
          <Check className={cn("size-2.5", size === "sm" && "size-2", size === "lg" && "size-3")} aria-hidden="true" />
        )}
      </BaseRadio.Indicator>
    </BaseRadio.Root>
  ),
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
