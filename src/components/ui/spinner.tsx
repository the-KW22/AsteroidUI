import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: number;
  strokeWidth?: number;
  speed?: "calm" | "default";
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  decorative?: boolean;
};

export function Spinner({
  size = 16,
  strokeWidth = 2,
  speed = "default",
  className,
  style,
  label = "Loading",
  decorative = false,
}: SpinnerProps) {
  const validSize = Number.isFinite(size) && size > 0 ? size : 16;
  const validStrokeWidth = Number.isFinite(strokeWidth) && strokeWidth > 0 ? strokeWidth : 2;
  const icon = (
    <LoaderCircle
      aria-hidden="true"
      className={cn("animate-spin motion-reduce:animate-none", speed === "calm" && "cl-spinner-calm")}
      size={validSize}
      strokeWidth={validStrokeWidth}
      style={{ color: "currentColor", animationDuration: speed === "calm" ? "2.2s" : undefined, ...style }}
    />
  );

  if (decorative) {
    return <span aria-hidden="true" className={cn("inline-flex", className)}>{icon}</span>;
  }

  return (
    <span aria-live="polite" className={cn("inline-flex items-center gap-2", className)} role="status">
      {icon}
      <span>{label}</span>
    </span>
  );
}
