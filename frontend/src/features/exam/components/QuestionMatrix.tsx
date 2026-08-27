import { cn } from "@/lib/utils";
import { type ExamQuestion } from "@/services/exam.service";

interface QuestionMatrixProps {
  questions: ExamQuestion[];
  answers: Record<number, number>;
  activeQuestionId?: number;
  onSelectQuestion: (questionId: number) => void;
  reviewMode?: boolean;
}

export function QuestionMatrix({
  questions,
  answers,
  activeQuestionId,
  onSelectQuestion,
  reviewMode = false,
}: QuestionMatrixProps) {
  const answeredCount = Object.keys(answers).length;

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

      <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-56 overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const isAnswered = answers[q.id] !== undefined;
          const isActive = activeQuestionId === q.id;

          let btnClass = "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground";

          if (reviewMode) {
            const isCorrect = q.isCorrect;
            if (isCorrect) {
              btnClass = "border-emerald-500/40 bg-emerald-500/20 text-emerald-400 font-bold";
            } else {
              btnClass = "border-rose-500/40 bg-rose-500/20 text-rose-400 font-bold";
            }
          } else if (isAnswered) {
            btnClass = "border-accent/40 bg-accent/20 text-accent font-bold";
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectQuestion(q.id)}
              className={cn(
                "flex size-9 items-center justify-center rounded-xl border text-xs font-medium transition-all cursor-pointer",
                btnClass,
                isActive && "ring-2 ring-accent ring-offset-2 ring-offset-background scale-105 font-bold"
              )}
            >
              {q.questionNumber || idx + 1}
            </button>
          );
        })}
      </div>

      {!reviewMode && (
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted-foreground border-t border-border/50 pt-2.5">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-accent/80" />
            <span>Đã làm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-secondary border border-border" />
            <span>Chưa làm</span>
          </div>
        </div>
      )}
    </div>
  );
}
