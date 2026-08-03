import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  // Fetch exercises on mount
  useEffect(() => {
    if (!lessonId) return;
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
      <div className="lesson-page-loading">
        <div className="lesson-loading-spinner" />
        <p>Đang tải bài học...</p>
      </div>
    );
  }

  // ── Complete ───────────────────────────────────────────────────────────────
  if (state.phase === 'complete') {
    return (
      <div className="lesson-page-complete">
        <LessonComplete
          results={results}
          xpEarned={Math.round(score / 10) * 5}
          lessonTitle={`Bài ${id}`}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // ── Exercise ───────────────────────────────────────────────────────────────
  if (!currentExercise) return null;

  const correctCount = results.filter(r => r.correct).length;

  return (
    <div className="lesson-page">
      {/* Progress */}
      <ExerciseProgress
        current={state.currentIndex}
        total={state.exercises.length}
        correctCount={correctCount}
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
