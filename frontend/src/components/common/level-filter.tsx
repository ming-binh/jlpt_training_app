import { LEVELS, LEVELS_SHORT, type Level } from "@/data/jlpt";
import { cn } from "@/lib/utils";

function LevelFilterBase({
  value,
  onChange,
  levels,
}: {
  value: Level | "all";
  onChange: (level: Level | "all") => void;
  levels: (Level | "all")[];
}) {
  return (
    <div className="inline-flex flex-wrap rounded-xl border border-border bg-card p-1 gap-0.5">
      {levels.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors",
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

/** Dùng cho Từ vựng & Kanji (N5–N3) */
export function LevelFilter({
  value,
  onChange,
}: {
  value: Level | "all";
  onChange: (level: Level | "all") => void;
}) {
  return <LevelFilterBase value={value} onChange={onChange} levels={["all", ...LEVELS_SHORT]} />;
}

/** Dùng cho Ngữ pháp (N5–N1) */
export function GrammarLevelFilter({
  value,
  onChange,
}: {
  value: Level | "all";
  onChange: (level: Level | "all") => void;
}) {
  return <LevelFilterBase value={value} onChange={onChange} levels={["all", ...LEVELS]} />;
}

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span className="rounded-md border border-accent/40 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-accent">
      {level}
    </span>
  );
}
