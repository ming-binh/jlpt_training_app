import api from './api';
import type { Role } from './user.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  jlptLevel: string;
  streakDays: number;
  lastActiveAt: string | null;
  locked: boolean;
}

export interface LevelCount {
  level: string;
  count: number;
}

export interface DashboardStats {
  totalUsers: number;
  premiumUsers: number;
  adminUsers: number;
  totalLessons: number;
  aiChatSessionsToday: number;
  levelDistribution: LevelCount[];
  recentUsers: AdminUser[];
}

export interface PermissionRow {
  key: string;
  label: string;
  category: string;
  user: boolean;
  premium: boolean;
  admin: boolean;
}

export interface PermissionMatrix {
  rows: PermissionRow[];
  userCounts: Record<Role, number>;
}

export type ContentType = 'LESSON' | 'VOCAB' | 'KANJI' | 'GRAMMAR';

export interface AdminContentItem {
  id: string;
  type: ContentType;
  title: string;
  level: string;
  itemCount?: number;
  published?: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const adminService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>('/admin/dashboard/stats');
    return data;
  },

  getUsers: async (search?: string, role?: Role | 'ALL'): Promise<AdminUser[]> => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (role && role !== 'ALL') params.set('role', role);
    const { data } = await api.get<AdminUser[]>(`/admin/users?${params}`);
    return data;
  },

  updateUserRole: async (userId: string, role: Role): Promise<AdminUser> => {
    const { data } = await api.patch<AdminUser>(`/admin/users/${userId}/role`, { role });
    return data;
  },

  toggleUserLock: async (userId: string): Promise<AdminUser> => {
    const { data } = await api.patch<AdminUser>(`/admin/users/${userId}/lock`);
    return data;
  },

  getPermissionMatrix: async (): Promise<PermissionMatrix> => {
    const { data } = await api.get<PermissionMatrix>('/admin/roles/permissions');
    return data;
  },

  setPermission: async (role: Role, permissionKey: string, enabled: boolean): Promise<void> => {
    await api.patch(`/admin/roles/${role}/permissions/${permissionKey}`, { enabled });
  },

  getContent: async (
    type: ContentType,
    opts: { level?: string; search?: string; page?: number; size?: number } = {}
  ): Promise<Page<AdminContentItem>> => {
    const params = new URLSearchParams({ type });
    if (opts.level) params.set('level', opts.level);
    if (opts.search) params.set('search', opts.search);
    params.set('page', String(opts.page ?? 0));
    params.set('size', String(opts.size ?? 20));
    const { data } = await api.get<Page<AdminContentItem>>(`/admin/content?${params}`);
    return data;
  },

  deleteContent: async (type: ContentType, id: string): Promise<void> => {
    await api.delete(`/admin/content/${type}/${id}`);
  },
};
