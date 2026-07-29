import { supabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  needsEmailConfirmation?: boolean;
}

export const authService = {
  /**
   * Đăng nhập bằng email + password qua Supabase Auth.
   * Supabase tự lưu session vào localStorage.
   */
  login: async (credentials: { email: string; password: string }): Promise<AuthUser> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) throw error;
    return { id: data.user!.id, email: data.user!.email! };
  },

  /**
   * Đăng ký tài khoản mới qua Supabase Auth.
   * Cấu hình emailRedirectTo trỏ về trang /auth/callback của ứng dụng.
   */
  register: async (userData: { email: string; password: string; username: string }): Promise<AuthUser> => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: { name: userData.username },
        emailRedirectTo: redirectUrl,
      },
    });
    if (error) throw error;
    if (!data.user) throw new Error('Đăng ký thất bại. Vui lòng thử lại.');

    // Nếu không có session tức là Supabase đang bật tính năng bắt buộc confirm email
    const needsEmailConfirmation = !data.session;

    return {
      id: data.user.id,
      email: data.user.email!,
      needsEmailConfirmation,
    };
  },

  /** Đăng xuất — Supabase xóa session khỏi localStorage. */
  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
  },

  /** Lấy access token hiện tại để gắn vào Authorization header. */
  getAccessToken: async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  },

  /** Kiểm tra xem đã có session hợp lệ chưa. */
  isAuthenticated: (): boolean => {
    return Object.keys(localStorage).some(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  },
};
