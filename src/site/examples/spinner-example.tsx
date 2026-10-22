import { Spinner } from "@/components/ui/spinner";

export function SpinnerExample() {
  return (
    <div className="flex flex-wrap items-start gap-8">
      {[16, 20, 24].map((size) => (
        <div className="flex items-center gap-2" key={size}>
          <Spinner size={size} decorative />
          <span className="text-sm">{size}px</span>
        </div>
      ))}
      <Spinner label="Loading messages" style={{ color: "var(--primary)" }} />
      <Spinner label="Uploading" style={{ color: "var(--destructive)" }} />
    </div>
  );
}
