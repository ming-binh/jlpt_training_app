import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { adminService, type PermissionMatrix, type PermissionRow } from '@/services/admin.service';
import type { Role } from '@/services/user.service';

const ROLE_META: { key: Role; label: string; badgeClass: string; desc: string }[] = [
  { key: 'USER', label: 'USER', badgeClass: 'bg-secondary text-muted-foreground', desc: 'Mặc định khi đăng ký. Học N5–N3 giới hạn, chat AI có hạn mức/ngày.' },
  { key: 'PREMIUM', label: 'PREMIUM', badgeClass: 'bg-accent/15 text-accent', desc: 'Trả phí. Mở khoá toàn bộ nội dung và chat AI không giới hạn.' },
  { key: 'ADMIN', label: 'ADMIN', badgeClass: 'bg-primary/15 text-primary', desc: 'Quản trị viên. Toàn quyền quản lý người dùng, nội dung và hệ thống.' },
];

const COLUMN_META: { key: keyof Pick<PermissionRow, 'user' | 'premium' | 'admin'>; role: Role; activeClass: string; label: string }[] = [
  { key: 'user', role: 'USER', activeClass: 'border-muted-foreground bg-muted-foreground text-background', label: 'USER' },
  { key: 'premium', role: 'PREMIUM', activeClass: 'border-accent bg-accent text-accent-foreground', label: 'PREMIUM' },
  { key: 'admin', role: 'ADMIN', activeClass: 'border-primary bg-primary text-primary-foreground', label: 'ADMIN' },
];

export function AdminRolesPage() {
  const [matrix, setMatrix] = useState<PermissionMatrix | null>(null);

  const load = () => {
    adminService.getPermissionMatrix()
      .then(setMatrix)
      .catch(() => toast.error('Không tải được ma trận phân quyền.'));
  };

  useEffect(load, []);

  const handleToggle = async (row: PermissionRow, col: (typeof COLUMN_META)[number]) => {
    if (!matrix) return;
    const nextEnabled = !row[col.key];

    // Optimistic update
    setMatrix({
      ...matrix,
      rows: matrix.rows.map((r) => (r.key === row.key ? { ...r, [col.key]: nextEnabled } : r)),
    });

    try {
      await adminService.setPermission(col.role, row.key, nextEnabled);
    } catch {
      toast.error('Không thể cập nhật quyền.');
      load();
    }
  };

  if (!matrix) {
    return <div className="text-sm text-muted-foreground">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {ROLE_META.map((r) => (
          <div key={r.key} className="surface-card p-4.5">
            <div className="mb-2.5 flex items-center gap-2.5">
              <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', r.badgeClass)}>{r.label}</span>
              <span className="ml-auto text-[11.5px] text-muted-foreground">
                {matrix.userCounts[r.key] ?? 0} người dùng
              </span>
            </div>
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">{r.desc}</p>
          </div>
        ))}
      </div>

      <div className="surface-card p-6">
        <div className="mb-4.5 flex items-center justify-between">
          <h3 className="text-sm font-bold">Ma trận phân quyền</h3>
          <span className="text-[11.5px] text-muted-foreground">Bấm vào ô để bật/tắt quyền</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr>
                <th className="border-b border-border pb-2.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  Quyền
                </th>
                {COLUMN_META.map((c) => (
                  <th key={c.key} className="w-28 border-b border-border pb-2.5 text-center text-[11px] font-bold text-muted-foreground">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row) => (
                <tr key={row.key} className="border-b border-border last:border-0">
                  <td className="py-3">
                    <span className="block text-[12.5px] font-semibold">{row.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{row.category}</span>
                  </td>
                  {COLUMN_META.map((c) => {
                    const checked = row[c.key];
                    return (
                      <td key={c.key} className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(row, c)}
                          className={cn(
                            'inline-flex size-5.5 items-center justify-center rounded-md border-[1.5px] transition-colors',
                            checked ? c.activeClass : 'border-border bg-transparent'
                          )}
                        >
                          {checked && <Check className="size-3" strokeWidth={3} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
