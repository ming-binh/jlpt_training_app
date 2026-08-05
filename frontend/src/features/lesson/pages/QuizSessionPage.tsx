import React, { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppHeader } from '@/components/common/app-header';
import { ExerciseProgress } from '../components/ExerciseProgress';
import { FlashCard } from '../components/FlashCard';
import { MultipleChoice } from '../components/MultipleChoice';
import { FillBlank } from '../components/FillBlank';
import { LessonComplete } from '../components/LessonComplete';
import { useLessonState } from '../hooks/useLessonState';
import { quizService } from '@/services/lesson.service';
import type { ContentType, JlptLevel } from '@/services/lesson.service';
import './LessonPage.css';

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
    emptyMessage: 'Bạn đã ôn tập hết tất cả thẻ hôm nay. Quay lại sau nhé!',
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
    score,
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

  // Submit results when session finishes
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
    setTimeout(nextExercise, 400);
  }, [currentExercise, submitAnswer, nextExercise]);

  const handleFlashcardDidntKnow = useCallback(() => {
    if (!currentExercise) return;
    submitAnswer('__skip__');
    setTimeout(nextExercise, 400);
  }, [currentExercise, submitAnswer, nextExercise]);

  const handleRetry = useCallback(() => {
    fetchExercises().catch(console.error);
  }, [fetchExercises]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state.phase === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <div className="lesson-page-loading">
          <div className="lesson-loading-spinner" />
          <p>Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  // ── Empty (no exercises returned) ─────────────────────────────────────────
  if (state.exercises.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <div className="lesson-page-loading">
          <p>{config.emptyMessage}</p>
          <button
            type="button"
            className="mt-4 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground"
            onClick={() => navigate(config.exitPath)}
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // ── Complete ───────────────────────────────────────────────────────────────
  if (state.phase === 'complete') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <div className="lesson-page-complete">
          <LessonComplete
            results={results}
            xpEarned={Math.round(score / 10) * 5}
            lessonTitle={config.title}
            onRetry={handleRetry}
            backPath={config.backPath}
            backLabel={config.backLabel}
          />
        </div>
      </div>
    );
  }

  // ── Exercise ───────────────────────────────────────────────────────────────
  if (!currentExercise) return null;

  const correctCount = results.filter(r => r.correct).length;
  const categoryStr = currentExercise.entityType === 'VOCABULARY' ? 'TỪ VỰNG' : currentExercise.entityType === 'KANJI' ? 'KANJI' : 'NGỮ PHÁP';

  return (
    <div className="lesson-page min-h-screen bg-background text-foreground">
      <AppHeader />
      <ExerciseProgress
        current={state.currentIndex}
        total={state.exercises.length}
        correctCount={correctCount}
        categoryLabel={categoryStr}
        levelLabel={searchParams.get('level') || 'N5–N3'}
        timerText="Không giới hạn"
        onExit={() => navigate(config.exitPath)}
      />

      <div className="lesson-exercise-area">
        <div className="lesson-exercise-inner">

          {currentExercise.type === 'flashcard' && (
            <FlashCard
              exercise={currentExercise}
              answerState={state.answerState}
              onReveal={revealCard}
              onKnew={handleFlashcardKnew}
              onDidntKnow={handleFlashcardDidntKnow}
            />
          )}

          {currentExercise.type === 'multiple_choice' && (
            <MultipleChoice
              exercise={currentExercise}
              selectedAnswer={state.selectedAnswer}
              answerState={state.answerState}
              onSelect={() => {}}
              onSubmit={submitAnswer}
              onNext={nextExercise}
            />
          )}

          {currentExercise.type === 'fill_blank' && (
            <FillBlank
              exercise={currentExercise}
              answerState={state.answerState}
              onSubmit={submitAnswer}
              onNext={nextExercise}
            />
          )}

        </div>
      </div>
    </div>
  );
};
