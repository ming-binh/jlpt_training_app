import React from "react";
import { CheckCircle2, XCircle, Sparkles, HelpCircle } from "lucide-react";
import { type ExamQuestion } from "@/services/exam.service";
import { cn } from "@/lib/utils";

interface QuestionItemProps {
  question: ExamQuestion;
  index: number;
  selectedOption?: number | null;
  onSelectOption?: (option: number) => void;
  reviewMode?: boolean;
  onAskAi?: (question: ExamQuestion) => void;
}

export function QuestionItem({
  question,
  index,
  selectedOption,
  onSelectOption,
  reviewMode = false,
  onAskAi,
}: QuestionItemProps) {
  const options = [
    { num: 1, text: question.option1 },
    { num: 2, text: question.option2 },
    { num: 3, text: question.option3 },
    { num: 4, text: question.option4 },
  ];

  // Render question text with underlined emphasis if specified
  const renderQuestionText = () => {
    const raw = question.questionText;
    const target = question.underlinedText;

    if (target && raw.includes(target)) {
      const parts = raw.split(target);
      return (
        <span>
          {parts[0]}
          <span className="font-bold text-accent underline underline-offset-4 decoration-2">
            {target}
          </span>
          {parts.slice(1).join(target)}
        </span>
      );
    }

    // Support markdown style _word_
    if (raw.includes("_")) {
      const regex = /_([^_]+)_/g;
      const elements: (string | React.ReactNode)[] = [];
      let lastIdx = 0;
      let match;

      while ((match = regex.exec(raw)) !== null) {
        if (match.index > lastIdx) {
          elements.push(raw.substring(lastIdx, match.index));
        }
        elements.push(
          <span key={match.index} className="font-bold text-accent underline underline-offset-4 decoration-2">
            {match[1]}
          </span>
        );
        lastIdx = match.index + match[0].length;
      }
      if (lastIdx < raw.length) {
        elements.push(raw.substring(lastIdx));
      }
      return <>{elements}</>;
    }

    return <span>{raw}</span>;
  };

  return (
    <div
      id={`q-${question.id}`}
      className={cn(
        "rounded-3xl border p-6 transition-all duration-200 bg-card/60 backdrop-blur-sm",
        reviewMode
          ? question.isCorrect
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-rose-500/30 bg-rose-500/5"
          : selectedOption !== undefined && selectedOption !== null
          ? "border-accent/40 shadow-sm"
          : "border-border/80"
      )}
    >
      {/* Header with question number and status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-xl bg-secondary font-mono text-xs font-bold text-foreground">
            {question.questionNumber || index + 1}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Câu {question.questionNumber || index + 1}
          </span>
        </div>

        {reviewMode && (
          <div className="flex items-center gap-2">
            {question.isCorrect ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="size-3.5" /> Chính xác
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30">
                <XCircle className="size-3.5" /> Chưa đúng
              </span>
            )}

            {onAskAi && (
              <button
                type="button"
                onClick={() => onAskAi(question)}
                className="flex items-center gap-1 text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/30 hover:bg-accent/20 transition-all cursor-pointer"
                title="Hỏi trợ lý AI giải thích câu này"
              >
                <Sparkles className="size-3.5 text-accent animate-pulse" />
                <span>Hỏi AI</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Question Content */}
      <div className="text-base sm:text-lg font-medium text-foreground leading-relaxed jp mb-6 pl-1">
        {renderQuestionText()}
      </div>

      {/* 4 Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isChosen = selectedOption === opt.num;
          const isCorrectAnswer = reviewMode && question.correctOption === opt.num;
          const isWrongChosen = reviewMode && isChosen && !question.isCorrect;

          let btnClass = "border-border/70 bg-secondary/30 text-foreground hover:bg-secondary/70 hover:border-border";

          if (reviewMode) {
            if (isCorrectAnswer) {
              btnClass = "border-emerald-500 bg-emerald-500/15 text-emerald-300 font-bold ring-1 ring-emerald-500/40";
            } else if (isWrongChosen) {
              btnClass = "border-rose-500 bg-rose-500/15 text-rose-300 line-through font-semibold ring-1 ring-rose-500/40";
            } else {
              btnClass = "border-border/40 bg-secondary/10 text-muted-foreground opacity-60";
            }
          } else if (isChosen) {
            btnClass = "border-accent bg-accent/15 text-accent font-bold ring-2 ring-accent/30 shadow-sm";
          }

          return (
            <button
              key={opt.num}
              type="button"
              disabled={reviewMode}
              onClick={() => onSelectOption && onSelectOption(opt.num)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3.5 text-left text-sm transition-all duration-150 cursor-pointer disabled:cursor-default",
                btnClass
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold transition-all",
                  isChosen || isCorrectAnswer
                    ? "border-transparent bg-accent text-accent-foreground"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                {opt.num}
              </span>
              <span className="jp font-medium leading-normal break-words flex-1">
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation Box in Review Mode */}
      {reviewMode && question.explanation && (
        <div className="mt-5 rounded-2xl border border-accent/20 bg-accent/5 p-4 text-xs leading-relaxed text-foreground">
          <div className="flex items-center gap-1.5 font-bold text-accent mb-1.5">
            <HelpCircle className="size-4" />
            <span>Lời giải chi tiết & Dịch câu:</span>
          </div>
          <p className="whitespace-pre-line text-muted-foreground pl-5 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
