import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type ContentType = 'VOCABULARY' | 'KANJI' | 'GRAMMAR';

export interface Lesson {
  id: number;
  title: string;
  description?: string;
  jlptLevel: JlptLevel;
  contentType: ContentType;
  orderIndex: number;
  itemCount: number;
  completedCount?: number;
  status?: 'locked' | 'available' | 'in-progress' | 'completed';
}

export interface ExerciseOption {
  id: string;
  text: string;
  furigana?: string;
}

export interface Exercise {
  id: string;
  type: 'flashcard' | 'multiple_choice' | 'fill_blank' | 'matching';
  question: string;
  questionFurigana?: string;
  questionMeaning?: string;
  options?: ExerciseOption[];
  correctAnswer: string;
  explanation?: string;
  entityType: ContentType;
  entityId: number;
}

export interface QuizResult {
  exerciseId: string;
  userAnswer: string;
  correct: boolean;
  timeMs?: number;
}

export interface LessonCompleteRequest {
  lessonId: number;
  results: QuizResult[];
  totalTimeMs: number;
}

export interface LessonCompleteResponse {
  xpEarned: number;
  correctCount: number;
  totalCount: number;
  score: number;
  streakUpdated: boolean;
}

export interface ProgressSummary {
  streak: number;
  xp: number;
  xpToNextLevel: number;
  masteredVocab: number;
  masteredKanji: number;
  masteredGrammar: number;
  todayGoalComplete: boolean;
  jlptLevel: JlptLevel;
}

// ─── Lesson API ───────────────────────────────────────────────────────────────

export const lessonService = {
  /** Lấy danh sách lessons theo level và type */
  getLessons: async (level?: JlptLevel, type?: ContentType): Promise<Lesson[]> => {
    const params = new URLSearchParams();
    if (level) params.set('level', level);
    if (type) params.set('type', type);
    const { data } = await api.get<Lesson[]>(`/lessons?${params}`);
    return data;
  },

  /** Lấy chi tiết một lesson */
  getLesson: async (id: number): Promise<Lesson> => {
    const { data } = await api.get<Lesson>(`/lessons/${id}`);
    return data;
  },

  /** Lấy bộ bài tập cho một lesson */
  getExercises: async (lessonId: number): Promise<Exercise[]> => {
    const { data } = await api.get<Exercise[]>(`/lessons/${lessonId}/exercises`);
    return data;
  },

  /** Gửi kết quả hoàn thành lesson */
  completeLesson: async (req: LessonCompleteRequest): Promise<LessonCompleteResponse> => {
    const { data } = await api.post<LessonCompleteResponse>(`/lessons/${req.lessonId}/complete`, req);
    return data;
  },
};

// ─── Quiz / Practice API ──────────────────────────────────────────────────────

export const quizService = {
  /** Lấy bài tập practice ngẫu nhiên */
  getPracticeExercises: async (level?: JlptLevel, type?: ContentType, count = 10): Promise<Exercise[]> => {
    const params = new URLSearchParams({ count: String(count) });
    if (level) params.set('level', level);
    if (type) params.set('type', type);
    const { data } = await api.get<Exercise[]>(`/quiz/practice?${params}`);
    return data;
  },

  /** Lấy items cần ôn tập hôm nay (SRS) */
  getReviewItems: async (): Promise<Exercise[]> => {
    const { data } = await api.get<Exercise[]>('/quiz/review');
    return data;
  },

  /** Submit kết quả quiz */
  submitResults: async (results: QuizResult[]): Promise<void> => {
    await api.post('/quiz/submit', { results });
  },
};

// ─── Progress API ─────────────────────────────────────────────────────────────

export const progressService = {
  /** Lấy tổng quan tiến độ của user */
  getSummary: async (): Promise<ProgressSummary> => {
    const { data } = await api.get<ProgressSummary>('/progress/summary');
    return data;
  },

  /** Lấy streak calendar data (30 ngày) */
  getStreakCalendar: async (): Promise<{ date: string; studied: boolean }[]> => {
    const { data } = await api.get('/progress/streak');
    return data;
  },
};
