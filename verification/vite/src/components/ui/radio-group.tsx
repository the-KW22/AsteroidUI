"use client";

import * as React from "react";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type RadioGroupProps = React.ComponentProps<typeof BaseRadioGroup>;
type RadioGroupItemProps = React.ComponentProps<typeof BaseRadio.Root>;

function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <BaseRadioGroup
      {...props}
      className={(state) => cn("grid gap-2", typeof className === "function" ? className(state) : className)}
    />
  );
}

const RadioGroupItem = React.forwardRef<HTMLElement, RadioGroupItemProps>(
  ({ className, ...props }, ref) => (
    <BaseRadio.Root
      {...props}
      ref={ref}
      className={(state) =>
        cn(
          "inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-input bg-background text-primary outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[checked]:border-primary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 aria-invalid:border-destructive aria-invalid:outline-destructive",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      <BaseRadio.Indicator className="flex items-center justify-center">
        <Check className="size-2.5" aria-hidden="true" />
      </BaseRadio.Indicator>
    </BaseRadio.Root>
  ),
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
