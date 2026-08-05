import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, RotateCcw, BookOpen, Check, X } from 'lucide-react';
import type { ExerciseResult } from '../types';
import { cn } from '@/lib/utils';
import './LessonComplete.css';

interface LessonCompleteProps {
  results: ExerciseResult[];
  xpEarned: number;
  lessonTitle: string;
  onRetry: () => void;
  /** Where the "back" button navigates to. Defaults to the lesson list. */
  backPath?: string;
  /** Label for the "back" button. Defaults to the lesson list label. */
  backLabel?: string;
}

export const LessonComplete: React.FC<LessonCompleteProps> = ({
  results,
  xpEarned,
  lessonTitle,
  onRetry,
  backPath = '/learn',
  backLabel = 'Về danh sách bài học',
}) => {
  const navigate = useNavigate();
  const correctCount = results.filter((r) => r.correct).length;
  const totalCount = results.length;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const getScoreTitle = () => {
    if (score >= 80) return "Xuất sắc!";
    if (score >= 50) return "Khá tốt!";
    return "Cần luyện thêm";
  };

  return (
    <div className="w-[85%] max-w-[1500px] mx-auto px-4 py-10 text-foreground animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Result Card (Sticky & Ratio 1 - 1/3 Width) */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 surface-card relative overflow-hidden p-8 py-9 text-center border border-border/80 rounded-2xl shadow-xl bg-[#121929]">
          {/* Watermark Kanji 結 */}
          <span className="jp absolute -right-4 -top-6 text-9xl text-border/15 select-none pointer-events-none font-serif">
            結
          </span>

          <span className="grid mx-auto size-16 place-items-center rounded-2xl bg-secondary/80 text-accent border border-border/60">
            <Trophy className="size-8 text-accent" />
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">{getScoreTitle()}</h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Bạn trả lời đúng <strong className="text-foreground font-bold">{correctCount}</strong> / {totalCount} câu ({lessonTitle})
          </p>

          {/* Progress Bar & Percentage */}
          <div className="mx-auto mt-6 h-2 overflow-hidden rounded-full bg-secondary/80 w-full max-w-xs">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="jp mt-3 text-5xl font-bold text-accent font-serif">{score}%</p>

          {/* 3-Column Stats Card Box */}
          <div className="mx-auto mt-6 grid w-full grid-cols-3 divide-x divide-border/60 rounded-xl border border-border/80 bg-card/60 py-3 text-center text-xs shadow-sm">
            <div>
              <p className="text-muted-foreground font-semibold">Đúng</p>
              <p className="mt-1 text-lg font-bold text-emerald-400">{correctCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold">Sai</p>
              <p className="mt-1 text-lg font-bold text-rose-400">{totalCount - correctCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold">Điểm XP</p>
              <p className="mt-1 text-lg font-bold text-accent">+{xpEarned}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground shadow-md hover:bg-accent/90 cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <RotateCcw className="size-4" />
              <span>Học lại</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(backPath)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground hover:bg-secondary cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <BookOpen className="size-4" />
              <span>{backLabel}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Answer Review Section (Ratio 2 - 2/3 Width - 2 Columns Grid) */}
        <div className="lg:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
            XEM LẠI ĐÁP ÁN
          </p>

          <ul className="grid gap-4 sm:grid-cols-2">
            {results.map((r, idx) => (
              <li
                key={r.exerciseId || idx}
                className="relative flex flex-col justify-between rounded-xl border border-border/80 bg-[#121929] p-5 shadow-sm hover:border-border transition-colors h-full"
              >
                <span
                  className={cn(
                    "absolute right-4 top-4 grid size-7 place-items-center rounded-lg text-xs font-bold",
                    r.correct
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  )}
                >
                  {r.correct ? <Check className="size-4" /> : <X className="size-4" />}
                </span>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                    CÂU {idx + 1}
                  </p>

                  {/* Japanese Question Prompt */}
                  <p className="jp mt-1 text-2xl font-bold text-foreground font-serif">
                    {r.question || r.correctAnswer || `Mục ${idx + 1}`}
                  </p>

                  <div className="mt-3 text-xs space-y-1">
                    <p className="text-muted-foreground">
                      Đáp án:{" "}
                      <span className="font-bold text-emerald-400">
                        {r.correctAnswer || (r.correct ? r.userAnswer : "Đáp án đúng")}
                      </span>
                    </p>
                    {!r.correct && (
                      <p className="text-muted-foreground">
                        Bạn chọn:{" "}
                        <span className="font-bold text-rose-400">
                          {r.userAnswer === '__skip__' ? 'Chưa nhớ / Bỏ qua' : r.userAnswer}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {r.explanation && (
                  <div className="mt-4 border-t border-border/50 pt-3">
                    <p className="jp text-xs text-muted-foreground/90 font-mono leading-relaxed">
                      {r.explanation}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
