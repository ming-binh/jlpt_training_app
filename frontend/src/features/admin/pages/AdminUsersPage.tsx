import { useEffect, useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { adminService, type AdminUser } from '@/services/admin.service';
import type { Role } from '@/services/user.service';
import { RoleBadge, LevelBadge, relativeTime } from '../adminUi';
import { RoleEditModal } from '../components/RoleEditModal';

const ROLE_FILTERS: { key: Role | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'USER', label: 'User' },
  { key: 'PREMIUM', label: 'Premium' },
  { key: 'ADMIN', label: 'Admin' },
];

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const load = () => {
    setLoading(true);
    adminService.getUsers(search, roleFilter)
      .then(setUsers)
      .catch(() => toast.error('Không tải được danh sách người dùng.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

  const handleSaveRole = async (role: Role) => {
    if (!editingUser) return;
    try {
      const updated = await adminService.updateUserRole(editingUser.id, role);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success('Đã cập nhật vai trò.');
      setEditingUser(null);
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Không thể cập nhật vai trò.');
    }
  };

  const handleToggleLock = async (u: AdminUser) => {
    try {
      const updated = await adminService.toggleUserLock(u.id);
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast.success(updated.locked ? 'Đã khoá tài khoản.' : 'Đã mở khoá tài khoản.');
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Không thể thay đổi trạng thái khoá.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Tìm theo tên hoặc email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-border bg-card px-3.5 py-2.5 text-[13px] outline-none placeholder:text-muted-foreground focus:border-accent"
        />
        {ROLE_FILTERS.map((rf) => (
          <button
            key={rf.key}
            type="button"
            onClick={() => setRoleFilter(rf.key)}
            className={cn(
              'rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors',
              roleFilter === rf.key
                ? 'border-primary bg-primary/15 text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {rf.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{users.length} người dùng</span>
      </div>

      <div className="surface-card overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-secondary/60 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              <th className="px-4.5 py-3">Học viên</th>
              <th className="px-4.5 py-3">Vai trò</th>
              <th className="px-4.5 py-3">Cấp độ</th>
              <th className="px-4.5 py-3">Streak</th>
              <th className="px-4.5 py-3">Hoạt động cuối</th>
              <th className="px-4.5 py-3">Trạng thái</th>
              <th className="px-4.5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4.5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-7.5 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold">
                      {(u.username?.[0] || u.email[0]).toUpperCase()}
                    </span>
                    <span>
                      <span className="block text-[12.5px] font-semibold">{u.username || '—'}</span>
                      <span className="block text-[11px] text-muted-foreground">{u.email}</span>
                    </span>
                  </div>
                </td>
                <td className="px-4.5 py-3"><RoleBadge role={u.role} /></td>
                <td className="px-4.5 py-3"><LevelBadge level={u.jlptLevel} /></td>
                <td className="px-4.5 py-3 text-muted-foreground">{u.streakDays} ngày</td>
                <td className="px-4.5 py-3 text-[11.5px] text-muted-foreground">{relativeTime(u.lastActiveAt)}</td>
                <td className="px-4.5 py-3">
                  <span className={cn('flex items-center gap-1.5 text-[11.5px] font-semibold', u.locked ? 'text-destructive' : 'text-emerald-400')}>
                    <span className={cn('size-1.5 rounded-full', u.locked ? 'bg-destructive' : 'bg-emerald-400')} />
                    {u.locked ? 'Đã khoá' : 'Hoạt động'}
                  </span>
                </td>
                <td className="px-4.5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditingUser(u)}
                    className="mr-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-[11.5px] font-semibold transition-colors hover:text-accent"
                  >
                    Sửa quyền
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleLock(u)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11.5px] font-semibold transition-colors',
                      u.locked ? 'text-emerald-400' : 'text-destructive'
                    )}
                  >
                    {u.locked ? <Unlock className="size-3.5" /> : <Lock className="size-3.5" />}
                    {u.locked ? 'Mở khoá' : 'Khoá'}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                  Không tìm thấy người dùng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <RoleEditModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveRole} />
      )}
    </div>
  );
}
