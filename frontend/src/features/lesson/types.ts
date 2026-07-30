import type { Exercise } from '../../services/lesson.service';

// ─── Exercise Types ────────────────────────────────────────────────────────────

export type ExerciseType = 'flashcard' | 'multiple_choice' | 'fill_blank' | 'matching';

export type AnswerState = 'idle' | 'correct' | 'incorrect' | 'revealed';

// ─── Lesson State Machine ──────────────────────────────────────────────────────

export type LessonPhase =
  | 'loading'       // Fetching exercises
  | 'intro'         // Brief intro screen (optional)
  | 'exercise'      // Active exercise
  | 'feedback'      // Showing correct/incorrect feedback
  | 'complete';     // End screen

export interface ExerciseResult {
  exerciseId: string;
  userAnswer: string;
  correct: boolean;
  timeMs: number;
}

export interface LessonState {
  phase: LessonPhase;
  exercises: Exercise[];
  currentIndex: number;
  results: ExerciseResult[];
  answerState: AnswerState;
  selectedAnswer: string | null;
  startTimeMs: number | null;   // When current exercise started
  totalStartMs: number | null;  // When lesson started
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type LessonAction =
  | { type: 'LOAD_EXERCISES'; exercises: Exercise[] }
  | { type: 'START_LESSON' }
  | { type: 'SELECT_ANSWER'; answer: string }
  | { type: 'REVEAL_CARD' }                    // Flashcard reveal
  | { type: 'SUBMIT_ANSWER'; answer: string }
  | { type: 'NEXT_EXERCISE' }
  | { type: 'FINISH_LESSON' };

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'LOAD_EXERCISES':
      return {
        ...state,
        phase: 'exercise',
        exercises: action.exercises,
        currentIndex: 0,
        results: [],
        totalStartMs: Date.now(),
        startTimeMs: Date.now(),
      };

    case 'START_LESSON':
      return { ...state, phase: 'exercise', totalStartMs: Date.now(), startTimeMs: Date.now() };

    case 'SELECT_ANSWER':
      if (state.answerState !== 'idle') return state;
      return { ...state, selectedAnswer: action.answer };

    case 'REVEAL_CARD':
      return { ...state, answerState: 'revealed' };

    case 'SUBMIT_ANSWER': {
      const current = state.exercises[state.currentIndex];
      if (!current) return state;
      const correct = action.answer.trim().toLowerCase() === current.correctAnswer.trim().toLowerCase();
      const timeMs = state.startTimeMs ? Date.now() - state.startTimeMs : 0;
      const result: ExerciseResult = {
        exerciseId: current.id,
        userAnswer: action.answer,
        correct,
        timeMs,
      };
      return {
        ...state,
        answerState: correct ? 'correct' : 'incorrect',
        selectedAnswer: action.answer,
        results: [...state.results, result],
      };
    }

    case 'NEXT_EXERCISE': {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.exercises.length) {
        return { ...state, phase: 'complete', answerState: 'idle', selectedAnswer: null };
      }
      return {
        ...state,
        phase: 'exercise',
        currentIndex: nextIndex,
        answerState: 'idle',
        selectedAnswer: null,
        startTimeMs: Date.now(),
      };
    }

    case 'FINISH_LESSON':
      return { ...state, phase: 'complete' };

    default:
      return state;
  }
}

// ─── Initial State ─────────────────────────────────────────────────────────────

export const initialLessonState: LessonState = {
  phase: 'loading',
  exercises: [],
  currentIndex: 0,
  results: [],
  answerState: 'idle',
  selectedAnswer: null,
  startTimeMs: null,
  totalStartMs: null,
};
