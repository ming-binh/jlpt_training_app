import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Brain, MessageCircle, GraduationCap, Play, PenLine, RotateCcw, ListChecks, TrendingUp, Check } from "lucide-react";
import { GRAMMAR, KANJI, VOCAB } from "@/data/jlpt";
import { AppHeader } from "@/components/common/app-header";
import { jlptService, type VocabularyItem } from "@/services/jlpt.service";
import { userService, type DashboardStats } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { progressService } from "@/services/lesson.service";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { LevelPickerModal } from "../components/LevelPickerModal";

export function NihonHomePage() {
  const [counts, setCounts] = useState({
    vocab: VOCAB.length,
    kanji: KANJI.length,
    grammar: GRAMMAR.length,
  });

  const [wordOfDay, setWordOfDay] = useState<VocabularyItem | null>(null);
  const [userStats, setUserStats] = useState<DashboardStats | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(() => authService.isAuthenticated());
  const [todayDone, setTodayDone] = useState(false);
  const [displayName, setDisplayName] = useState<string>("Học Viên");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    progressService.getStreakCalendar()
      .then(days => setTodayDone(days[days.length - 1]?.studied ?? false))
      .catch(() => setTodayDone(false));

    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.full_name ?? data.user?.email ?? "Học Viên";
      setDisplayName(name.split(" ").pop() ?? name);
    });
  }, [isLoggedIn]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Chào buổi sáng";
    if (h < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  useEffect(() => {
    // Fetch stats, word of day & user profile stats from backend API
    Promise.all([
      jlptService.getVocabStats().catch(() => null),
      jlptService.getKanjiStats().catch(() => null),
      jlptService.getGrammarStats().catch(() => null),
      jlptService.getVocabulary("N5", "", 0, 1).catch(() => null),
      userService.getDashboardStats().catch(() => null),
    ]).then(([vocabRes, kanjiRes, grammarRes, vocabListRes, userStatsRes]) => {
      const vocabCount = vocabRes?.total && vocabRes.total > 0 ? vocabRes.total : VOCAB.length;
      const kanjiCount = kanjiRes?.total && kanjiRes.total > 0 ? kanjiRes.total : KANJI.length;
      const grammarCount = grammarRes?.total && grammarRes.total > 0 ? grammarRes.total : GRAMMAR.length;

      setCounts({
        vocab: vocabCount,
        kanji: kanjiCount,
        grammar: grammarCount,
      });

      if (vocabListRes?.content && vocabListRes.content.length > 0) {
        setWordOfDay(vocabListRes.content[0]);
      }

      if (userStatsRes) {
        setUserStats(userStatsRes);
        if (userStatsRes.onboarded === false) {
          setShowOnboarding(true);
        }
      }
    });
  }, []);

  const handleLevelSave = (level: string) => {
    userService
      .updateProfile({ jlptLevel: level })
      .then(() => {
        setUserStats((prev) => (prev ? { ...prev, jlptLevel: level, onboarded: true } : prev));
        setShowOnboarding(false);
      })
      .catch(() => setShowOnboarding(false));
  };

  const features = [
    {
      to: "/bai-hoc",
      kanji: "業",
      title: "Bài học cấu trúc",
      desc: "Học theo từng bài bản N5-N3, làm bài tập Quiz trắc nghiệm tích lũy XP.",
      icon: GraduationCap,
      count: "Xem bài học",
    },
    {
      to: "/tu-vung",
      kanji: "語",
      title: "Ôn từ vựng",
      desc: "Flashcard lật thẻ, ví dụ thực tế, phát âm tiếng Nhật, lọc theo cấp độ.",
      icon: BookOpen,
      count: `${counts.vocab} từ`,
    },
    {
      to: "/kanji",
      kanji: "漢",
      title: "Ôn kanji",
      desc: "Âm On/Kun, số nét và từ ghép thường gặp.",
      icon: PenLine,
      count: `${counts.kanji} chữ`,
    },
    {
      to: "/ngu-phap",
      kanji: "文",
      title: "Cấu trúc ngữ pháp",
      desc: "Công thức, sắc thái sử dụng và câu ví dụ song ngữ.",
      icon: Brain,
      count: `${counts.grammar} mẫu`,
    },
    {
      to: "/chat",
      kanji: "AI",
      title: "Trợ lý AI Sensei",
      desc: "Hỏi đáp ngữ pháp, dịch câu, luyện hội thoại 24/7.",
      icon: MessageCircle,
      count: "Chat ngay",
    },
  ];

  const currentWord = wordOfDay
    ? { word: wordOfDay.word, reading: wordOfDay.reading, meaning: wordOfDay.meaning }
    : VOCAB[0];

  // Dynamic calculations for user progress
  const userLevel = userStats?.jlptLevel ?? "N5";

  const vocabPct = userStats
    ? Math.min(100, Math.round((userStats.completedVocab / Math.max(1, counts.vocab)) * 100))
    : 0;
  const kanjiPct = userStats
    ? Math.min(100, Math.round((userStats.completedKanji / Math.max(1, counts.kanji)) * 100))
    : 0;
  const grammarPct = userStats
    ? Math.min(100, Math.round((userStats.completedGrammar / Math.max(1, counts.grammar)) * 100))
    : 0;

  const dynamicProgress = [
    { label: "Từ vựng", value: vocabPct, count: `${userStats?.completedVocab ?? 0}/${counts.vocab}` },
    { label: "Kanji", value: kanjiPct, count: `${userStats?.completedKanji ?? 0}/${counts.grammar}` },
    { label: "Ngữ pháp", value: grammarPct, count: `${userStats?.completedGrammar ?? 0}/${counts.grammar}` },
  ];

  const quickActions = [
    { to: "/learn", icon: BookOpen, label: "Tiếp tục học", desc: "Bài học tiếp theo" },
    { to: "/review", icon: RotateCcw, label: "Ôn tập", desc: "Thẻ cần nhắc lại" },
    { to: "/practice", icon: ListChecks, label: "Luyện tập", desc: "Quiz tổng hợp" },
    { to: "/progress", icon: TrendingUp, label: "Tiến độ", desc: "Xem thống kê" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      {/* Nhiệm vụ hôm nay — logged-in users only */}
      {isLoggedIn && (
        <section className="border-b border-border bg-card/40">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-full border",
                  todayDone ? "border-accent bg-accent/15 text-accent" : "border-border text-muted-foreground",
                )}
              >
                {todayDone && <Check className="size-4" />}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{greeting()}, {displayName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {todayDone
                    ? "Bạn đã hoàn thành nhiệm vụ hôm nay."
                    : "Nhiệm vụ hôm nay: hoàn thành 1 lượt luyện tập hoặc ôn tập."}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:ml-auto">
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-background/60 px-3 py-2.5 transition-colors hover:bg-secondary"
                >
                  <action.icon className="size-4 shrink-0 text-accent" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{action.label}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{action.desc}</span>
                  </span>
                  <ArrowRight className="ml-auto size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="gradient-indigo absolute inset-0" />
        <div className="seigaiha absolute inset-0 opacity-70" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.15fr_0.85fr] md:py-20">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accent backdrop-blur-sm">
                Mục tiêu {userLevel}
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.15] md:text-6xl">
              Chinh phục <span className="text-gold">JLPT {userLevel}</span> bằng
              <br />
              15 phút mỗi ngày
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
              Lộ trình JLPT {userLevel} được cá nhân hóa qua bài học bài bản, lật thẻ từ vựng, tập viết kanji, làm chủ ngữ pháp và đối thoại 24/7 cùng trợ lý Sensei AI.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/bai-hoc"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <GraduationCap className="size-5" /> Vào Học Bài Học <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-6 py-3.5 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-secondary"
              >
                <MessageCircle className="size-4 text-accent" /> Hỏi trợ lý AI
              </Link>
            </div>
          </div>

          {/* Word of the day & progress widget */}
          <div className="surface-card relative p-6 md:p-8">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Từ của ngày
              </p>
              <span className="text-xs font-bold text-accent bg-accent/10 border border-accent/30 rounded-lg px-2 py-0.5">
                {userLevel}
              </span>
            </div>
            <p className="jp mt-4 text-5xl font-bold leading-none md:text-6xl">{currentWord.word}</p>
            <p className="jp mt-3 text-lg font-medium text-accent">{currentWord.reading}</p>
            <p className="mt-1 text-sm text-muted-foreground">{currentWord.meaning}</p>
            <div className="mt-6 space-y-4 border-t border-border pt-5">
              {dynamicProgress.map((p) => (
                <div key={p.label}>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{p.label} <span className="text-[11px] opacity-70">({p.count})</span></span>
                    <span className="font-mono text-accent">{p.value}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${Math.max(5, p.value)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Promoted Lesson Banner */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="surface-card relative overflow-hidden p-8 border border-accent/40 bg-gradient-to-r from-accent/10 via-background to-accent/5 rounded-3xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 border border-accent/40 px-3 py-1 text-xs font-bold text-accent">
                <GraduationCap className="size-4" /> Mới cập nhật
              </span>
              <h2 className="text-2xl font-bold">Bài Học Cấu Trúc JLPT ({userLevel})</h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                Hệ thống các bài học được biên soạn theo lộ trình N5 ➔ N3. Mỗi bài gồm Flashcard lý thuyết và Quiz trắc nghiệm đánh giá năng lực tích lũy XP.
              </p>
            </div>
            <Link
              to="/bai-hoc"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground shadow-md transition-transform hover:scale-105"
            >
              <Play className="size-4 fill-current" /> Xem Danh Sách Bài Học
            </Link>
          </div>
        </div>
      </section>

      {/* 5 Skill Rooms */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold">Các phòng luyện tập & bài học</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Chọn kỹ năng bạn muốn rèn hôm nay cho trình độ {userLevel}.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="surface-card group relative overflow-hidden p-6 transition-transform hover:-translate-y-1"
            >
              <span className="jp pointer-events-none absolute -right-3 -top-6 text-8xl text-secondary/70 transition-colors group-hover:text-primary/40">
                {f.kanji}
              </span>
              {f.to === "/kanji" ? (
                <span className="jp relative text-base font-bold text-accent">漢</span>
              ) : (
                <f.icon className="relative size-6 text-accent" />
              )}
              <h3 className="relative mt-5 text-base font-semibold">{f.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
              <span className="relative mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {f.count} <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Nihon Journey · 毎日少しずつ — mỗi ngày một chút
      </footer>

      {showOnboarding && (
        <LevelPickerModal
          mode="onboarding"
          currentLevel={userStats?.jlptLevel ?? "N5"}
          onClose={() => setShowOnboarding(false)}
          onSave={handleLevelSave}
        />
      )}
    </div>
  );
}
