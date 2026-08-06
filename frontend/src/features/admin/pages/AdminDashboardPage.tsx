import { useEffect, useState } from 'react';
import { Users, GraduationCap, MessageCircle } from 'lucide-react';
import { adminService, type DashboardStats } from '@/services/admin.service';
import { RoleBadge, LevelBadge, relativeTime } from '../adminUi';
import { toast } from '@/components/ui/toast';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    adminService.getDashboardStats()
      .then(setStats)
      .catch(() => toast.error('Không tải được số liệu dashboard.'));
  }, []);

  if (!stats) {
    return <div className="text-sm text-muted-foreground">Đang tải...</div>;
  }

  const maxLevelCount = Math.max(1, ...stats.levelDistribution.map((l) => l.count));

  const cards = [
    { label: 'Tổng học viên', value: stats.totalUsers, hint: `${stats.adminUsers} quản trị viên`, icon: Users },
    { label: 'Bài học', value: stats.totalLessons, hint: 'Tất cả trình độ', icon: GraduationCap },
    { label: 'Phiên chat AI hôm nay', value: stats.aiChatSessionsToday, hint: 'Tính từ 0h', icon: MessageCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="surface-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                {c.label}
              </span>
              <span className="grid size-6 place-items-center rounded-md bg-secondary text-accent">
                <c.icon className="size-3.5" />
              </span>
            </div>
            <div className="mt-2.5 text-[26px] font-extrabold tracking-tight">{c.value.toLocaleString('vi-VN')}</div>
            <div className="mt-1 text-[11.5px] font-medium text-muted-foreground">{c.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="surface-card p-6">
          <h3 className="mb-4 text-sm font-bold">Người dùng mới nhất</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2.5">Học viên</th>
                  <th className="pb-2.5">Vai trò</th>
                  <th className="pb-2.5">Cấp độ</th>
                  <th className="pb-2.5 text-right">Hoạt động</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-bold">
                          {(u.username?.[0] || u.email[0]).toUpperCase()}
                        </span>
                        <span className="font-semibold">{u.username || u.email}</span>
                      </div>
                    </td>
                    <td className="py-2.5"><RoleBadge role={u.role} /></td>
                    <td className="py-2.5"><LevelBadge level={u.jlptLevel} /></td>
                    <td className="py-2.5 text-right text-[11.5px] text-muted-foreground">
                      {relativeTime(u.lastActiveAt)}
                    </td>
                  </tr>
                ))}
                {stats.recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-xs text-muted-foreground">
                      Chưa có người dùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="surface-card p-6">
          <h3 className="mb-4 text-sm font-bold">Phân bổ theo cấp độ JLPT</h3>
          <div className="flex flex-col gap-4">
            {stats.levelDistribution.map((lv) => (
              <div key={lv.level}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-semibold">{lv.level}</span>
                  <span className="text-muted-foreground">{lv.count} học viên</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.round((lv.count / maxLevelCount) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
