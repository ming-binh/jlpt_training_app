import { Link } from "react-router-dom";
import { Clock, HelpCircle, CheckCircle2, XCircle, ArrowRight, Play, Layers } from "lucide-react";
import { type ExamItem } from "@/services/exam.service";
import { LevelBadge } from "@/components/common/level-filter";
import { cn } from "@/lib/utils";

interface ExamCardProps {
  exam: ExamItem;
}

export function ExamCard({ exam }: ExamCardProps) {
  const hasAttempted = exam.userAttemptCount !== undefined && exam.userAttemptCount > 0;
  const isPassed = exam.userPassed;
  const bestScore = exam.userBestScore;
  const maxScore = exam.userMaxScore;
  const pct = maxScore && maxScore > 0 && bestScore !== undefined && bestScore !== null
    ? Math.round((bestScore / maxScore) * 100)
    : null;

  return (
    <div className="group relative rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 flex flex-col justify-between overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -right-20 -top-20 size-48 rounded-full bg-accent/5 blur-3xl group-hover:bg-accent/10 transition-all pointer-events-none" />

      <div>
        {/* Top Header info */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <LevelBadge level={exam.jlptLevel} />
            {exam.year && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary/80 text-muted-foreground">
                T{exam.month}/{exam.year}
              </span>
            )}
          </div>

          {hasAttempted && (
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border",
              isPassed
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
            )}>
              {isPassed ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
              <span>{isPassed ? "ĐẠT" : "CHƯA ĐẠT"}</span>
              {pct !== null && <span className="font-mono ml-0.5">({pct}%)</span>}
            </div>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
          {exam.title}
        </h3>
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {exam.description || "Bộ đề thi chính thức kèm đáp án và giải thích chi tiết tiếng Việt."}
        </p>

        {/* Meta badges */}
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground border-y border-border/50 py-3">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="size-3.5 text-accent" />
            <span><strong className="text-foreground">{exam.totalQuestions}</strong> câu hỏi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-accent" />
            <span><strong className="text-foreground">{exam.totalTimeMinutes}</strong> phút</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="size-3.5 text-accent" />
            <span><strong className="text-foreground">{exam.sections?.length || 0}</strong> Mondai</span>
          </div>
        </div>

        {/* Sections Preview List */}
        {exam.sections && exam.sections.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-2">
              Các dạng bài thi (Mondai):
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {exam.sections.slice(0, 4).map((sec) => (
                <Link
                  key={sec.id}
                  to={`/luyen-de/${exam.id}/mondai/${sec.id}`}
                  className="group/sec flex items-center justify-between rounded-xl bg-secondary/40 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent/15 hover:text-accent transition-colors"
                >
                  <span className="truncate pr-1">Mondai {sec.mondaiNumber}</span>
                  <span className="text-[10px] opacity-70 font-mono">({sec.questionCount}c)</span>
                </Link>
              ))}
            </div>
            {exam.sections.length > 4 && (
              <p className="text-[11px] text-center text-muted-foreground/70 pt-1">
                +{exam.sections.length - 4} Mondai khác trong đề
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action CTA buttons */}
      <div className="mt-6 pt-2 flex items-center gap-2">
        <Link
          to={`/luyen-de/${exam.id}/take`}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-foreground shadow-sm shadow-accent/20 transition-all hover:bg-accent/90 hover:shadow-md cursor-pointer"
        >
          <Play className="size-3.5 fill-current" />
          <span>Làm Full Đề</span>
        </Link>

        {exam.sections && exam.sections.length > 0 && (
          <Link
            to={`/luyen-de/${exam.id}/mondai/${exam.sections[0].id}`}
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            title="Luyện từng Mondai riêng lẻ"
          >
            <span>Theo Mondai</span>
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
