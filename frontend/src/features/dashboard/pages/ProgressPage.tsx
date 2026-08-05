import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, PenLine, Check, ArrowRight } from 'lucide-react';
import { AppHeader } from '@/components/common/app-header';
import { progressService } from '@/services/lesson.service';
import type { ProgressSummary } from '@/services/lesson.service';

const DEFAULT: ProgressSummary = {
  streak: 0, xp: 0, xpToNextLevel: 500,
  masteredVocab: 0, masteredKanji: 0, masteredGrammar: 0,
  todayGoalComplete: false, jlptLevel: 'N5',
};

const MASTERED_META = [
  { key: 'masteredVocab', label: 'Từ vựng', kanji: '語', icon: BookOpen, to: '/tu-vung' },
  { key: 'masteredKanji', label: 'Kanji', kanji: '漢', icon: PenLine, to: '/kanji' },
  { key: 'masteredGrammar', label: 'Ngữ pháp', kanji: '文', icon: Brain, to: '/ngu-phap' },
] as const;

export const ProgressPage: React.FC = () => {
  const [summary, setSummary] = useState<ProgressSummary>(DEFAULT);
  const [todayDone, setTodayDone] = useState(false);

  useEffect(() => {
    progressService.getSummary().then(setSummary).catch(() => setSummary(DEFAULT));
    progressService.getStreakCalendar()
      .then(days => setTodayDone(days[days.length - 1]?.studied ?? false))
      .catch(() => setTodayDone(false));
  }, []);

  const totalMastered = summary.masteredVocab + summary.masteredKanji + summary.masteredGrammar;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <header>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Bảng theo dõi</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Tiến độ học tập</h1>
        </header>

        {/* Nhiệm vụ hôm nay */}
        <section className="surface-card mt-8 flex flex-wrap items-center gap-4 p-6">
          <span
            className={
              todayDone
                ? "grid size-11 shrink-0 place-items-center rounded-full border border-accent bg-accent/15 text-accent"
                : "grid size-11 shrink-0 place-items-center rounded-full border border-border"
            }
          >
            {todayDone && <Check className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Nhiệm vụ hôm nay</p>
            <p className="text-xs text-muted-foreground">
              {todayDone
                ? 'Bạn đã hoàn thành lượt học hôm nay.'
                : 'Hoàn thành 1 lượt luyện tập hoặc ôn tập để giữ tiến độ.'}
            </p>
          </div>
          {!todayDone && (
            <Link
              to="/practice"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              Luyện tập ngay <ArrowRight className="size-4" />
            </Link>
          )}
        </section>

        {/* Đã thuộc */}
        <section className="mt-10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Đã thuộc</h2>
            <span className="ml-auto text-xs text-muted-foreground">Tổng {totalMastered} mục</span>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {MASTERED_META.map((m) => (
              <Link
                key={m.key}
                to={m.to}
                className="surface-card group relative overflow-hidden p-6 transition-transform hover:-translate-y-1"
              >
                <span className="jp pointer-events-none absolute -right-2 -top-5 text-7xl text-secondary/60 transition-colors group-hover:text-primary/40">
                  {m.kanji}
                </span>
                <m.icon className="relative size-5 text-accent" />
                <p className="relative mt-4 text-3xl font-semibold">{summary[m.key]}</p>
                <p className="relative text-xs text-muted-foreground">{m.label}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
