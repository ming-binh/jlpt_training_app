import { LEVELS, type Level } from "@/data/jlpt";
import { cn } from "@/lib/utils";

export function LevelFilter({
  value,
  onChange,
}: {
  value: Level | "all";
  onChange: (level: Level | "all") => void;
}) {
  const options: (Level | "all")[] = ["all", ...LEVELS];
  return (
    <div className="inline-flex rounded-xl border border-border bg-card p-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors",
            value === opt
              ? "bg-accent text-accent-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt === "all" ? "Tất cả" : opt}
        </button>
      ))}
    </div>
  );
}

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span className="rounded-md border border-accent/40 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-accent">
      {level}
    </span>
  );
}
