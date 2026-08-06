import { useState } from 'react';
import { cn } from '@/lib/utils';

const OPTIONS: { key: string; label: string; desc: string }[] = [
  { key: 'N5', label: 'N5', desc: 'Mới bắt đầu' },
  { key: 'N4', label: 'N4', desc: 'Đã có nền tảng' },
  { key: 'N3', label: 'N3', desc: 'Trung cấp' },
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
  const [pending, setPending] = useState(currentLevel || 'N5');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
      <div className="w-[380px] rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <h3 className="text-[15px] font-bold">
          {mode === 'onboarding' ? 'Chào mừng đến Nihon Journey! 🎌' : 'Đổi trình độ học'}
        </h3>
        <p className="mt-1 mb-4 text-[12.5px] text-muted-foreground">
          {mode === 'onboarding' ? 'Bạn đang ở trình độ nào?' : 'Chọn trình độ JLPT bạn đang theo học.'}
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

        {mode === 'onboarding' ? (
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => onSave(pending)}
              className="w-full rounded-lg bg-primary py-2.5 text-[12.5px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Bắt đầu học
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
        )}
      </div>
    </div>
  );
}
