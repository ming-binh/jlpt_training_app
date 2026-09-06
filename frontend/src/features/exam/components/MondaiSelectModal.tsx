import { useNavigate } from "react-router-dom";
import { X, Play, CheckCircle2, XCircle, ChevronRight, Sparkles } from "lucide-react";
import { type ExamItem, type ExamSection } from "@/services/exam.service";
import { formatMondaiTitle, formatExamTitle } from "../utils/examFormatters";
import { cn } from "@/lib/utils";

interface MondaiSelectModalProps {
  exam: ExamItem;
  onClose: () => void;
}

export function MondaiSelectModal({ exam, onClose }: MondaiSelectModalProps) {
  const navigate = useNavigate();

  const handleSelectMondai = (sec: ExamSection) => {
    onClose();
    navigate(`/luyen-de/${exam.id}/mondai/${sec.id}`);
  };

  const handleFullExam = () => {
    onClose();
    navigate(`/luyen-de/${exam.id}/take`);
  };

  const formattedExamTitle = formatExamTitle(exam.title);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/60">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-accent" />
              <span>Chọn Mondai Luyện Tập</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{formattedExamTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Full Exam Option */}
        <div className="p-4 border-b border-border/40 bg-secondary/10">
          <button
            type="button"
            onClick={handleFullExam}
            className="w-full flex items-center justify-between rounded-2xl border border-accent/40 bg-accent/10 hover:bg-accent/20 px-4 py-3.5 transition-all group cursor-pointer shadow-sm hover:shadow"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent/20 text-accent font-bold text-lg">
                ★
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span>Làm Toàn Bộ Đề Thi</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {exam.totalQuestions} câu · {exam.totalTimeMinutes} phút · Đầy đủ tất cả Mondai
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-accent/20 group-hover:bg-accent/30 transition-colors">
                <Play className="size-4 fill-accent text-accent" />
              </div>
              <ChevronRight className="size-4 text-accent group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Individual Mondai List */}
        <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto scrollbar-thin pr-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2">
            Luyện tập từng dạng bài (Mondai):
          </p>

          {(exam.sections || []).map((sec) => {
            const hasBestScore = sec.userBestScore !== undefined && sec.userBestScore !== null;
            const isPassed = sec.userPassed;
            const titleWithDiacritics = formatMondaiTitle(sec.title);

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleSelectMondai(sec)}
                className="w-full flex items-center justify-between rounded-2xl border border-border/70 bg-card hover:bg-secondary/60 hover:border-accent/50 px-4 py-3 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary/80 border border-border font-mono text-xs font-bold text-foreground group-hover:border-accent/40 group-hover:text-accent transition-colors">
                    {sec.mondaiNumber || "?"}
                  </span>
                  <div className="text-left truncate">
                    <p className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                      {titleWithDiacritics}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{sec.questionCount} câu hỏi</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {hasBestScore && (
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      isPassed
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    )}>
                      {isPassed
                        ? <CheckCircle2 className="size-3" />
                        : <XCircle className="size-3" />}
                      <span>{sec.userBestScore}/{sec.userMaxScore}</span>
                    </div>
                  )}
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 border-t border-border/40 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-border bg-secondary/30 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

