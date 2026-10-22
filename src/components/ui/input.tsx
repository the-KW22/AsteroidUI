import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input"> & {
  variant?: "outline" | "filled";
  density?: "compact" | "default" | "comfortable";
  animation?: "none" | "focus-wake";
};

export function Input({
  className,
  type = "text",
  variant = "outline",
  density = "default",
  animation = "none",
  disabled,
  readOnly,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex w-full min-w-0 rounded-md border text-base font-sans text-foreground shadow-xs outline-none placeholder:text-muted-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive md:text-sm",
        variant === "outline" && "border-input bg-background",
        variant === "filled" && "border-border bg-muted",
        density === "compact" && "h-8 px-2 py-1 text-sm md:text-sm",
        density === "default" && "h-9 px-3 py-1",
        density === "comfortable" && "h-11 px-4 py-2",
        animation === "focus-wake" && !disabled && !readOnly && ariaInvalid !== true && ariaInvalid !== "true" && "cl-field-focus-wake cl-field-focus-wake--input",
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
