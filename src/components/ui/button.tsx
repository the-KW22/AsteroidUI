"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { gsap } from "gsap";
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
    animation?: "none" | "compression-bloom" | "light-through-glass" | "precision-snap";
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
      onPointerCancel,
      onKeyDown,
      onKeyUp,
      onBlur,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      ...props
    },
    ref,
  ) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const surfaceRef = React.useRef<HTMLSpanElement>(null);
    const waveRef = React.useRef<HTMLSpanElement>(null);
    const glintRef = React.useRef<HTMLSpanElement>(null);
    const edgeRef = React.useRef<HTMLSpanElement>(null);
    const motionRef = React.useRef<gsap.core.Timeline | null>(null);
    const originalTransformRef = React.useRef<string | null>(null);
    const pressedRef = React.useRef(false);
    const pointerFeedbackAllowed = React.useRef(false);
    const keyboardFeedbackAllowed = React.useRef(false);
    const originRef = React.useRef({ x: 0, y: 0 });
    const isDisabled = disabled || loading;

    React.useImperativeHandle(ref, () => buttonRef.current!, []);

    const resetMotion = React.useCallback(() => {
      motionRef.current?.kill();
      motionRef.current = null;
      pressedRef.current = false;
      pointerFeedbackAllowed.current = false;
      keyboardFeedbackAllowed.current = false;
      if (buttonRef.current && originalTransformRef.current !== null) {
        buttonRef.current.style.transform = originalTransformRef.current;
      }
      originalTransformRef.current = null;
      for (const layer of [surfaceRef.current, waveRef.current, glintRef.current, edgeRef.current]) {
        if (layer) gsap.set(layer, { clearProps: "all" });
      }
    }, []);

    React.useEffect(() => {
      const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
      const onChange = () => { if (preference.matches) resetMotion(); };
      preference.addEventListener("change", onChange);
      return () => { preference.removeEventListener("change", onChange); resetMotion(); };
    }, [resetMotion]);

    React.useEffect(() => { if (isDisabled || animation === "none") resetMotion(); }, [animation, isDisabled, resetMotion]);

    const startHold = () => {
      const button = buttonRef.current;
      const surface = surfaceRef.current;
      if (!button || !surface || animation === "none" || isDisabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      resetMotion();
      originalTransformRef.current = button.style.transform;
      pressedRef.current = true;
      const bloom = animation === "compression-bloom";
      const snap = animation === "precision-snap";
      motionRef.current = gsap.timeline()
        .to(button, { scaleX: bloom ? 1.025 : snap ? 0.96 : 0.985, scaleY: bloom ? 0.9 : snap ? 0.96 : 0.985, y: bloom ? 2 : 1, duration: snap ? 0.07 : 0.16, ease: snap ? "power4.out" : "power3.out" }, 0)
        .to(surface, { opacity: snap ? 0.35 : 0.25, duration: snap ? 0.07 : 0.16 }, 0);
    };

    const release = () => {
      const button = buttonRef.current;
      const surface = surfaceRef.current;
      if (!button || !surface || animation === "none" || isDisabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        resetMotion();
        return;
      }
      motionRef.current?.kill();
      pressedRef.current = false;
      if (originalTransformRef.current === null) originalTransformRef.current = button.style.transform;
      const timeline = gsap.timeline({ onComplete: resetMotion });
      motionRef.current = timeline;
      const bloom = animation === "compression-bloom";
      const glass = animation === "light-through-glass";
      if (bloom) {
        timeline.to(button, { scaleX: 0.985, scaleY: 1.065, y: -2, duration: 0.2, ease: "back.out(1.5)" }, 0)
          .to(button, { scaleX: 1, scaleY: 1, y: 0, duration: 0.3, ease: "elastic.out(1, 0.55)" });
      } else {
        timeline.to(button, { scaleX: 1, scaleY: 1, y: 0, duration: glass ? 0.2 : 0.11, ease: glass ? "power2.out" : "power4.out" }, 0);
      }
      timeline.to(surface, { opacity: 0, duration: bloom ? 0.28 : 0.16 }, 0);
      if (bloom && waveRef.current) {
        gsap.set(waveRef.current, { x: originRef.current.x, y: originRef.current.y, xPercent: -50, yPercent: -50, scale: 0.06, opacity: 0.32 });
        timeline.to(waveRef.current, { scale: 2.5, opacity: 0, duration: 0.48, ease: "power2.out" }, 0.02);
      }
      if (glass && glintRef.current && edgeRef.current) {
        gsap.set(glintRef.current, { xPercent: 0, opacity: 0.95 });
        timeline.to(glintRef.current, { xPercent: 300, opacity: 0, duration: 0.5, ease: "power2.out" }, 0)
          .fromTo(edgeRef.current, { opacity: 0.72 }, { opacity: 0, duration: 0.38 }, 0);
      }
      if (animation === "precision-snap" && edgeRef.current) {
        timeline.fromTo(edgeRef.current, { opacity: 0.85 }, { opacity: 0, duration: 0.16 }, 0);
      }
    };

    return (
      <BaseButton
        {...props}
        ref={buttonRef}
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
          if (event.defaultPrevented || isDisabled) { resetMotion(); return; }
          if (event.pointerType === "mouse" && event.button !== 0) return;
          startHold();
          pointerFeedbackAllowed.current = true;
          const rect = event.currentTarget.getBoundingClientRect();
          originRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        }}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          if (event.defaultPrevented) resetMotion();
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          if (pressedRef.current) resetMotion();
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          resetMotion();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.repeat || isDisabled || (event.key !== " " && event.key !== "Enter")) return;
          startHold();
          keyboardFeedbackAllowed.current = true;
          const rect = event.currentTarget.getBoundingClientRect();
          originRef.current = { x: rect.width / 2, y: rect.height / 2 };
        }}
        onKeyUp={(event) => {
          onKeyUp?.(event);
          if (event.defaultPrevented) resetMotion();
        }}
        onBlur={(event) => {
          onBlur?.(event);
          resetMotion();
        }}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || isDisabled) { resetMotion(); return; }
          if (!pointerFeedbackAllowed.current && !keyboardFeedbackAllowed.current) return;
          pointerFeedbackAllowed.current = false;
          keyboardFeedbackAllowed.current = false;
          release();
        }}
      >
        {animation !== "none" && <span className="cl-button__effects" aria-hidden="true">
          <span ref={surfaceRef} className="cl-button__surface" />
          <span ref={waveRef} className="cl-button__wave" />
          <span ref={glintRef} className="cl-button__glint" />
          <span ref={edgeRef} className="cl-button__edge" />
        </span>}
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
      </BaseButton>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
