import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/common/app-header';
import { ExerciseProgress } from '../components/ExerciseProgress';
import { FlashCard } from '../components/FlashCard';
import { MultipleChoice } from '../components/MultipleChoice';
import { FillBlank } from '../components/FillBlank';
import { LessonComplete } from '../components/LessonComplete';
import { useLessonState } from '../hooks/useLessonState';
import { lessonService } from '@/services/lesson.service';
import './LessonPage.css';

export const LessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

  const lessonId = Number(id);

  const [lessonInfo, setLessonInfo] = React.useState<any>(null);

  // Fetch exercises and lesson info on mount
  useEffect(() => {
    if (!lessonId) return;
    lessonService.getLesson(lessonId)
      .then(setLessonInfo)
      .catch(console.error);

    lessonService.getExercises(lessonId)
      .then(exercises => loadExercises(exercises))
      .catch(() => navigate('/learn'));
  }, [lessonId, loadExercises, navigate]);

  // Submit lesson completion when done
  useEffect(() => {
    if (state.phase !== 'complete' || results.length === 0) return;
    const totalTimeMs = state.totalStartMs ? Date.now() - state.totalStartMs : 0;
    lessonService.completeLesson({
      lessonId,
      results: results.map(r => ({
        exerciseId: r.exerciseId,
        userAnswer: r.userAnswer,
        correct: r.correct,
        timeMs: r.timeMs,
        entityType: r.entityType,
        entityId: r.entityId,
      })),
      totalTimeMs,
    }).catch(console.error);
  }, [state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFlashcardKnew = useCallback(() => {
    if (!currentExercise) return;
    submitAnswer(currentExercise.correctAnswer); // correct
    setTimeout(nextExercise, 400);
  }, [currentExercise, submitAnswer, nextExercise]);

  const handleFlashcardDidntKnow = useCallback(() => {
    if (!currentExercise) return;
    submitAnswer('__skip__'); // incorrect
    setTimeout(nextExercise, 400);
  }, [currentExercise, submitAnswer, nextExercise]);

  const handleRetry = useCallback(() => {
    if (!lessonId) return;
    lessonService.getExercises(lessonId)
      .then(exercises => loadExercises(exercises))
      .catch(console.error);
  }, [lessonId, loadExercises]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state.phase === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <div className="lesson-page-loading">
          <div className="lesson-loading-spinner" />
          <p>Đang tải bài học...</p>
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
            lessonTitle={lessonInfo?.title || `Bài ${id}`}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  // ── Exercise ───────────────────────────────────────────────────────────────
  if (!currentExercise) return null;

  const correctCount = results.filter(r => r.correct).length;
  const categoryStr = lessonInfo?.contentType === 'VOCABULARY' ? 'TỪ VỰNG' : lessonInfo?.contentType === 'KANJI' ? 'KANJI' : lessonInfo?.contentType === 'GRAMMAR' ? 'NGỮ PHÁP' : (currentExercise?.entityType === 'VOCABULARY' ? 'TỪ VỰNG' : currentExercise?.entityType === 'KANJI' ? 'KANJI' : 'NGỮ PHÁP');

  return (
    <div className="lesson-page min-h-screen bg-background text-foreground">
      <AppHeader />
      {/* Progress */}
      <ExerciseProgress
        current={state.currentIndex}
        total={state.exercises.length}
        correctCount={correctCount}
        categoryLabel={categoryStr}
        levelLabel={lessonInfo?.jlptLevel || 'N5'}
        timerText="Không giới hạn"
        onExit={() => navigate('/learn')}
      />

      {/* Exercise area */}
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
