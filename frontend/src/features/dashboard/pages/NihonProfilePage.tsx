import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Brain,
  CalendarClock,
  Check,
  Flame,
  Mail,
  PenLine,
  ShieldCheck,
  Sparkles,
  Target,
  ArrowRight,
  Edit2,
  X,
  User as UserIcon,
} from "lucide-react";
import { AppHeader } from "@/components/common/app-header";
import { userService, type DashboardStats, type UserProfile } from "@/services/user.service";
import { progressService, type ProgressSummary } from "@/services/lesson.service";
import { LevelPickerModal } from "../components/LevelPickerModal";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";
import { FadeIn } from "@/components/ui/fade-in";


const MASTERED_META = [
  { key: 'masteredVocab' as const, label: 'Từ vựng', kanji: '語', icon: BookOpen, to: '/tu-vung' },
  { key: 'masteredKanji' as const, label: 'Kanji', kanji: '漢', icon: PenLine, to: '/kanji' },
  { key: 'masteredGrammar' as const, label: 'Ngữ pháp', kanji: '文', icon: Brain, to: '/ngu-phap' },
];

const PROGRESS_DEFAULT: ProgressSummary = {
  streak: 0, xp: 0, xpToNextLevel: 500,
  masteredVocab: 0, masteredKanji: 0, masteredGrammar: 0,
  todayGoalComplete: false, jlptLevel: 'N5',
};

const WEEK_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const NEXT_LEVEL_MAP: Record<string, string> = {
  N5: "N4",
  N4: "N3",
  N3: "Chinh phục N3!",
};

export function NihonProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary>(PROGRESS_DEFAULT);
  const [todayDone, setTodayDone] = useState(false);
  const [showLevelEdit, setShowLevelEdit] = useState(false);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      userService.getCurrentUser().catch(() => null),
      userService.getDashboardStats().catch(() => null),
    ]).then(([profileRes, statsRes]) => {
      if (profileRes) {
        setProfile(profileRes);
        setNameInput(profileRes.displayName || profileRes.username || "");
      }
      if (statsRes) {
        setStats(statsRes);
        if (!profileRes) {
          setNameInput(statsRes.username || "");
        }
      }
      setLoading(false);
    });
    progressService.getSummary().then(setProgressSummary).catch(() => setProgressSummary(PROGRESS_DEFAULT));
    progressService.getStreakCalendar()
      .then(days => setTodayDone(days[days.length - 1]?.studied ?? false))
      .catch(() => setTodayDone(false));
  }, []);

  const handleLevelSave = (level: string) => {
    userService
      .updateProfile({ jlptLevel: level })
      .then((updated) => {
        setProfile(updated);
        toast.success("Đã cập nhật trình độ học.");
        setShowLevelEdit(false);
      })
      .catch(() => toast.error("Không thể cập nhật trình độ."));
  };

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim();
    if (!cleanName) {
      toast.error("Vui lòng nhập tên.");
      return;
    }

    try {
      const updated = await userService.updateProfile({ username: cleanName });
      setProfile(updated);
      // Sync to Supabase auth user_metadata as well
      await supabase.auth.updateUser({
        data: { name: cleanName, full_name: cleanName },
      });
      toast.success("Đã cập nhật tên thành công!");
      setShowNameEdit(false);
    } catch (err) {
      toast.error("Không thể cập nhật tên. Vui lòng thử lại!");
    }
  };

  // Compute dynamic user values
  const email = profile?.email || "hocvien@example.com";
  const displayName = profile?.displayName || profile?.username || stats?.username || email.split("@")[0];
  const initial = (displayName[0] || email[0] || "U").toUpperCase();
  const jlptLevel = profile?.jlptLevel || stats?.jlptLevel || "N5";
  const streakDays = stats?.streakDays ?? profile?.streakDays ?? 1;
  const mockScore = stats?.mockScore ?? profile?.mockScore ?? null;
  const nextLevel = NEXT_LEVEL_MAP[jlptLevel] || "N4";

  // Compute 7-day week activity streak states dynamically
  const now = new Date();
  const dayOfWeekIndex = (now.getDay() + 6) % 7; // Convert Sunday=0 -> 6, Monday=1 -> 0
  const weekTracker = WEEK_DAYS.map((label, idx) => {
    const isActive = idx <= dayOfWeekIndex && idx >= Math.max(0, dayOfWeekIndex - (streakDays - 1));
    return { label, done: isActive };
  });

  // Dynamic weak sections list
  const rawWeak = stats?.weakSections || profile?.weakSections;
  const weakSectionsList = rawWeak
    ? rawWeak.split(",").map((s) => s.trim()).filter(Boolean)
    : ["Kanji âm On", "Trợ từ は / が", "Nghe hội thoại nhanh"];

  // Format last active time
  const formattedTime = new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const lastActiveText = `Hôm nay, ${formattedTime}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <div className="relative overflow-hidden border-b border-border/40">
        <div className="gradient-indigo absolute inset-x-0 top-0 h-56" />
        <div className="seigaiha absolute inset-x-0 top-0 h-56 opacity-60" />

        <main className="relative mx-auto max-w-5xl px-4 pb-14 pt-8 sm:pt-12">
          {/* User Profile Card */}
          <FadeIn from="up" delay={0} immediate>
          <section className="surface-card p-5 sm:p-7">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 sm:gap-6">
              <div className="relative shrink-0">
                <div className="jp grid size-20 place-items-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground shadow-[var(--shadow-lift)] sm:size-24">
                  {initial}
                </div>
                <span className="jp absolute -bottom-2 -right-2 grid size-8 place-items-center rounded-full border border-border bg-secondary text-xs font-bold text-accent shadow-sm">
                  {jlptLevel}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="truncate text-2xl font-bold sm:text-3xl">
                    {loading ? "Đang tải..." : displayName}
                  </h1>
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(displayName);
                      setShowNameEdit(true);
                    }}
                    className="p-1.5 rounded-lg border border-border bg-secondary/80 text-muted-foreground hover:text-accent hover:border-accent/50 transition-colors cursor-pointer"
                    title="Đổi tên hiển thị"
                  >
                    <Edit2 className="size-3.5" />
                  </button>
                </div>

                <p className="mt-1 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="size-4 shrink-0 text-accent" />
                  <span className="truncate">{email}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-accent">
                    <ShieldCheck className="size-3.5" />
                    Học viên
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                    <CalendarClock className="size-3.5" />
                    {lastActiveText}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Name Edit Modal */}
          {showNameEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
              <div className="surface-card w-full max-w-md p-6 rounded-2xl border border-border shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <UserIcon className="size-5 text-accent" /> Đổi Tên Hiển Thị
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowNameEdit(false)}
                    className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Tên này sẽ được Sensei AI dùng để xưng hô trong phòng chat và hiển thị trên toàn hệ thống.
                </p>

                <form onSubmit={handleNameSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Tên của bạn
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Ví dụ: Bình Minh, Minh-san, ..."
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                      maxLength={50}
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNameEdit(false)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-secondary text-muted-foreground transition-colors cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold rounded-xl bg-accent text-accent-foreground shadow-md hover:bg-accent/90 transition-transform active:scale-95 cursor-pointer"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Streak Card — Main Highlight */}
          <section className="surface-card mt-6 overflow-hidden border border-border/80">
            <div className="gradient-indigo relative p-5 sm:p-7">
              <div className="seigaiha absolute inset-0 opacity-70" />
              <div className="relative grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                <div className="flex items-center gap-4">
                  <span className="grid size-16 place-items-center rounded-2xl bg-secondary shadow-[var(--shadow-glow)] sm:size-20">
                    <Flame className="size-8 text-accent animate-pulse sm:size-10 text-amber-400" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Chuỗi ngày học
                    </p>
                    <p className="text-5xl font-bold leading-none text-gold sm:text-6xl">
                      {streakDays}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Kỷ lục: {Math.max(streakDays, 7)} ngày
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-end justify-between gap-1.5">
                    {weekTracker.map((d) => (
                      <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                        <span
                          className={
                            d.done
                              ? "grid size-8 place-items-center rounded-xl bg-accent text-xs font-bold text-accent-foreground shadow-[var(--shadow-glow)]"
                              : "grid size-8 place-items-center rounded-xl border border-border/60 bg-secondary/40 text-xs text-muted-foreground"
                          }
                        >
                          {d.done ? <Check className="size-4 stroke-[3]" /> : d.label}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {d.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-accent" />
                    {todayDone
                      ? "Bạn đã hoàn thành mục tiêu học hôm nay. Tuyệt vời!"
                      : "Học thêm 1 bài hôm nay để duy trì chuỗi liên tục!"}
                  </p>
                </div>
              </div>
            </div>
          </section>
          </FadeIn>

          {/* Mastered Skills Grid */}
          <FadeIn from="up" delay={0}>
          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            {MASTERED_META.map((item) => {
              const count = progressSummary[item.key] || 0;
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className="surface-card group p-5 transition-all hover:border-accent/60 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="jp grid size-12 place-items-center rounded-xl bg-secondary text-lg font-bold text-accent group-hover:scale-105 transition-transform">
                      {item.kanji}
                    </span>
                    <Icon className="size-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <p className="mt-4 text-3xl font-bold text-foreground">
                    {loading ? "..." : count}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground flex items-center justify-between">
                    <span>Đã thành thạo {item.label.toLowerCase()}</span>
                    <ArrowRight className="size-3.5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                </Link>
              );
            })}
          </section>
          </FadeIn>

          {/* JLPT Target Level & Roadmap */}
          <FadeIn from="up" delay={0}>
          <section className="surface-card mt-6 p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-secondary text-accent">
                  <Target className="size-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold">Mục tiêu cấp độ JLPT</h2>
                  <p className="text-xs text-muted-foreground">
                    Lộ trình học tập được tối ưu cho cấp độ {jlptLevel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLevelEdit(true)}
                className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-accent/60 hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                Đổi trình độ
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="text-xs text-muted-foreground">Cấp độ hiện tại</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-accent">{jlptLevel}</span>
                  <span className="text-xs text-muted-foreground">
                    (Đang hoàn thành {Math.min(100, Math.round(((progressSummary.masteredVocab + progressSummary.masteredKanji + progressSummary.masteredGrammar) / 100) * 100))}% kiến thức)
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-accent transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(10, ((progressSummary.masteredVocab + progressSummary.masteredKanji + progressSummary.masteredGrammar) / 100) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="text-xs text-muted-foreground">Điểm thi thử JLPT gần nhất</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {mockScore ? `${mockScore} / 180` : "Chưa có bài thi"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Mục tiêu tiếp theo: <strong className="text-foreground font-semibold">{nextLevel}</strong>
                </p>
              </div>
            </div>

            {/* Weak sections review */}
            <div className="mt-5 border-t border-border/40 pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Phần cần củng cố thêm
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {weakSectionsList.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400"
                  >
                    ⚠ {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>
          </FadeIn>
        </main>
      </div>

      {/* Level Picker Modal */}
      {showLevelEdit && (
        <LevelPickerModal
          mode="edit"
          currentLevel={jlptLevel}
          onSave={handleLevelSave}
          onClose={() => setShowLevelEdit(false)}
        />
      )}
    </div>
  );
}
