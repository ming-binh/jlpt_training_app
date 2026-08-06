import { cn } from "@/lib/utils";

export type ProgressStatusFilter = "all" | "NEW" | "LEARNING" | "MASTERED";

const OPTIONS: { key: ProgressStatusFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "NEW", label: "Chưa học" },
  { key: "LEARNING", label: "Cần học lại" },
  { key: "MASTERED", label: "Đã thuộc" },
];

export function StatusFilter({
  value,
  onChange,
}: {
  value: ProgressStatusFilter;
  onChange: (status: ProgressStatusFilter) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-card p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors",
            value === opt.key
              ? "bg-accent text-accent-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
