import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/services/admin.service';
import type { Role } from '@/services/user.service';

const OPTIONS: { key: Role; label: string; desc: string }[] = [
  { key: 'USER', label: 'USER', desc: 'Học viên đã đăng nhập, toàn quyền học tập.' },
  { key: 'ADMIN', label: 'ADMIN', desc: 'Toàn quyền quản trị hệ thống.' },
];

export function RoleEditModal({
  user,
  onClose,
  onSave,
}: {
  user: AdminUser;
  onClose: () => void;
  onSave: (role: Role) => void;
}) {
  const [pending, setPending] = useState<Role>(user.role);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
      <div className="w-[380px] rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <h3 className="text-[15px] font-bold">Sửa quyền người dùng</h3>
        <p className="mt-1 mb-4 text-[12.5px] text-muted-foreground">
          {user.username} · {user.email}
        </p>

        <div className="mb-5 flex flex-col gap-2">
          {OPTIONS.map((opt) => {
            const active = pending === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setPending(opt.key)}
                className={cn(
                  'flex items-center justify-between rounded-xl border px-3.5 py-3 text-left transition-colors',
                  active ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/40'
                )}
              >
                <span>
                  <span className={cn('block text-[12.5px] font-bold', active ? 'text-accent' : 'text-foreground')}>
                    {opt.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">{opt.desc}</span>
                </span>
                <span
                  className={cn(
                    'size-4 shrink-0 rounded-full border-[1.5px]',
                    active ? 'border-accent bg-accent' : 'border-border'
                  )}
                />
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={() => onSave(pending)}
            className="rounded-lg bg-primary px-4 py-2 text-[12.5px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
