import * as React from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.ComponentProps<"textarea"> & {
  variant?: "outline" | "filled";
  density?: "compact" | "default" | "comfortable";
  animation?: "none" | "focus-wake";
};

export function Textarea({
  className,
  variant = "outline",
  density = "default",
  animation = "none",
  disabled,
  readOnly,
  "aria-invalid": ariaInvalid,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cn(
        "flex w-full min-w-0 resize-y rounded-md border text-base font-sans text-foreground shadow-xs outline-none placeholder:text-muted-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive md:text-sm",
        variant === "outline" && "border-input bg-background",
        variant === "filled" && "border-border bg-muted",
        density === "compact" && "min-h-16 px-2 py-1.5 text-sm md:text-sm",
        density === "default" && "min-h-20 px-3 py-2",
        density === "comfortable" && "min-h-24 px-4 py-3",
        animation === "focus-wake" && !disabled && !readOnly && ariaInvalid !== true && ariaInvalid !== "true" && "cl-field-focus-wake cl-field-focus-wake--textarea",
        animation === "focus-wake" && variant === "filled" && "cl-field-focus-wake--filled",
        className,
      )}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={ariaInvalid}
      {...props}
    />
  );
}
