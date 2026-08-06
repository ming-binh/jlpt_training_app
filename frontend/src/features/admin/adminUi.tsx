import { cn } from '@/lib/utils';
import type { Role } from '@/services/user.service';

const ROLE_STYLE: Record<Role, string> = {
  ADMIN: 'bg-primary/15 text-primary',
  USER: 'bg-secondary text-muted-foreground',
};

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold', ROLE_STYLE[role])}>
      {ROLE_LABEL[role]}
    </span>
  );
}

const LEVEL_STYLE: Record<string, string> = {
  N5: 'bg-emerald-500/15 text-emerald-400',
  N4: 'bg-sky-500/15 text-sky-400',
  N3: 'bg-amber-500/15 text-amber-400',
  N2: 'bg-violet-500/15 text-violet-400',
  N1: 'bg-rose-500/15 text-rose-400',
};

export function LevelBadge({ level }: { level: string }) {
  return (
    <span className={cn('inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold', LEVEL_STYLE[level] ?? 'bg-secondary text-muted-foreground')}>
      {level}
    </span>
  );
}

export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return 'Chưa hoạt động';
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}
