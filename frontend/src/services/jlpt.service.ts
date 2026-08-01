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
};
