import { Lock } from 'lucide-react';
import { LEVELS, LEVELS_SHORT, type Level } from "@/data/jlpt";
import { cn } from "@/lib/utils";
import { useLevelConfig } from "@/hooks/useLevelConfig";
import { toast } from "@/components/ui/toast";

function LevelFilterBase({
  value,
  onChange,
  levels,
  allowInactive = false,
}: {
  value: Level | "all";
  onChange: (level: Level | "all") => void;
  levels: (Level | "all")[];
  allowInactive?: boolean;
}) {
  const { isLevelActive } = useLevelConfig();

  const handleSelect = (opt: Level | "all") => {
    if (opt !== "all" && !allowInactive && !isLevelActive(opt)) {
      toast.info(`Trình độ ${opt} đang được hoàn thiện nội dung và sẽ sớm ra mắt!`);
      return;
    }
    onChange(opt);
  };

  return (
    <div className="inline-flex flex-wrap rounded-xl border border-border bg-card p-1 gap-0.5 shadow-sm">
      {levels.map((opt) => {
        const isActive = opt === "all" || isLevelActive(opt);
        const isSelected = value === opt;

        return (
          <button
            key={opt}
            type="button"
            onClick={() => handleSelect(opt)}
            className={cn(
              "relative inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-all",
              isSelected
                ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                : isActive
                ? "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                : "text-muted-foreground/60 hover:text-muted-foreground bg-secondary/20 cursor-pointer"
            )}
          >
            <span>{opt === "all" ? "Tất cả" : opt}</span>
            {!isActive && (
              <span className="flex items-center text-[10px] text-amber-400" title="Đang hoàn thiện / Sắp ra mắt">
                <Lock className="size-2.5 ml-0.5 opacity-80" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Dùng cho Từ vựng & Kanji (N5–N3 hoặc theo cấu hình) */
export function LevelFilter({
  value,
  onChange,
  allowInactive,
}: {
  value: Level | "all";
  onChange: (level: Level | "all") => void;
  allowInactive?: boolean;
}) {
  return (
    <LevelFilterBase
      value={value}
      onChange={onChange}
      levels={["all", ...LEVELS_SHORT]}
      allowInactive={allowInactive}
    />
  );
}

/** Dùng cho Ngữ pháp (N5–N1) */
export function GrammarLevelFilter({
  value,
  onChange,
  allowInactive,
}: {
  value: Level | "all";
  onChange: (level: Level | "all") => void;
  allowInactive?: boolean;
}) {
  return (
    <LevelFilterBase
      value={value}
      onChange={onChange}
      levels={["all", ...LEVELS]}
      allowInactive={allowInactive}
    />
  );
}

export function LevelBadge({ level }: { level: string }) {
  return (
    <span className="rounded-md border border-accent/40 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-accent">
      {level}
    </span>
  );
}
