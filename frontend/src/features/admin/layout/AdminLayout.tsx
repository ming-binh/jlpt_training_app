import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { userService } from '@/services/user.service';

const NAV = [
  { to: '/admin', glyph: '総', label: 'Dashboard', end: true },
  { to: '/admin/users', glyph: '人', label: 'Người dùng', end: false },
  { to: '/admin/roles', glyph: '権', label: 'Vai trò & Quyền', end: false },
  { to: '/admin/content', glyph: '料', label: 'Nội dung', end: false },
] as const;

const TITLES: Record<string, [string, string]> = {
  '/admin': ['Dashboard tổng quan', 'Số liệu học viên & nội dung toàn hệ thống'],
  '/admin/users': ['Quản lý người dùng', 'Tìm kiếm, đổi vai trò và quản lý tài khoản học viên'],
  '/admin/roles': ['Vai trò & phân quyền', 'Ma trận quyền truy cập theo từng vai trò'],
  '/admin/content': ['Quản lý nội dung', 'Bài học, từ vựng, kanji và ngữ pháp'],
};

export function AdminLayout() {
  const location = useLocation();
  const [username, setUsername] = useState('Admin');
  const [email, setEmail] = useState('');

  useEffect(() => {
    userService.getCurrentUser()
      .then((p) => {
        setUsername(p.username || 'Admin');
        setEmail(p.email);
      })
      .catch(() => {});
  }, []);

  const [title, subtitle] = TITLES[location.pathname] ?? TITLES['/admin'];
  const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="flex min-h-screen bg-background text-sm text-foreground">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          <span className="jp grid size-9 place-items-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
            日
          </span>
          <span className="leading-tight">
            <span className="block text-xs font-bold tracking-wide">NIHON ADMIN</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Control Panel
            </span>
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          <span className="mb-1 px-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Quản trị
          </span>
          {NAV.map((item) => {
            const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] font-medium transition-colors',
                  active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'jp grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold',
                    active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {item.glyph}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="my-3 h-px bg-border" />
          <span className="mb-1 px-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Khác
          </span>
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-secondary">
              <ArrowLeft className="size-3.5" />
            </span>
            <span>Về giao diện học viên</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2.5 border-t border-border px-5 py-3.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-accent/60 bg-secondary text-xs font-bold text-accent">
            {(username[0] || 'A').toUpperCase()}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-xs font-semibold">{username}</span>
            <span className="block truncate text-[10.5px] text-muted-foreground">{email}</span>
          </span>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-8 py-5">
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="mt-1 text-[12.5px] text-muted-foreground">{subtitle}</p>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">{today}</span>
        </header>
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
