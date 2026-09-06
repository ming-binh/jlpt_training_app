import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamTimerProps {
  /** Seconds remaining — controlled from outside via useExamTimer hook */
  secondsRemaining: number;
  compact?: boolean;
}

/** Display-only timer component. State is managed by useExamTimer hook. */
export function ExamTimer({ secondsRemaining, compact = false }: ExamTimerProps) {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isUrgent = secondsRemaining < 300;
  const isCritical = secondsRemaining < 60;

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-xl border px-2.5 py-1 font-mono text-xs font-bold transition-all",
          isCritical
            ? "border-rose-500/50 bg-rose-500/15 text-rose-400 animate-pulse"
            : isUrgent
            ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
            : "border-border/80 bg-card/80 text-foreground"
        )}
      >
        {isUrgent ? (
          <AlertTriangle className="size-3 text-amber-400" />
        ) : (
          <Clock className="size-3 text-accent" />
        )}
        <span>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border px-4 py-2 font-mono text-sm font-bold shadow-sm transition-all",
        isCritical
          ? "border-rose-500/50 bg-rose-500/15 text-rose-400 animate-pulse"
          : isUrgent
          ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
          : "border-border/80 bg-card/80 text-foreground"
      )}
    >
      {isUrgent ? (
        <AlertTriangle className="size-4 text-amber-400 animate-bounce" />
      ) : (
        <Clock className="size-4 text-accent" />
      )}
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
