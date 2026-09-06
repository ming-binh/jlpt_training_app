import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Calendar,
  Zap,
  RotateCcw,
  ArrowRight,
  Search,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";
import { AppHeader } from "@/components/common/app-header";
import { FadeIn } from "@/components/ui/fade-in";
import { LevelBadge } from "@/components/common/level-filter";
import { examService, type ExamAttemptReview } from "@/services/exam.service";
import { formatMondaiTitle, formatExamTitle } from "../utils/examFormatters";
import { cn } from "@/lib/utils";

type LevelFilterType = "all" | "N5" | "N4" | "N3";
type StatusFilterType = "all" | "passed" | "failed";

interface ExamGroup {
  examId: number | null;
  examTitle: string;
  examCode: string | null | undefined;
  jlptLevel: string;
  bestAttempt: ExamAttemptReview;
  allAttempts: ExamAttemptReview[];
}

function AttemptRow({ item, isCompact = false }: { item: ExamAttemptReview; isCompact?: boolean }) {
  const minutes = Math.floor(item.timeSpentSeconds / 60);
  const seconds = item.timeSpentSeconds % 60;
  const isFullExam = !item.sectionId;

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all",
      isCompact ? "py-3 border-t border-border/40" : "rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-4 sm:p-5 hover:border-accent/40 hover:shadow-md group"
    )}>
      {/* Left: Exam Info */}
      <div className="space-y-1.5 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {!isCompact && <LevelBadge level={item.jlptLevel} />}
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
            {isFullExam ? "Toàn bộ đề thi" : formatMondaiTitle(item.sectionTitle)}
          </span>
          <div className={cn(
            "flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border",
            item.isPassed
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
          )}>
            {item.isPassed ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
            <span>{item.isPassed ? "ĐẠT" : "CHƯA ĐẠT"}</span>
          </div>
        </div>

        {!isCompact && (
          <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-accent transition-colors">
            {formatExamTitle(item.examTitle)}
          </h3>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1 font-sans">
            <Calendar className="size-3 text-muted-foreground" />
            <span>{item.submittedAt || "Gần đây"}</span>
          </span>
          <span className="flex items-center gap-1 font-sans">
            <Clock className="size-3 text-muted-foreground" />
            <span>{minutes}:{String(seconds).padStart(2, "0")} phút</span>
          </span>
          {item.xpEarned > 0 && (
            <span className="flex items-center gap-1 text-amber-400 font-sans font-semibold">
              <Zap className="size-3" />
              <span>+{item.xpEarned} XP</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Score + Actions */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-border/50">
        <div className="text-left sm:text-right">
          <p className="text-xl font-black text-foreground">
            {item.score} <span className="text-xs text-muted-foreground font-normal">/ {item.maxScore}đ</span>
          </p>
          <p className="text-[11px] text-muted-foreground font-mono">
            {item.correctCount}/{item.totalQuestions} câu ({item.percentage}%)
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Link
            to={`/luyen-de/review/${item.attemptId}`}
            className="inline-flex items-center gap-1 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground hover:bg-accent/90 transition-all cursor-pointer"
          >
            <span>Xem lại</span>
            <ArrowRight className="size-3" />
          </Link>
          <Link
            to={isFullExam ? `/luyen-de/${item.examId}/take` : `/luyen-de/${item.examId}/mondai/${item.sectionId}`}
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            title="Làm lại đề thi này"
          >
            <RotateCcw className="size-3" />
            <span className="hidden sm:inline">Làm lại</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ExamGroupCard({ group }: { group: ExamGroup }) {
  const [expanded, setExpanded] = useState(false);
  const otherAttempts = group.allAttempts.filter((a) => a.attemptId !== group.bestAttempt.attemptId);
  const totalAttempts = group.allAttempts.length;
  const passedCount = group.allAttempts.filter((a) => a.isPassed).length;
  const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden transition-all hover:border-accent/30 hover:shadow-lg">
      {/* Group Header */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LevelBadge level={group.jlptLevel} />
            <div>
              <h3 className="text-sm font-bold text-foreground">{formatExamTitle(group.examTitle)}</h3>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                {totalAttempts} lượt thi · {passedCount} lần đạt · Tỷ lệ {passRate}%
              </p>
            </div>
          </div>

          {/* Best attempt score badge */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <Trophy className="size-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-muted-foreground">Điểm tốt nhất</span>
              </div>
              <p className="text-lg font-black text-foreground">
                {group.bestAttempt.score}<span className="text-xs font-normal text-muted-foreground">/{group.bestAttempt.maxScore}đ</span>
                <span className={cn(
                  "ml-2 text-xs font-bold",
                  group.bestAttempt.isPassed ? "text-emerald-400" : "text-rose-400"
                )}>({group.bestAttempt.percentage}%)</span>
              </p>
            </div>
            <div className={cn(
              "flex size-9 items-center justify-center rounded-xl border",
              group.bestAttempt.isPassed
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            )}>
              {group.bestAttempt.isPassed ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
            </div>
          </div>
        </div>

        {/* Best attempt row */}
        <div className="mt-4">
          <AttemptRow item={group.bestAttempt} isCompact />
        </div>

        {/* Expand / collapse toggle */}
        {otherAttempts.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 rounded-xl hover:bg-secondary/50 cursor-pointer"
          >
            {expanded ? (
              <>
                <ChevronUp className="size-3.5" />
                <span>Ẩn {otherAttempts.length} lượt thi khác</span>
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5" />
                <span>Xem thêm {otherAttempts.length} lượt thi trước</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Other attempts (collapsed by default) */}
      {expanded && otherAttempts.length > 0 && (
        <div className="border-t border-border/60 bg-secondary/10 px-4 sm:px-5 pb-4 space-y-0 animate-in slide-in-from-top-2 duration-200">
          {otherAttempts.map((attempt) => (
            <AttemptRow key={attempt.attemptId} item={attempt} isCompact />
          ))}
        </div>
      )}
    </div>
  );
}

export function ExamHistoryPage() {
  const [history, setHistory] = useState<ExamAttemptReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<LevelFilterType>("all");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterType>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    examService.getUserHistory()
      .then((data) => {
        setHistory(data || []);
      })
      .catch((err) => {
        console.error("Failed to load user exam history:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter list
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (selectedLevel !== "all" && item.jlptLevel?.toUpperCase() !== selectedLevel) return false;
      if (selectedStatus === "passed" && !item.isPassed) return false;
      if (selectedStatus === "failed" && item.isPassed) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = item.examTitle?.toLowerCase().includes(q);
        const matchSection = item.sectionTitle?.toLowerCase().includes(q);
        const matchCode = item.examCode?.toLowerCase().includes(q);
        if (!matchTitle && !matchSection && !matchCode) return false;
      }
      return true;
    });
  }, [history, selectedLevel, selectedStatus, search]);

  // Group filtered history by examId
  const examGroups = useMemo((): ExamGroup[] => {
    const groupMap = new Map<number | null, ExamAttemptReview[]>();

    filteredHistory.forEach((item) => {
      const key = item.examId ?? null;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(item);
    });

    return Array.from(groupMap.entries()).map(([examId, attempts]) => {
      // Sort by submittedAt desc (most recent first)
      const sorted = [...attempts].sort((a, b) => {
        const dateA = a.submittedAt || "";
        const dateB = b.submittedAt || "";
        return dateB.localeCompare(dateA);
      });

      // Pick best attempt (highest score, then most recent)
      const best = [...attempts].sort((a, b) => {
        const pctDiff = (b.percentage || 0) - (a.percentage || 0);
        return pctDiff !== 0 ? pctDiff : (b.score - a.score);
      })[0];

      const first = sorted[0];
      return {
        examId,
        examTitle: first.examTitle || "Đề thi JLPT",
        examCode: first.examCode,
        jlptLevel: first.jlptLevel || "",
        bestAttempt: best,
        allAttempts: sorted,
      };
    });
  }, [filteredHistory]);

  // Overall statistics
  const totalAttempts = history.length;
  const passedAttempts = history.filter((h) => h.isPassed).length;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
  const totalXp = history.reduce((acc, h) => acc + (h.xpEarned || 0), 0);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Link
            to="/luyen-de"
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Kho đề thi JLPT</span>
          </Link>
        </div>

        {/* Hero Banner */}
        <FadeIn from="up" delay={0} immediate>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="jp text-xs font-bold uppercase tracking-[0.24em] text-accent flex items-center gap-1.5">
                  <History className="size-4" /> 受験履歴 · Exam History
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {totalAttempts} lượt làm bài
                </span>
              </div>
              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
                Lịch Sử Luyện Thi & Tiến Độ
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Theo dõi kết quả từng lượt làm bài thi thử JLPT từ N5 đến N3. Xem tiến bộ qua từng lần thử và xem lại giải thích chi tiết để khắc phục điểm yếu.
              </p>
            </div>

            {/* Overall Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="rounded-2xl border border-border/80 bg-card/60 p-3.5 text-center">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Tổng lượt thi</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{totalAttempts}</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-center">
                <p className="text-[10px] font-semibold text-emerald-400 uppercase">Đạt chuẩn</p>
                <p className="text-xl font-bold text-emerald-400 mt-0.5">{passedAttempts}</p>
              </div>
              <div className="rounded-2xl border border-accent/30 bg-accent/10 p-3.5 text-center">
                <p className="text-[10px] font-semibold text-accent uppercase">Tỷ lệ đỗ</p>
                <p className="text-xl font-bold text-accent mt-0.5">{passRate}%</p>
              </div>
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-center">
                <p className="text-[10px] font-semibold text-amber-400 uppercase">XP tích lũy</p>
                <p className="text-xl font-bold text-amber-400 mt-0.5">+{totalXp}</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Filters Toolbar */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Level tabs focusing N5..N3 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(["all", "N5", "N4", "N3"] as LevelFilterType[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer border",
                  selectedLevel === lvl
                    ? "bg-accent text-accent-foreground border-accent shadow-sm"
                    : "bg-card/60 border-border/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {lvl === "all" ? "Tất cả cấp độ" : lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Status toggle */}
            <div className="flex items-center rounded-xl bg-secondary/50 p-1 border border-border/60 text-xs">
              <button
                type="button"
                onClick={() => setSelectedStatus("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer",
                  selectedStatus === "all" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus("passed")}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer",
                  selectedStatus === "passed" ? "bg-emerald-500/15 text-emerald-400 font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Đạt
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus("failed")}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer",
                  selectedStatus === "failed" ? "bg-rose-500/15 text-rose-400 font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Chưa đạt
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm tên đề, Mondai..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border/80 bg-card/60 outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mt-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <div className="size-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              <p className="text-xs">Đang tải lịch sử thi...</p>
            </div>
          ) : examGroups.length === 0 ? (
            <div className="rounded-3xl border border-border/80 bg-card/40 p-12 text-center space-y-4 max-w-md mx-auto">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary mx-auto text-muted-foreground">
                <BookOpen className="size-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Chưa có lịch sử làm đề phù hợp</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {search || selectedLevel !== "all" || selectedStatus !== "all"
                    ? "Không tìm thấy lượt thi nào theo bộ lọc đã chọn. Hãy thử xóa bộ lọc!"
                    : "Bạn chưa hoàn thành bài thi nào. Hãy bắt đầu làm thử một đề để kiểm tra năng lực nhé!"}
                </p>
              </div>
              <Link
                to="/luyen-de"
                className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-xs font-bold text-accent-foreground shadow-md hover:bg-accent/90 transition-all cursor-pointer"
              >
                <Sparkles className="size-3.5" />
                <span>Chọn đề luyện thi ngay</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Hiển thị <strong className="text-foreground">{examGroups.length}</strong> đề thi, tổng cộng <strong className="text-foreground">{filteredHistory.length}</strong> lượt làm bài
              </p>
              {examGroups.map((group) => (
                <ExamGroupCard key={group.examId ?? "unknown"} group={group} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
