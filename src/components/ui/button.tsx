"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-clip-padding font-sans text-sm font-medium transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        ghost: "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "h-auto rounded-none border-0 bg-transparent p-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-9 px-4 py-1",
        sm: "min-h-8 rounded-sm px-3 py-1 text-xs",
        lg: "min-h-10 rounded-lg px-6 py-2",
        icon: "size-9 shrink-0 p-0",
        "icon-sm": "size-8 shrink-0 rounded-sm p-0",
        "icon-lg": "size-10 shrink-0 rounded-lg p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    animation?: "none" | "press" | "lift" | "highlight" | "ripple" | "inset";
    loading?: boolean;
    loadingLabel?: string;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation = "none",
      loading = false,
      loadingLabel = "Loading",
      disabled = false,
      type = "button",
      children,
      onClick,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      ...props
    },
    ref,
  ) => {
    const [ripple, setRipple] = React.useState<{ key: number; x: number; y: number } | null>(null);
    const rippleKey = React.useRef(0);
    const pointerFeedbackAllowed = React.useRef(false);
    const isDisabled = disabled || loading;

    React.useEffect(() => {
      if (!ripple) return;
      const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
      const clearReducedRipple = () => {
        if (motionPreference.matches) setRipple(null);
      };
      motionPreference.addEventListener("change", clearReducedRipple);
      return () => motionPreference.removeEventListener("change", clearReducedRipple);
    }, [ripple]);

    return (
      <BaseButton
        {...props}
        ref={ref}
        type={type}
        disabled={isDisabled}
        focusableWhenDisabled={loading && !disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-busy={loading || undefined}
        data-animation={animation}
        data-loading={loading || undefined}
        className={cn(buttonVariants({ variant, size }), "cl-button", className)}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          pointerFeedbackAllowed.current = !event.defaultPrevented;
        }}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          if (event.defaultPrevented) pointerFeedbackAllowed.current = false;
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
        }}
        onPointerCancel={(event) => {
          pointerFeedbackAllowed.current = false;
          props.onPointerCancel?.(event);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (animation !== "ripple" || event.defaultPrevented || isDisabled) return;
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

          const rect = event.currentTarget.getBoundingClientRect();
          const pointer = event.detail > 0;
          if (pointer && !pointerFeedbackAllowed.current) return;
          const x = pointer ? event.clientX - rect.left : rect.width / 2;
          const y = pointer ? event.clientY - rect.top : rect.height / 2;
          pointerFeedbackAllowed.current = false;
          rippleKey.current += 1;
          setRipple({ key: rippleKey.current, x, y });
        }}
      >
        <span className="cl-button__content">
          <span className="cl-button__idle" aria-hidden={loading || undefined}>{children}</span>
          <span
            className="cl-button__pending"
            aria-hidden={ariaLabel !== undefined || ariaLabelledby !== undefined ? true : undefined}
          >
            <Spinner decorative size={16} />
            <span className={size?.startsWith("icon") ? "sr-only" : undefined}>{loadingLabel}</span>
          </span>
        </span>
        {animation === "ripple" && ripple && !isDisabled && (
          <span
            key={ripple.key}
            aria-hidden="true"
            className="cl-button__ripple"
            style={{ "--ripple-x": `${ripple.x}px`, "--ripple-y": `${ripple.y}px` } as React.CSSProperties}
            onAnimationEnd={() => setRipple(null)}
          />
        )}
      </BaseButton>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
