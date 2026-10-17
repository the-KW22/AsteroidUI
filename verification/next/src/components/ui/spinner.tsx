import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  decorative?: boolean;
};

export function Spinner({
  size = 16,
  className,
  style,
  label = "Loading",
  decorative = false,
}: SpinnerProps) {
  const validSize = Number.isFinite(size) && size > 0 ? size : 16;
  const icon = (
    <LoaderCircle
      aria-hidden="true"
      className="animate-spin motion-reduce:animate-none"
      size={validSize}
      strokeWidth={2}
      style={{ color: "currentColor", ...style }}
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
