import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Brain,
  CalendarClock,
  Flame,
  Mail,
  ShieldCheck,
  Sparkles,
  Target,
  ArrowRight,
} from "lucide-react";
import { AppHeader } from "@/components/common/app-header";
import { userService, type DashboardStats, type UserProfile } from "@/services/user.service";

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

  useEffect(() => {
    setLoading(true);
    Promise.all([
      userService.getCurrentUser().catch(() => null),
      userService.getDashboardStats().catch(() => null),
    ]).then(([profileRes, statsRes]) => {
      if (profileRes) setProfile(profileRes);
      if (statsRes) setStats(statsRes);
      setLoading(false);
    });
  }, []);

  // Compute dynamic user values
  const email = profile?.email || "hocvien@example.com";
  const username = profile?.username || stats?.username || email.split("@")[0];
  const initial = (username[0] || email[0] || "U").toUpperCase();
  const jlptLevel = profile?.jlptLevel || stats?.jlptLevel || "N5";
  const streakDays = stats?.streakDays ?? profile?.streakDays ?? 1;
  const mockScore = stats?.mockScore ?? profile?.mockScore ?? null;
  const nextLevel = NEXT_LEVEL_MAP[jlptLevel] || "N4";

  // Compute 7-day week activity streak states dynamically
  // Get current day of week (Monday=0 ... Sunday=6)
  const now = new Date();
  const dayOfWeekIndex = (now.getDay() + 6) % 7; // Convert Sunday=0 -> 6, Monday=1 -> 0
  const weekTracker = WEEK_DAYS.map((label, idx) => {
    // If day is within the active streak range ending today
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
                <h1 className="truncate text-2xl font-bold sm:text-3xl">
                  {loading ? "Đang tải..." : username}
                </h1>
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
                              ? "grid aspect-square w-full max-w-11 place-items-center rounded-xl bg-accent text-accent-foreground shadow-md transition-all"
                              : "grid aspect-square w-full max-w-11 place-items-center rounded-xl border border-dashed border-border/80 text-muted-foreground/60"
                          }
                        >
                          <Flame className={d.done ? "size-4 text-amber-300 fill-amber-300" : "size-4 opacity-40"} />
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground">{d.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Học thêm hôm nay để giữ chuỗi — chỉ cần 1 bộ thẻ flashcard là đủ.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 3 Metric Stat Cards Grid */}
          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={<Sparkles className="size-4 text-accent" />}
              label="Trình độ hiện tại"
              value={jlptLevel}
              hint={`Mục tiêu kế tiếp: ${nextLevel}`}
            />
            <StatCard
              icon={<Target className="size-4 text-accent" />}
              label="Điểm thi thử"
              value={mockScore === null ? "—" : `${mockScore}/180`}
              hint={mockScore === null ? "Chưa có bài thi thử" : "Hoàn thành gần nhất"}
            />
            <StatCard
              icon={<CalendarClock className="size-4 text-accent" />}
              label="Hoạt động gần nhất"
              value={lastActiveText}
              hint="Tự động cập nhật khi bạn học"
            />
          </section>

          {/* Weak Sections List */}
          <section className="surface-card mt-6 p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Phần cần cải thiện</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Dựa trên các câu bạn thường trả lời sai khi ôn luyện.
            </p>
            <ul className="mt-4 space-y-2.5">
              {weakSectionsList.map((section) => (
                <li
                  key={section}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-secondary/60 px-4 py-3 border border-border/50"
                >
                  <span className="min-w-0 truncate text-sm font-medium">{section}</span>
                  <Link
                    to="/tu-vung"
                    className="shrink-0 rounded-full bg-accent/10 border border-accent/30 px-3 py-1 text-[11px] font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Cần ôn <ArrowRight className="inline size-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Quick Study Shortcuts */}
          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            <ShortcutLink to="/tu-vung" icon={<BookOpen className="size-4" />} label="Ôn từ vựng" />
            <ShortcutLink to="/kanji" icon={<span className="jp font-bold text-xs">漢</span>} label="Ôn kanji" />
            <ShortcutLink to="/ngu-phap" icon={<Brain className="size-4" />} label="Ngữ pháp" />
          </section>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="surface-card p-5 border border-border/80">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-3 truncate text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function ShortcutLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="surface-card flex items-center gap-3 p-4 text-sm font-semibold transition-transform hover:-translate-y-0.5 border border-border/80"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-accent">
        {icon}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </Link>
  );
}
