import { useNavigate } from "react-router-dom";
import { Layers, Send, ChevronRight, Award } from "lucide-react";
import { type ExamItem, type ExamSection } from "@/services/exam.service";
import { ExamTimer } from "./ExamTimer";
import { QuestionMatrix } from "./QuestionMatrix";
import { formatMondaiTitle } from "../utils/examFormatters";
import { cn } from "@/lib/utils";

interface MondaiNavSidebarProps {
  exam: ExamItem;
  currentSection?: ExamSection;
  allQuestions: any[];
  answers: Record<number, number>;
  flaggedQuestions?: Set<number>;
  activeQuestionId?: number;
  onSelectQuestion: (questionId: number) => void;
  onSubmit: () => void;
  /** Seconds remaining — controlled by useExamTimer hook in parent */
  secondsRemaining: number;
  reviewMode?: boolean;
}

export function MondaiNavSidebar({
  exam,
  currentSection,
  allQuestions,
  answers,
  flaggedQuestions,
  activeQuestionId,
  onSelectQuestion,
  onSubmit,
  secondsRemaining,
  reviewMode = false,
}: MondaiNavSidebarProps) {
  const navigate = useNavigate();
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestions?.size || 0;
  const isFullExam = !currentSection;

  return (
    <div className="space-y-4">
      {/* Sticky Header Box: Active Mondai & Timer & Submit */}
      <div className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl p-5 shadow-lg space-y-4">
        {/* Title */}
        <div className="flex items-center gap-2 text-accent font-bold text-sm">
          <Layers className="size-4 shrink-0" />
          <span className="truncate">
            {currentSection ? formatMondaiTitle(currentSection.title) : "Toàn bộ đề thi"}
          </span>
        </div>

        {/* Progress & Timer Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-secondary text-muted-foreground">
              Đã làm <strong className="text-foreground">{answeredCount}</strong>/{allQuestions.length} câu
            </span>
            {flaggedCount > 0 && (
              <p className="text-[10px] text-amber-400 font-semibold pl-1">
                🚩 {flaggedCount} câu đã gắn cờ
              </p>
            )}
          </div>

          {!reviewMode && (
            <ExamTimer secondsRemaining={secondsRemaining} />
          )}
        </div>

        {/* Submit Action Button */}
        {!reviewMode && (
          <button
            type="button"
            onClick={onSubmit}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-bold text-accent-foreground shadow-md shadow-accent/20 transition-all hover:bg-accent/90 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Send className="size-4" />
            <span>Nộp bài</span>
          </button>
        )}
      </div>

      {/* Question Matrix */}
      <QuestionMatrix
        questions={allQuestions}
        answers={answers}
        flaggedQuestions={flaggedQuestions}
        activeQuestionId={activeQuestionId}
        onSelectQuestion={onSelectQuestion}
        reviewMode={reviewMode}
      />

      {/* Sections Accordion / Navigation list in current exam */}
      {exam.sections && exam.sections.length > 0 && (
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            <Award className="size-3.5 text-accent" />
            <span>Các Mondai trong đề</span>
          </div>

          <div className="space-y-1">
            {/* Full Exam Link */}
            <button
              type="button"
              onClick={() => navigate(`/luyen-de/${exam.id}/take`)}
              className={cn(
                "w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors text-left cursor-pointer",
                isFullExam
                  ? "bg-accent/15 text-accent font-bold border border-accent/30"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <span>★ Toàn bộ đề thi ({exam.totalQuestions} câu)</span>
              <ChevronRight className="size-3.5 opacity-50" />
            </button>

            {/* Individual Mondai Sections */}
            {exam.sections.map((sec) => {
              const isCurrent = currentSection?.id === sec.id;
              const hasScore = sec.userBestScore !== undefined && sec.userBestScore !== null;
              const titleWithDiacritics = formatMondaiTitle(sec.title);

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => navigate(`/luyen-de/${exam.id}/mondai/${sec.id}`)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors text-left cursor-pointer",
                    isCurrent
                      ? "bg-accent/15 text-accent font-bold border border-accent/30"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 truncate pr-1">
                    <span className="truncate">{titleWithDiacritics}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {hasScore && (
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                        sec.userPassed ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                      )}>
                        {sec.userBestScore}/{sec.userMaxScore}
                      </span>
                    )}
                    <span className="text-[10px] opacity-60 font-mono">({sec.questionCount}c)</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

