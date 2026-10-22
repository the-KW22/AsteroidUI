"use client";

import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

type SwitchProps = Omit<React.ComponentProps<typeof BaseSwitch.Root>, "size"> & {
  size?: "sm" | "default" | "lg";
  variant?: "solid" | "soft";
  animation?: "none" | "guided-glide";
};

const sizes = {
  sm: { root: "h-5 w-8", thumb: "size-3.5" },
  default: { root: "h-6 w-10", thumb: "size-4.5" },
  lg: { root: "h-7 w-12", thumb: "size-5.5" },
};

const Switch = React.forwardRef<HTMLElement, SwitchProps>(
  ({ className, size = "default", variant = "solid", animation = "none", disabled, readOnly, ...props }, ref) => (
    <BaseSwitch.Root
      {...props}
      disabled={disabled}
      readOnly={readOnly}
      data-animation={animation}
      ref={ref}
      className={(state) =>
        cn(
          "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[checked]:bg-primary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 aria-invalid:outline-destructive",
          sizes[size].root,
          variant === "soft" && "data-[checked]:bg-primary/70",
          animation !== "none" && !state.disabled && !state.readOnly && "cl-switch-motion",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      <BaseSwitch.Thumb className={cn("pointer-events-none block translate-x-0.75 rounded-full bg-background shadow-sm data-[checked]:translate-x-[calc(100%+0.0625rem)]", sizes[size].thumb, animation !== "none" && "cl-switch-thumb")} />
    </BaseSwitch.Root>
  ),
);
Switch.displayName = "Switch";

export { Switch };
