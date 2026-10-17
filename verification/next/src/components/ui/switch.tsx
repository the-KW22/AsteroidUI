"use client";

import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

type SwitchProps = React.ComponentProps<typeof BaseSwitch.Root>;

const Switch = React.forwardRef<HTMLElement, SwitchProps>(
  ({ className, ...props }, ref) => (
    <BaseSwitch.Root
      {...props}
      ref={ref}
      className={(state) =>
        cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[checked]:bg-primary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 aria-invalid:outline-destructive",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      <BaseSwitch.Thumb className="pointer-events-none block size-4 translate-x-0.5 rounded-full bg-background shadow-sm data-[checked]:translate-x-[calc(100%+0.125rem)]" />
    </BaseSwitch.Root>
  ),
);
Switch.displayName = "Switch";

export { Switch };
