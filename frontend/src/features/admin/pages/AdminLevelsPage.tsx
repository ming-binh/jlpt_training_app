import { useEffect, useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Lock,
  BookOpen,
  Languages,
  FileText,
  Sparkles,
  RefreshCw,
  Info,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { levelConfigService, type JlptLevelConfig } from '@/services/levelConfig.service';
import { LevelBadge } from '../adminUi';

const LEVEL_META: Record<
  string,
  {
    theme: string;
    border: string;
    glow: string;
    bg: string;
    kanji: string;
    tagline: string;
  }
> = {
  N5: {
    theme: 'text-emerald-400',
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    glow: 'from-emerald-500/10 to-transparent',
    bg: 'bg-emerald-500/10',
    kanji: '初',
    tagline: 'Sơ cấp 1 (Cơ bản)',
  },
  N4: {
    theme: 'text-sky-400',
    border: 'border-sky-500/30 hover:border-sky-500/60',
    glow: 'from-sky-500/10 to-transparent',
    bg: 'bg-sky-500/10',
    kanji: '進',
    tagline: 'Sơ cấp 2 (Nâng cao)',
  },
  N3: {
    theme: 'text-amber-400',
    border: 'border-amber-500/30 hover:border-amber-500/60',
    glow: 'from-amber-500/10 to-transparent',
    bg: 'bg-amber-500/10',
    kanji: '中',
    tagline: 'Trung cấp (Cầu nối)',
  },
  N2: {
    theme: 'text-violet-400',
    border: 'border-violet-500/30 hover:border-violet-500/60',
    glow: 'from-violet-500/10 to-transparent',
    bg: 'bg-violet-500/10',
    kanji: '上',
    tagline: 'Trung - Cao cấp',
  },
  N1: {
    theme: 'text-rose-400',
    border: 'border-rose-500/30 hover:border-rose-500/60',
    glow: 'from-rose-500/10 to-transparent',
    bg: 'bg-rose-500/10',
    kanji: '極',
    tagline: 'Cao cấp (Thành thạo)',
  },
};

export function AdminLevelsPage() {
  const [configs, setConfigs] = useState<JlptLevelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingLevel, setUpdatingLevel] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<JlptLevelConfig | null>(null);
  const [editDescription, setEditDescription] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await levelConfigService.adminGetAllConfigs();
      setConfigs(data);
    } catch {
      toast.error('Không thể tải cấu hình cấp độ JLPT.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (level: string, currentEnabled: boolean) => {
    const nextState = !currentEnabled;
    setUpdatingLevel(level);
    try {
      const updated = await levelConfigService.adminUpdateLevel(level, { enabled: nextState });
      setConfigs((prev) => prev.map((item) => (item.level === level ? updated : item)));
      if (nextState) {
        toast.success(`Đã kích hoạt cấp độ ${level} cho toàn bộ học viên.`);
      } else {
        toast.info(`Đã tạm khoá cấp độ ${level} đối với học viên.`);
      }
    } catch {
      toast.error(`Không thể thay đổi trạng thái cấp độ ${level}.`);
    } finally {
      setUpdatingLevel(null);
    }
  };

  const handleSaveDescription = async () => {
    if (!editingItem) return;
    try {
      const updated = await levelConfigService.adminUpdateLevel(editingItem.level, {
        description: editDescription,
      });
      setConfigs((prev) => prev.map((item) => (item.level === editingItem.level ? updated : item)));
      toast.success(`Đã cập nhật ghi chú cho ${editingItem.level}.`);
      setEditingItem(null);
    } catch {
      toast.error('Không thể cập nhật ghi chú.');
    }
  };

  const activeCount = configs.filter((c) => c.enabled).length;
  const inactiveCount = configs.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              <span>Quản lý phân phối nội dung JLPT</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Kích hoạt Cấp độ Trình độ JLPT (N5 → N1)
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Cho phép Admin chủ động bật hoặc tạm ẩn các mốc cấp độ trên giao diện học viên. Khi các
              mốc nâng cao như <strong>N1, N2</strong> đang được bổ sung dịch thuật hoặc hoàn thiện
              dữ liệu, bạn có thể tạm khoá và tích kích hoạt mở lại bất kỳ lúc nào.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl border border-border bg-card/80 p-3.5 text-center min-w-28">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Đang mở
              </span>
              <span className="text-2xl font-black text-emerald-400">{activeCount}</span>
              <span className="block text-[10px] text-muted-foreground">cấp độ</span>
            </div>

            <div className="rounded-xl border border-border bg-card/80 p-3.5 text-center min-w-28">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Đang khoá
              </span>
              <span className="text-2xl font-black text-amber-400">{inactiveCount}</span>
              <span className="block text-[10px] text-muted-foreground">phát triển</span>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="grid size-10 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-secondary disabled:opacity-50"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={cn('size-4 text-muted-foreground', loading && 'animate-spin')} />
            </button>
          </div>
        </div>
      </div>

      {/* Level Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
        {configs.map((item) => {
          const meta = LEVEL_META[item.level] || {
            theme: 'text-primary',
            border: 'border-border',
            glow: 'from-primary/10 to-transparent',
            bg: 'bg-primary/10',
            kanji: '級',
            tagline: 'Cấp độ JLPT',
          };
          const isUpdating = updatingLevel === item.level;

          return (
            <div
              key={item.level}
              className={cn(
                'relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card/90 p-5 shadow-sm transition-all duration-200',
                meta.border,
                item.enabled ? 'ring-1 ring-primary/20' : 'opacity-85'
              )}
            >
              {/* Subtle top gradient glow */}
              <div
                className={cn(
                  'absolute -top-12 -right-12 size-36 rounded-full bg-gradient-to-b blur-2xl pointer-events-none',
                  meta.glow
                )}
              />

              <div>
                {/* Header: Badge + Level Title + Toggle */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'grid size-11 shrink-0 place-items-center rounded-xl font-mono text-lg font-black shadow-inner',
                        meta.bg,
                        meta.theme
                      )}
                    >
                      {item.level}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {meta.tagline}
                      </span>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      disabled={isUpdating}
                      onChange={() => handleToggle(item.level, item.enabled)}
                      className="peer sr-only"
                    />
                    <div
                      className={cn(
                        "peer h-6 w-11 rounded-full bg-muted transition-colors after:absolute after:top-0.5 after:left-[2px] after:size-5 after:rounded-full after:bg-white after:shadow-md after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none",
                        item.enabled ? 'bg-emerald-500' : 'bg-zinc-700'
                      )}
                    />
                  </label>
                </div>

                {/* Status Badge */}
                <div className="mt-3.5 flex items-center justify-between">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                      item.enabled
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    )}
                  >
                    {item.enabled ? (
                      <>
                        <CheckCircle2 className="size-3" />
                        Đang mở cho học viên
                      </>
                    ) : (
                      <>
                        <Lock className="size-3" />
                        Tạm khoá / Đang phát triển
                      </>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(item);
                      setEditDescription(item.description || '');
                    }}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    title="Chỉnh sửa ghi chú"
                  >
                    <Edit3 className="size-3" />
                    <span>Sửa mô tả</span>
                  </button>
                </div>

                {/* Description */}
                <p className="mt-3 text-[12px] text-muted-foreground/90 line-clamp-2 leading-relaxed bg-secondary/30 p-2.5 rounded-lg border border-border/50">
                  {item.description || 'Chưa có ghi chú mô tả.'}
                </p>
              </div>

              {/* Data Breakdown in DB */}
              <div className="mt-4 pt-3.5 border-t border-border/60">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Dữ liệu hiện có trong Database
                </span>

                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="rounded-lg bg-secondary/50 p-1.5">
                    <span className="block text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <Layers className="size-2.5" /> Bài
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {item.lessonCount ?? 0}
                    </span>
                  </div>

                  <div className="rounded-lg bg-secondary/50 p-1.5">
                    <span className="block text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <Languages className="size-2.5" /> Từ
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {item.vocabularyCount ?? 0}
                    </span>
                  </div>

                  <div className="rounded-lg bg-secondary/50 p-1.5">
                    <span className="block text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <BookOpen className="size-2.5" /> Kanji
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {item.kanjiCount ?? 0}
                    </span>
                  </div>

                  <div className="rounded-lg bg-secondary/50 p-1.5">
                    <span className="block text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <FileText className="size-2.5" /> Ngữ pháp
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {item.grammarCount ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Description Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LevelBadge level={editingItem.level} />
                <h3 className="text-base font-bold text-foreground">
                  Ghi chú cấp độ {editingItem.level}
                </h3>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Mô tả hiển thị thông tin hoặc lý do tạm ẩn
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder="Nhập ghi chú cho cấp độ này..."
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleSaveDescription}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Note Footer */}
      <div className="rounded-xl border border-border/70 bg-card/40 p-4 flex items-start gap-3 text-xs text-muted-foreground">
        <Info className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-foreground">Hướng dẫn quản trị:</span>
          <p>
            - Khi gạt công tắc <strong>Kích hoạt</strong>, cấp độ sẽ ngay lập tức xuất hiện và có thể
            chọn trên toàn bộ các trang học (Từ vựng, Kanji, Ngữ pháp, Bài học, Luyện tập, v.v.).
          </p>
          <p>
            - Khi <strong>Tắt kích hoạt</strong>, các nút chọn cấp độ tương ứng trên giao diện học viên
            sẽ hiển thị biểu tượng khoá 🔒 cùng thông báo "Sắp ra mắt / Đang hoàn thiện".
          </p>
        </div>
      </div>
    </div>
  );
}
