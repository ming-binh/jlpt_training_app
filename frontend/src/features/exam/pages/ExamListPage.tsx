import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, FileText, Search, RotateCcw, History } from "lucide-react";
import { type Level } from "@/data/jlpt";
import { LevelFilter } from "@/components/common/level-filter";
import { AppHeader } from "@/components/common/app-header";
import { FadeIn } from "@/components/ui/fade-in";
import { ExamCard } from "../components/ExamCard";
import { examService, type ExamItem } from "@/services/exam.service";
import { formatExamTitle } from "../utils/examFormatters";
import { cn } from "@/lib/utils";

type StatusFilterType = "all" | "done" | "passed" | "todo";

export function ExamListPage() {
  const [level, setLevel] = useState<Level | "all">("all");
  const [statusTab, setStatusTab] = useState<StatusFilterType>("all");
  const [search, setSearch] = useState("");
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    examService.getExams(level)
      .then((data) => {
        setExams(data || []);
      })
      .catch((err) => {
        console.error("Failed to load exams:", err);
      })
      .finally(() => setLoading(false));
  }, [level]);

  // Client side filtering for search & status tab
  const filteredExams = exams.filter((e) => {
    // Search match
    if (search.trim()) {
      const q = search.toLowerCase();
      const formattedT = formatExamTitle(e.title).toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q) || formattedT.includes(q);
      const matchDesc = e.description?.toLowerCase().includes(q);
      const matchCode = e.code.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCode) return false;
    }

    // Status match
    const hasAttempted = e.userAttemptCount !== undefined && e.userAttemptCount > 0;
    if (statusTab === "done" && !hasAttempted) return false;
    if (statusTab === "todo" && hasAttempted) return false;
    if (statusTab === "passed" && !e.userPassed) return false;

    return true;
  });

  const totalExams = exams.length;
  const attemptedCount = exams.filter((e) => (e.userAttemptCount || 0) > 0).length;
  const passedCount = exams.filter((e) => e.userPassed).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <FadeIn from="up" delay={0} immediate>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="jp text-xs font-bold uppercase tracking-[0.24em] text-accent flex items-center gap-1.5">
                  <Award className="size-4" /> 模擬試験 · Mock Exams
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {totalExams} đề thi thật
                </span>
              </div>
              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
                Luyện Đề Thi JLPT Thực Tế
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Đầy đủ cấu trúc đề thi chính thức từ N5 đến N1 qua các năm. Luyện thi bấm giờ theo từng Mondai hoặc làm bài thi thử toàn diện kèm giải thích chi tiết.
              </p>
            </div>

            {/* Quick stats mini cards & History button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-border/80 bg-card/60 px-4 py-3 text-center">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Đã làm</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{attemptedCount} <span className="text-xs text-muted-foreground">/ {totalExams}</span></p>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center">
                <p className="text-[11px] font-semibold text-emerald-400 uppercase">Đã đạt</p>
                <p className="text-xl font-bold text-emerald-400 mt-0.5">{passedCount} <span className="text-xs text-emerald-400/70">đề</span></p>
              </div>
              <Link
                to="/luyen-de/lich-su"
                className="flex flex-col items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 hover:bg-accent/20 px-4 py-3 text-center transition-all cursor-pointer group"
                title="Xem lại lịch sử và kết quả các bài thi đã làm"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-accent uppercase">
                  <History className="size-3.5 group-hover:rotate-[-20deg] transition-transform" />
                  <span>Lịch sử thi</span>
                </div>
                <span className="text-[11px] text-muted-foreground mt-0.5 group-hover:text-foreground transition-colors font-medium">
                  Xem lại tiến độ →
                </span>
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* Filter Bar */}
        <FadeIn from="up" delay={50} immediate>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Level Filter & Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-3">
              <LevelFilter value={level} onChange={(l) => setLevel(l)} />

              <div className="inline-flex rounded-xl border border-border bg-card p-1">
                {[
                  { key: "all", label: "Tất cả" },
                  { key: "todo", label: "Chưa làm" },
                  { key: "done", label: "Đã làm" },
                  { key: "passed", label: "Đã đạt" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusTab(tab.key as StatusFilterType)}
                    className={cn(
                      "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                      statusTab === tab.key
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm năm thi, cấp độ, từ khóa..."
                className="w-full rounded-2xl border border-border bg-card py-2.5 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </FadeIn>

        {/* Exams Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-3xl border border-border bg-card/40 animate-pulse" />
              ))}
            </div>
          ) : filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 py-16 text-center space-y-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <FileText className="size-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Không tìm thấy đề thi phù hợp</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Hãy thử chọn cấp độ khác hoặc xoá bớt bộ lọc tìm kiếm để xem các đề thi có sẵn.
              </p>
              <button
                type="button"
                onClick={() => { setLevel("all"); setStatusTab("all"); setSearch(""); }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Đặt lại bộ lọc</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
