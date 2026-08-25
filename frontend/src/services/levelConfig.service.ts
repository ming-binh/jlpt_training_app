import api from './api';

export interface JlptLevelConfig {
  id: number;
  level: string; // 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  name: string;
  description: string;
  enabled: boolean;
  orderIndex: number;
  updatedAt?: string;
  updatedBy?: string;
  vocabularyCount?: number;
  kanjiCount?: number;
  grammarCount?: number;
  lessonCount?: number;
}

export interface UpdateLevelConfigRequest {
  enabled?: boolean;
  description?: string;
}

export const levelConfigService = {
  /** Lấy danh sách trạng thái cấp độ công khai (cho học viên) */
  getPublicConfigs: async (): Promise<JlptLevelConfig[]> => {
    const { data } = await api.get<JlptLevelConfig[]>('/levels/config');
    return data;
  },

  /** Lấy danh sách các mã cấp độ đang kích hoạt (e.g. ['N5', 'N4', 'N3']) */
  getActiveLevels: async (): Promise<string[]> => {
    const { data } = await api.get<string[]>('/levels/active');
    return data;
  },

  /** Admin: Lấy toàn bộ cấu hình kèm thống kê chi tiết */
  adminGetAllConfigs: async (): Promise<JlptLevelConfig[]> => {
    const { data } = await api.get<JlptLevelConfig[]>('/admin/levels');
    return data;
  },

  /** Admin: Cập nhật bật/tắt kích hoạt cấp độ */
  adminUpdateLevel: async (level: string, req: UpdateLevelConfigRequest): Promise<JlptLevelConfig> => {
    const { data } = await api.patch<JlptLevelConfig>(`/admin/levels/${level}`, req);
    return data;
  },
};
