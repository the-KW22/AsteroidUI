import * as React from "react";
import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<"label"> & {
  size?: "sm" | "default";
  emphasis?: "normal" | "strong";
};

export function Label({ className, size = "default", emphasis = "normal", ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "font-sans leading-none text-foreground",
        size === "sm" ? "text-xs" : "text-sm",
        emphasis === "normal" ? "font-medium" : "font-semibold",
        className,
      )}
      {...props}
    />
  );
}
