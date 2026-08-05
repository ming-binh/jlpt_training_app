import React, { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, RotateCcw, Timer, X } from 'lucide-react';
import { AppHeader } from '@/components/common/app-header';
import { useLessonState } from '../hooks/useLessonState';
import { quizService } from '@/services/lesson.service';
import type { ContentType, JlptLevel } from '@/services/lesson.service';
import { cn } from '@/lib/utils';

interface QuizSessionPageProps {
  mode: 'practice' | 'review';
}

const MODE_CONFIG = {
  practice: {
    title: 'Luyện tập',
    exitPath: '/practice',
    backPath: '/practice',
    backLabel: 'Về trang luyện tập',
    emptyMessage: 'Không có bài luyện tập nào phù hợp. Hãy đổi trình độ hoặc loại nội dung.',
  },
  review: {
    title: 'Ôn tập',
    exitPath: '/review',
    backPath: '/review',
    backLabel: 'Về trang ôn tập',
    emptyMessage: 'Bạn đã ôn tập hết tất cả thẻ hôm nay. Quay lại sau nhé.',
  },
};

export const QuizSessionPage: React.FC<QuizSessionPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const config = MODE_CONFIG[mode];

  const {
    state,
    loadExercises,
    submitAnswer,
    revealCard,
    nextExercise,
    results,
    currentExercise,
  } = useLessonState();

  const fetchExercises = useCallback(() => {
    if (mode === 'practice') {
      const level = (searchParams.get('level') as JlptLevel) || undefined;
      const rawType = searchParams.get('type');
      const type = rawType && rawType !== 'MIXED' ? (rawType as ContentType) : undefined;
      const count = Number(searchParams.get('count')) || 10;
      return quizService.getPracticeExercises(level, type, count).then(loadExercises);
    }
    return quizService.getReviewItems().then(loadExercises);
  }, [mode, searchParams, loadExercises]);

  useEffect(() => {
    fetchExercises().catch(() => navigate(config.exitPath));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.phase !== 'complete' || results.length === 0) return;
    quizService.submitResults(
      results.map(r => ({
        exerciseId: r.exerciseId,
        userAnswer: r.userAnswer,
        correct: r.correct,
        timeMs: r.timeMs,
        entityType: r.entityType,
        entityId: r.entityId,
      }))
    ).catch(console.error);
  }, [state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFlashcardKnew = useCallback(() => {
    if (!currentExercise) return;
    submitAnswer(currentExercise.correctAnswer);
    setTimeout(nextExercise, 300);
  }, [currentExercise, submitAnswer, nextExercise]);

  const handleFlashcardDidntKnow = useCallback(() => {
    if (!currentExercise) return;
    submitAnswer('__skip__');
    setTimeout(nextExercise, 300);
  }, [currentExercise, submitAnswer, nextExercise]);

  const handleRetry = useCallback(() => {
    fetchExercises().catch(console.error);
  }, [fetchExercises]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (state.phase === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center text-sm text-muted-foreground">
          Đang tải bài tập...
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (state.exercises.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">{config.emptyMessage}</p>
          <button
            type="button"
            onClick={() => navigate(config.exitPath)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // ── Complete ─────────────────────────────────────────────────────────────
  if (state.phase === 'complete') {
    const correctCount = results.filter(r => r.correct).length;
    const wrongCount = results.length - correctCount;
    const percent = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <div className="mx-auto max-w-4xl px-4 py-10">
          <section className="surface-card relative overflow-hidden p-6 text-center sm:p-10">
            <span className="jp pointer-events-none absolute -right-4 -top-6 select-none text-[9rem] leading-none text-border/40 sm:text-[12rem]">
              結
            </span>
            <div className="relative">
              <h1 className="text-3xl font-semibold sm:text-4xl">
                {percent >= 80 ? 'Xuất sắc!' : percent >= 50 ? 'Khá tốt!' : 'Cần luyện thêm'}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Bạn trả lời đúng <span className="font-semibold text-foreground">{correctCount}</span> / {results.length} câu ({config.title})
              </p>

              <div className="mx-auto mt-6 h-2.5 max-w-md overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
              </div>
              <p className="jp mt-4 text-5xl font-semibold text-accent sm:text-6xl">{percent}%</p>

              <div className="mx-auto mt-6 grid max-w-md grid-cols-2 divide-x divide-border rounded-xl border border-border bg-card/60 py-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Đúng</p>
                  <p className="mt-1 text-lg font-semibold text-accent">{correctCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sai</p>
                  <p className="mt-1 text-lg font-semibold text-destructive">{wrongCount}</p>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
                >
                  <RotateCcw className="size-4" /> Làm lại
                </button>
                <button
                  type="button"
                  onClick={() => navigate(config.backPath)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm hover:bg-secondary"
                >
                  {config.backLabel}
                </button>
              </div>
            </div>
          </section>

          <p className="mt-9 text-[11px] uppercase tracking-widest text-muted-foreground">
            Xem lại đáp án
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {results.map((r, i) => (
              <li
                key={r.exerciseId || i}
                className={cn('rounded-xl border bg-card p-4', r.correct ? 'border-border' : 'border-destructive/40')}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'mt-0.5 grid size-6 shrink-0 place-items-center rounded-md',
                      r.correct ? 'bg-accent/15 text-accent' : 'bg-destructive/15 text-destructive',
                    )}
                  >
                    {r.correct ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Câu {i + 1}</p>
                    <p className="jp mt-0.5 text-xl">{r.question || r.correctAnswer}</p>
                    <p className="mt-1.5 text-sm">
                      <span className="text-muted-foreground">Đáp án: </span>
                      <span className="font-medium text-accent">{r.correctAnswer}</span>
                    </p>
                    {!r.correct && r.userAnswer !== '__skip__' && (
                      <p className="text-sm text-destructive">Bạn chọn: {r.userAnswer}</p>
                    )}
                    {r.explanation && (
                      <p className="jp mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
                        {r.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // ── Question ─────────────────────────────────────────────────────────────
  if (!currentExercise) return null;

  const progress = (state.currentIndex / state.exercises.length) * 100;
  const isFlashcard = currentExercise.type === 'flashcard';
  const revealed = state.answerState !== 'idle';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {config.title} · {searchParams.get('level') || 'N5–N1'}
            </p>
            <p className="mt-1 truncate text-sm">
              Câu {state.currentIndex + 1} / {state.exercises.length}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
              <Timer className="size-3.5" /> Không giới hạn
            </span>
            <button
              type="button"
              onClick={() => navigate(config.exitPath)}
              aria-label="Thoát"
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>

        <section className="surface-card mt-6 p-7 text-center">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {isFlashcard ? 'Thẻ ghi nhớ' : 'Chọn nghĩa đúng'}
          </p>
          <p className="jp mt-4 text-5xl font-semibold sm:text-6xl">{currentExercise.question}</p>
          {currentExercise.questionFurigana && (
            <p className="jp mt-2 text-sm text-accent">{currentExercise.questionFurigana}</p>
          )}

          {isFlashcard && revealed && (
            <div className="mt-6 border-t border-border pt-5">
              <p className="text-lg font-medium">{currentExercise.questionMeaning || currentExercise.correctAnswer}</p>
              {currentExercise.explanation && (
                <p className="jp mt-2 text-xs text-muted-foreground">{currentExercise.explanation}</p>
              )}
            </div>
          )}
        </section>

        {isFlashcard ? (
          revealed ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleFlashcardDidntKnow}
                className="flex-1 rounded-xl border border-destructive/40 px-5 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10"
              >
                Chưa nhớ
              </button>
              <button
                type="button"
                onClick={handleFlashcardKnew}
                className="flex-1 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground"
              >
                Đã nhớ
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={revealCard}
              className="mt-5 w-full rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-secondary"
            >
              Xem đáp án
            </button>
          )
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {(currentExercise.options ?? []).map((opt, optIdx) => {
              const isAnswer = opt.text === currentExercise.correctAnswer;
              const isPicked = state.selectedAnswer === opt.text;
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => submitAnswer(opt.text)}
                    disabled={revealed}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-4 text-left text-sm transition-all',
                      !revealed && 'hover:-translate-y-0.5 hover:border-accent/60',
                      revealed && isAnswer && 'border-accent bg-secondary text-accent',
                      revealed && isPicked && !isAnswer && 'border-destructive/70 text-destructive',
                      revealed && !isAnswer && !isPicked && 'opacity-50',
                    )}
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-md border border-border text-[11px]">
                      {revealed && isAnswer ? (
                        <Check className="size-3.5" />
                      ) : revealed && isPicked ? (
                        <X className="size-3.5" />
                      ) : (
                        String.fromCharCode(65 + optIdx)
                      )}
                    </span>
                    <span className="min-w-0 flex-1">{opt.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {!isFlashcard && revealed && (
          <div className="surface-card mt-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <p className="jp min-w-0 flex-1 text-sm text-muted-foreground">{currentExercise.explanation}</p>
            <button
              type="button"
              onClick={nextExercise}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
            >
              {state.currentIndex + 1 === state.exercises.length ? 'Xem kết quả' : 'Câu tiếp theo'}
              <ArrowRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
