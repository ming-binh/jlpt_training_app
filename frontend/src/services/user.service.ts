import api from './api';

export interface DashboardStats {
  userId: string;
  username: string;
  jlptLevel: string;
  streakDays: number;
  mockScore?: number;
  weakSections?: string;
  completedVocab: number;
  completedKanji: number;
  completedGrammar: number;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  jlptLevel: string;
  streakDays?: number;
  mockScore?: number;
  weakSections?: string;
}

export const userService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/users/me/dashboard-stats');
    return response.data;
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: { username?: string; jlptLevel?: string }): Promise<UserProfile> => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
};
