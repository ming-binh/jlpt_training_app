import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AppHeader } from '@/components/common/app-header';
import type { JlptLevel, ContentType } from '@/services/lesson.service';
import { cn } from '@/lib/utils';

const LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
const TYPES: { type: ContentType | 'MIXED'; jp: string; label: string; desc: string }[] = [
  { type: 'MIXED', jp: '総合', label: 'Tổng hợp', desc: 'Trộn ngẫu nhiên các loại' },
  { type: 'VOCABULARY', jp: '単語', label: 'Từ vựng', desc: 'Chọn nghĩa đúng của từ' },
  { type: 'KANJI', jp: '漢字', label: 'Kanji', desc: 'Nhận diện nghĩa & âm đọc' },
  { type: 'GRAMMAR', jp: '文法', label: 'Ngữ pháp', desc: 'Chọn ý nghĩa mẫu câu' },
];
const COUNTS = [5, 10, 20, 30];

export const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<JlptLevel | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ContentType | 'MIXED'>('MIXED');
  const [questionCount, setQuestionCount] = useState(10);

  const handleStart = () => {
    const params = new URLSearchParams({
      type: selectedType,
      count: String(questionCount),
    });
    if (selectedLevel !== 'all') params.set('level', selectedLevel);
    navigate(`/practice/session?${params}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="jp text-sm text-accent">小テスト</p>
            <h1 className="mt-1 text-3xl font-semibold">Luyện tập</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Chọn nội dung, trình độ và số câu để bắt đầu luyện tập.
            </p>
          </div>
          <span className="jp hidden shrink-0 text-6xl text-border sm:block">試</span>
        </header>

        <section className="mt-8 space-y-6">
          {/* Nội dung */}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Nội dung luyện tập
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TYPES.map((t) => (
                <button
                  key={t.type}
                  id={`practice-type-${t.type.toLowerCase()}`}
                  type="button"
                  onClick={() => setSelectedType(t.type)}
                  className={cn(
                    'surface-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-accent/60',
                    selectedType === t.type && 'border-accent bg-secondary shadow-[var(--shadow-glow)]',
                  )}
                >
                  <span className="jp block text-2xl text-accent">{t.jp}</span>
                  <span className="mt-2 block font-medium">{t.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Trình độ */}
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Trình độ
              </p>
              <div className="mt-3 inline-flex flex-wrap rounded-xl border border-border bg-card p-1">
                {(['all', ...LEVELS] as const).map((lvl) => (
                  <button
                    key={lvl}
                    id={`practice-level-${lvl.toLowerCase()}`}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={cn(
                      'rounded-lg px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors',
                      selectedLevel === lvl
                        ? 'bg-accent text-accent-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {lvl === 'all' ? 'Tất cả' : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Số câu hỏi */}
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Số câu hỏi
              </p>
              <div className="mt-3 inline-flex rounded-xl border border-border bg-card p-1">
                {COUNTS.map((n) => (
                  <button
                    key={n}
                    id={`practice-count-${n}`}
                    type="button"
                    onClick={() => setQuestionCount(n)}
                    className={cn(
                      'rounded-lg px-4 py-1.5 text-xs font-medium transition-colors',
                      questionCount === n
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {n} câu
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="surface-card flex flex-wrap items-center justify-between gap-4 p-5">
            <p className="text-sm text-muted-foreground">
              Quiz sẽ gồm tối đa {questionCount} câu, đảo ngẫu nhiên theo lựa chọn của bạn.
            </p>
            <button
              id="practice-start-btn"
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              Bắt đầu luyện tập <ArrowRight className="size-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
