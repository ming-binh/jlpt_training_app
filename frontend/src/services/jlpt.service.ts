import api from './api';

export interface VocabularyItem {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  romaji: string;
  jlptLevel: string;
}

export interface KanjiItem {
  id: number;
  character: string;
  meanings: string;
  onReadings: string;
  kunReadings: string;
  strokeCount: number | null;
  grade: number | null;
  jlptLevel: string;
}

export interface GrammarPointItem {
  id: number;
  title: string;
  structure: string;
  meaning: string;
  jlptLevel: string;
  examples: string;
  relatedGrammar: string;
}

export interface LessonItem {
  id: number;
  title: string;
  description: string;
  jlptLevel: string;
  contentType: 'VOCABULARY' | 'KANJI' | 'GRAMMAR';
  orderIndex: number;
  itemCount: number;
  completedCount: number;
  status: 'available' | 'in_progress' | 'completed' | 'locked';
}

export interface QuizSessionItem {
  id: number;
  userId: string;
  lessonId: number | null;
  sessionType: 'LESSON' | 'PRACTICE' | 'REVIEW';
  score: number;
  xpEarned: number;
  correctCount: number;
  totalCount: number;
  totalTimeMs: number;
  completedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface StatsResponse {
  N5?: number;
  N4?: number;
  N3?: number;
  N2?: number;
  N1?: number;
  total?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  jlptLevel: string;
  streakDays: number;
}

export const jlptService = {
  getVocabulary: async (
    level?: string,
    search?: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<VocabularyItem>> => {
    const params: Record<string, any> = { page, size };
    if (level && level !== 'all') {
      params.level = level.toUpperCase();
    }
    if (search && search.trim()) {
      params.search = search.trim();
    }
    const response = await api.get<PageResponse<VocabularyItem>>('/vocabulary', { params });
    return response.data;
  },

  getKanji: async (
    level?: string,
    search?: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<KanjiItem>> => {
    const params: Record<string, any> = { page, size };
    if (level && level !== 'all') {
      params.level = level.toUpperCase();
    }
    if (search && search.trim()) {
      params.search = search.trim();
    }
    const response = await api.get<PageResponse<KanjiItem>>('/kanji', { params });
    return response.data;
  },

  getGrammar: async (
    level?: string,
    search?: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<GrammarPointItem>> => {
    const params: Record<string, any> = { page, size };
    if (level && level !== 'all') {
      params.level = level.toUpperCase();
    }
    if (search && search.trim()) {
      params.search = search.trim();
    }
    const response = await api.get<PageResponse<GrammarPointItem>>('/grammar', { params });
    return response.data;
  },

  getVocabStats: async (): Promise<StatsResponse> => {
    const res = await api.get<StatsResponse>('/vocabulary/stats');
    return res.data;
  },

  getKanjiStats: async (): Promise<StatsResponse> => {
    const res = await api.get<StatsResponse>('/kanji/stats');
    return res.data;
  },

  getGrammarStats: async (): Promise<StatsResponse> => {
    const res = await api.get<StatsResponse>('/grammar/stats');
    return res.data;
  },

  markProgress: async (
    entityType: 'VOCABULARY' | 'KANJI' | 'GRAMMAR',
    entityId: number,
    status: 'LEARNING' | 'MASTERED' | 'REVIEW_NEEDED' = 'MASTERED'
  ) => {
    const res = await api.post('/progress/mark', { entityType, entityId, status, xp: 10 });
    return res.data;
  },

  getUserProgressMap: async (): Promise<Record<string, 'LEARNING' | 'MASTERED'>> => {
    try {
      const res = await api.get<Array<{ entityType: string; entityId: number; status: 'LEARNING' | 'MASTERED' }>>('/progress/my-items');
      const map: Record<string, 'LEARNING' | 'MASTERED'> = {};
      if (res.data && Array.isArray(res.data)) {
        res.data.forEach(item => {
          map[`${item.entityType}_${item.entityId}`] = item.status;
        });
      }
      return map;
    } catch {
      return {};
    }
  },

  getUserProfile: async (): Promise<UserProfile> => {
    const res = await api.get<UserProfile>('/users/me');
    return res.data;
  },

  // ── Lesson & Quiz APIs ──────────────────────────────────────────────────

  getLessons: async (
    level?: string,
    type?: string,
    page?: number,
    size?: number
  ): Promise<PageResponse<LessonItem> | LessonItem[]> => {
    const params: Record<string, any> = {};
    if (level && level.toLowerCase() !== 'all') params.level = level.toUpperCase();
    if (type && type.toLowerCase() !== 'all') params.type = type.toUpperCase();
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;
    const res = await api.get<PageResponse<LessonItem> | LessonItem[]>('/lessons', { params });
    return res.data;
  },

  getLessonExercises: async (lessonId: number) => {
    const res = await api.get(`/lessons/${lessonId}/exercises`);
    return res.data;
  },

  completeLesson: async (lessonId: number, durationSeconds: number, results: any[]) => {
    const res = await api.post(`/lessons/${lessonId}/complete`, { durationSeconds, results });
    return res.data;
  },

  getQuizHistory: async (): Promise<QuizSessionItem[]> => {
    const res = await api.get<QuizSessionItem[]>('/quiz/history');
    return res.data;
  },
};
