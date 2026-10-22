"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { cn } from "@/lib/utils";

export const Select = BaseSelect.Root;

export const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof BaseSelect.Label>
>(({ className, ...props }, ref) => (
  <BaseSelect.Label
    ref={ref}
    className={(state) => cn("mb-2 block font-sans text-sm font-medium text-foreground", typeof className === "function" ? className(state) : className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

type SelectTriggerProps = Omit<React.ComponentProps<typeof BaseSelect.Trigger>, "variant"> & {
  variant?: "outline" | "filled";
  density?: "compact" | "default" | "comfortable";
};

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, variant = "outline", density = "default", ...props }, ref) => (
    <BaseSelect.Trigger
      ref={ref}
      className={(state) => cn(
        "flex w-full items-center justify-between gap-2 rounded-md border font-sans text-sm text-foreground shadow-sm outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
        density === "compact" ? "h-8 px-2.5" : density === "comfortable" ? "h-11 px-4" : "h-9 px-3",
        variant === "filled" ? "border-border bg-muted" : "border-input bg-background",
        typeof className === "function" ? className(state) : className,
      )}
      {...props}
    >
      {children}
      <ChevronDown aria-hidden="true" className="size-4 shrink-0 opacity-50" />
    </BaseSelect.Trigger>
  ),
);
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof BaseSelect.Value>
>(({ className, ...props }, ref) => (
  <BaseSelect.Value
    ref={ref}
    className={(state) => cn("min-w-0 flex-1 truncate text-left", typeof className === "function" ? className(state) : className)}
    {...props}
  />
));
SelectValue.displayName = "SelectValue";

type SelectContentProps = Omit<React.ComponentProps<typeof BaseSelect.Positioner>, "children"> & {
  children?: React.ReactNode;
  popupClassName?: string;
  animation?: "none" | "bounce-open";
};

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, popupClassName, children, animation = "none", ...props }, ref) => (
    <BaseSelect.Portal>
      <BaseSelect.Positioner
        ref={ref}
        alignItemWithTrigger={false}
        sideOffset={4}
        className={(state) => cn(
          "z-50 min-w-[var(--anchor-width)] max-w-[var(--available-width)] max-h-[var(--available-height)]",
          typeof className === "function" ? className(state) : className,
        )}
        {...props}
      >
        <BaseSelect.Popup
          className={cn(
            "cl-select-popup max-w-[var(--available-width)] max-h-[var(--available-height)] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none",
            animation === "bounce-open" && "cl-select-bounce-open",
            popupClassName,
          )}
          data-select-animation={animation}
        >
          <BaseSelect.List className="max-h-[var(--available-height)] overflow-y-auto p-1">
            {children}
          </BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  ),
);
SelectContent.displayName = "SelectContent";

export const SelectItem = React.forwardRef<
  HTMLElement,
  React.ComponentProps<typeof BaseSelect.Item>
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Item
    ref={ref}
    className={(state) => cn(
      "cl-select-option relative flex min-h-8 cursor-default select-none items-center whitespace-normal break-words rounded-sm py-1 pl-2 pr-8 font-sans text-sm text-foreground outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      typeof className === "function" ? className(state) : className,
    )}
    {...props}
  >
    <BaseSelect.ItemText className="min-w-0 flex-1">{children}</BaseSelect.ItemText>
    <BaseSelect.ItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
      <Check aria-hidden="true" className="size-4" />
    </BaseSelect.ItemIndicator>
  </BaseSelect.Item>
));
SelectItem.displayName = "SelectItem";
