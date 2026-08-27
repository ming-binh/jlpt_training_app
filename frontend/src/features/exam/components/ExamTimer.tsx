import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamTimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
  onTick?: (secondsRemaining: number) => void;
  isPaused?: boolean;
}

export function ExamTimer({ initialMinutes, onTimeUp, onTick, isPaused = false }: ExamTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialMinutes * 60);

  useEffect(() => {
    setSecondsRemaining(initialMinutes * 60);
  }, [initialMinutes]);

  useEffect(() => {
    if (isPaused) return;

    if (secondsRemaining <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        if (onTick) onTick(next);
        if (next <= 0) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, isPaused, onTimeUp, onTick]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isUrgent = secondsRemaining < 300; // Under 5 minutes
  const isCritical = secondsRemaining < 60; // Under 1 minute

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
