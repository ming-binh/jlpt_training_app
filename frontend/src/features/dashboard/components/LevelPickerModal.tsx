import { useState } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLevelConfig } from '@/hooks/useLevelConfig';
import { toast } from '@/components/ui/toast';

const ALL_OPTIONS: { key: string; label: string; desc: string }[] = [
  { key: 'N5', label: 'JLPT N5', desc: 'Mới bắt đầu (Sơ cấp 1)' },
  { key: 'N4', label: 'JLPT N4', desc: 'Đã có nền tảng (Sơ cấp 2)' },
  { key: 'N3', label: 'JLPT N3', desc: 'Trung cấp (Giao tiếp & Đọc hiểu)' },
  { key: 'N2', label: 'JLPT N2', desc: 'Trung - Cao cấp (Học thuật & Đi làm)' },
  { key: 'N1', label: 'JLPT N1', desc: 'Cao cấp (Thành thạo tự nhiên)' },
];

export function LevelPickerModal({
  mode,
  currentLevel,
  onClose,
  onSave,
}: {
  mode: 'onboarding' | 'edit';
  currentLevel: string;
  onClose: () => void;
  onSave: (level: string) => void;
}) {
  const { isLevelActive } = useLevelConfig();
  const [pending, setPending] = useState(currentLevel || 'N5');

  const handleSelectOption = (optKey: string) => {
    if (!isLevelActive(optKey)) {
      toast.info(`Trình độ ${optKey} đang được hoàn thiện nội dung và sẽ sớm ra mắt!`);
      return;
    }
    setPending(optKey);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground">
            {mode === 'onboarding' ? 'Chào mừng đến Nihon Journey! 🎌' : 'Đổi trình độ học tập'}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === 'onboarding'
              ? 'Chọn trình độ JLPT bạn muốn bắt đầu chinh phục.'
              : 'Chọn mục tiêu trình độ JLPT bạn đang theo học.'}
          </p>
        </div>

        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
          {ALL_OPTIONS.map((opt) => {
            const active = pending === opt.key;
            const isEnabled = isLevelActive(opt.key);

            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleSelectOption(opt.key)}
                className={cn(
                  'flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all',
                  active
                    ? 'border-accent bg-accent/10 shadow-sm'
                    : isEnabled
                    ? 'border-border hover:border-accent/40 bg-card'
                    : 'border-border/60 bg-secondary/30 opacity-75'
                )}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className={cn('text-xs font-bold', active ? 'text-accent' : 'text-foreground')}>
                      {opt.label}
                    </span>
                    {!isEnabled && (
                      <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                        <Lock className="size-2.5" /> Sắp ra mắt
                      </span>
                    )}
                  </div>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground truncate">
                    {opt.desc}
                  </span>
                </div>

                <span
                  className={cn(
                    'size-4 shrink-0 rounded-full border-[1.5px] transition-colors',
                    active ? 'border-accent bg-accent' : 'border-border'
                  )}
                />
              </button>
            );
          })}
        </div>

        {mode === 'onboarding' ? (
          <div className="flex flex-col items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => onSave(pending)}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 shadow-sm"
            >
              Bắt đầu học ngay
            </button>
            <button
              type="button"
              onClick={() => onSave('N5')}
              className="text-[11.5px] font-medium text-muted-foreground hover:text-foreground"
            >
              Bỏ qua, dùng N5 mặc định
            </button>
          </div>
        ) : (
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={() => onSave(pending)}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 shadow-sm"
            >
              Lưu thay đổi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
