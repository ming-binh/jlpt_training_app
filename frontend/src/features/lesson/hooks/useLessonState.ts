import { useReducer, useCallback } from 'react';
import { lessonReducer, initialLessonState } from '../types';
import type { LessonState, ExerciseResult } from '../types';
import type { Exercise } from '../../../services/lesson.service';

export interface UseLessonStateReturn {
  state: LessonState;
  loadExercises: (exercises: Exercise[]) => void;
  selectAnswer: (answer: string) => void;
  submitAnswer: (answer: string) => void;
  revealCard: () => void;
  nextExercise: () => void;
  /** Score 0-100 */
  score: number;
  /** All results so far */
  results: ExerciseResult[];
  /** Current exercise or null */
  currentExercise: Exercise | null;
  /** Progress 0-1 */
  progress: number;
}

export function useLessonState(): UseLessonStateReturn {
  const [state, dispatch] = useReducer(lessonReducer, initialLessonState);

  const loadExercises = useCallback((exercises: Exercise[]) => {
    dispatch({ type: 'LOAD_EXERCISES', exercises });
  }, []);

  const selectAnswer = useCallback((answer: string) => {
    dispatch({ type: 'SELECT_ANSWER', answer });
  }, []);

  const revealCard = useCallback(() => {
    dispatch({ type: 'REVEAL_CARD' });
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    dispatch({ type: 'SUBMIT_ANSWER', answer });
  }, []);

  const nextExercise = useCallback(() => {
    dispatch({ type: 'NEXT_EXERCISE' });
  }, []);

  const currentExercise = state.exercises[state.currentIndex] ?? null;

  const score = state.results.length > 0
    ? Math.round((state.results.filter(r => r.correct).length / state.results.length) * 100)
    : 0;

  const progress = state.exercises.length > 0
    ? state.currentIndex / state.exercises.length
    : 0;

  return {
    state,
    loadExercises,
    selectAnswer,
    submitAnswer,
    revealCard,
    nextExercise,
    score,
    results: state.results,
    currentExercise,
    progress,
  };
}
