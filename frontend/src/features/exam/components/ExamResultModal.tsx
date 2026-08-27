import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { type ExamSubmitResponse } from "@/services/exam.service";
import { cn } from "@/lib/utils";

interface ExamResultModalProps {
  result: ExamSubmitResponse;
  onClose: () => void;
  onReview: () => void;
  onRetry: () => void;
}

export function ExamResultModal({ result, onClose, onReview, onRetry }: ExamResultModalProps) {
  const isPassed = result.isPassed;
  const minutesSpent = Math.floor(result.timeSpentSeconds / 60);
  const secondsSpent = result.timeSpentSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl space-y-6 text-center overflow-hidden">
        {/* Ambient background glow */}
        <div
          className={cn(
            "absolute -top-24 left-1/2 -translate-x-1/2 size-56 rounded-full blur-3xl pointer-events-none opacity-20",
            isPassed ? "bg-emerald-500" : "bg-rose-500"
          )}
        />

        {/* Icon & Title */}
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "flex size-16 items-center justify-center rounded-3xl border shadow-lg transition-transform",
              isPassed
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-rose-500/40 bg-rose-500/10 text-rose-400"
            )}
          >
            {isPassed ? <CheckCircle2 className="size-8" /> : <XCircle className="size-8" />}
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Kết quả làm bài
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
              {isPassed ? "Chúc mừng! Bạn đã ĐẠT 🎉" : "Cần cố gắng thêm một chút 💪"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {result.sectionTitle || result.examTitle}
            </p>
          </div>
        </div>

        {/* Score Metric Card */}
        <div className="rounded-3xl border border-border/80 bg-secondary/30 p-5 grid grid-cols-3 gap-2 divide-x divide-border/60">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">Điểm số</p>
            <p className="text-2xl sm:text-3xl font-black text-foreground mt-0.5">
              {result.score} <span className="text-xs font-normal text-muted-foreground">/ {result.maxScore}</span>
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">Tỷ lệ đúng</p>
            <p
              className={cn(
                "text-2xl sm:text-3xl font-black mt-0.5",
                isPassed ? "text-emerald-400" : "text-amber-400"
              )}
            >
              {result.percentage}%
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">Thời gian</p>
            <p className="text-2xl sm:text-3xl font-black text-foreground mt-0.5">
              {minutesSpent}:{String(secondsSpent).padStart(2, "0")}
            </p>
          </div>
        </div>

        {/* XP Earned Banner */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-2xl py-2 px-4">
          <Sparkles className="size-4 animate-pulse" />
          <span>+{result.xpEarned} XP kinh nghiệm đã được cộng vào tài khoản!</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onReview}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-2xl bg-accent py-3 px-4 text-xs font-bold text-accent-foreground shadow-md shadow-accent/20 hover:bg-accent/90 transition-all cursor-pointer"
          >
            <span>Xem lời giải chi tiết</span>
            <ArrowRight className="size-4" />
          </button>

          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card py-3 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Làm lại</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card py-3 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <span>Đóng</span>
          </button>
        </div>
      </div>
    </div>
  );
}
