import { cn } from "@/lib/utils";
import { type ExamQuestion } from "@/services/exam.service";

interface QuestionMatrixProps {
  questions: ExamQuestion[];
  answers: Record<number, number>;
  flaggedQuestions?: Set<number>;
  activeQuestionId?: number;
  onSelectQuestion: (questionId: number) => void;
  reviewMode?: boolean;
}

export function QuestionMatrix({
  questions,
  answers,
  flaggedQuestions,
  activeQuestionId,
  onSelectQuestion,
  reviewMode = false,
}: QuestionMatrixProps) {
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestions?.size || 0;

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Danh sách câu hỏi
        </span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-foreground">
          {answeredCount} / {questions.length}
        </span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1 scrollbar-thin">
        {questions.map((q, idx) => {
          const isAnswered = answers[q.id] !== undefined;
          const isActive = activeQuestionId === q.id;
          const isFlagged = flaggedQuestions?.has(q.id) ?? false;

          let btnClass = "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground";

          if (reviewMode) {
            const isCorrect = q.isCorrect;
            if (isCorrect) {
              btnClass = "border-emerald-500/40 bg-emerald-500/20 text-emerald-400 font-bold";
            } else {
              btnClass = "border-rose-500/40 bg-rose-500/20 text-rose-400 font-bold";
            }
          } else if (isAnswered) {
            btnClass = isFlagged
              ? "border-amber-500/60 bg-amber-500/20 text-amber-400 font-bold"
              : "border-accent/50 bg-accent/20 text-accent font-bold";
          } else if (isFlagged) {
            btnClass = "border-amber-500/50 bg-amber-500/10 text-amber-400 font-bold";
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectQuestion(q.id)}
              className={cn(
                "relative flex size-9 items-center justify-center rounded-xl border text-xs font-medium transition-all cursor-pointer",
                btnClass,
                isActive && "border-accent bg-accent/25 text-accent font-extrabold shadow-[0_0_0_2px_rgba(245,158,11,0.7)] z-10"
              )}
            >
              {q.questionNumber || idx + 1}
              {isFlagged && !reviewMode && (
                <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-amber-400 border-2 border-background" />
              )}
            </button>
          );
        })}
      </div>

      {!reviewMode && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground border-t border-border/50 pt-2.5">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-accent/80" />
            <span>Đã làm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-secondary border border-border" />
            <span>Chưa làm</span>
          </div>
          {flaggedCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span>Đã gắn cờ</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

