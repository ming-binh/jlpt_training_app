import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, CheckCircle2, Play, BookOpen, Brain } from "lucide-react";
import { AppHeader } from "@/components/common/app-header";
import { LevelBadge } from "@/components/common/level-filter";
import { Pagination } from "@/components/common/pagination";
import { cn } from "@/lib/utils";
import { jlptService, type LessonItem, type PageResponse } from "@/services/jlpt.service";

type ContentTypeFilter = "ALL" | "VOCABULARY" | "KANJI" | "GRAMMAR";
type LevelFilterType = "ALL" | "N5" | "N4" | "N3";

const FALLBACK_LESSONS: LessonItem[] = [
  { id: 1, title: "N5 Từ Vựng - Bài 1", description: "Luyện tập 15 từ vựng JLPT N5 cơ bản", jlptLevel: "N5", contentType: "VOCABULARY", orderIndex: 1, itemCount: 15, completedCount: 0, status: "available" },
  { id: 2, title: "N5 Từ Vựng - Bài 2", description: "Luyện tập 15 từ vựng JLPT N5 cơ bản", jlptLevel: "N5", contentType: "VOCABULARY", orderIndex: 2, itemCount: 15, completedCount: 0, status: "available" },
  { id: 3, title: "N5 Kanji - Bài 1", description: "Học 12 chữ Hán JLPT N5 cơ bản", jlptLevel: "N5", contentType: "KANJI", orderIndex: 1, itemCount: 12, completedCount: 0, status: "available" },
  { id: 4, title: "N5 Ngữ Pháp - Bài 1", description: "Cấu trúc ngữ pháp JLPT N5 - Phần 1", jlptLevel: "N5", contentType: "GRAMMAR", orderIndex: 1, itemCount: 10, completedCount: 0, status: "available" },
  { id: 5, title: "N4 Từ Vựng - Bài 1", description: "Luyện tập 15 từ vựng JLPT N4 cơ bản", jlptLevel: "N4", contentType: "VOCABULARY", orderIndex: 1, itemCount: 15, completedCount: 0, status: "available" },
  { id: 6, title: "N3 Từ Vựng - Bài 1", description: "Luyện tập 15 từ vựng JLPT N3 cơ bản", jlptLevel: "N3", contentType: "VOCABULARY", orderIndex: 1, itemCount: 15, completedCount: 0, status: "available" },
];

export function NihonLessonListPage() {
  const navigate = useNavigate();
  const [level, setLevel] = useState<LevelFilterType>("ALL");
  const [type, setType] = useState<ContentTypeFilter>("ALL");
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(0);
  const pageSize = 12;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    setLoading(true);
    jlptService
      .getLessons(
        level === "ALL" ? undefined : level,
        type === "ALL" ? undefined : type,
        page,
        pageSize
      )
      .then((data) => {
        if (data && "content" in data) {
          const pageData = data as PageResponse<LessonItem>;
          setLessons(pageData.content || []);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
        } else if (Array.isArray(data) && data.length > 0) {
          setTotalElements(data.length);
          setTotalPages(Math.ceil(data.length / pageSize));
          const start = page * pageSize;
          setLessons(data.slice(start, start + pageSize));
        } else {
          applyFallback();
        }
      })
      .catch((err) => {
        console.error("Failed to load lessons from backend, using fallback:", err);
        applyFallback();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [level, type, page]);

  function applyFallback() {
    const filtered = getFilteredFallback(level, type);
    setTotalElements(filtered.length);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    const start = page * pageSize;
    setLessons(filtered.slice(start, start + pageSize));
  }

  function getFilteredFallback(lvl: LevelFilterType, t: ContentTypeFilter): LessonItem[] {
    return FALLBACK_LESSONS.filter((item) => {
      const matchLevel = lvl === "ALL" || item.jlptLevel === lvl;
      const matchType = t === "ALL" || item.contentType === t;
      return matchLevel && matchType;
    });
  }

  const handleLevelChange = (lvl: LevelFilterType) => {
    setLevel(lvl);
    setPage(0);
  };

  const handleTypeChange = (t: ContentTypeFilter) => {
    setType(t);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="jp text-sm font-bold uppercase tracking-[0.24em] text-accent flex items-center gap-1.5">
                <GraduationCap className="size-4" /> 授業 · Lessons
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground font-medium">
                {totalElements} bài học
              </span>
            </div>
            <h1 className="mt-1 text-3xl font-bold">Lộ trình bài học JLPT (N5 ➔ N3)</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Bài học được biên soạn bài bản từng bài, tích hợp Flashcard & Quiz trắc nghiệm đánh giá năng lực.
            </p>
          </div>

          {/* Level Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {(["ALL", "N5", "N4", "N3"] as LevelFilterType[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleLevelChange(lvl)}
                className={cn(
                  "rounded-xl border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                  level === lvl
                    ? "border-accent bg-accent text-accent-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {lvl === "ALL" ? "Tất cả trình độ" : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Content Type Tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-between border-b border-border/80 pb-3 gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange("ALL")}
              className={cn(
                "rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer",
                type === "ALL" ? "bg-secondary text-accent font-bold" : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              Tất cả loại bài học
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("VOCABULARY")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer",
                type === "VOCABULARY" ? "bg-secondary text-accent font-bold" : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              <BookOpen className="size-3.5" />
              <span>Từ vựng</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("KANJI")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer",
                type === "KANJI" ? "bg-secondary text-accent font-bold" : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              <span className="jp font-bold text-xs">漢</span>
              <span>Kanji</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("GRAMMAR")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer",
                type === "GRAMMAR" ? "bg-secondary text-accent font-bold" : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              <Brain className="size-3.5" />
              <span>Ngữ pháp</span>
            </button>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                <div key={n} className="surface-card h-44 animate-pulse p-6" />
              ))}
            </div>
          ) : lessons.length === 0 ? (
            <div className="surface-card p-12 text-center text-sm text-muted-foreground">
              Chưa có bài học phù hợp với bộ lọc được chọn.
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {lessons.map((lesson) => {
                  const percent = lesson.itemCount > 0
                    ? Math.round((lesson.completedCount / lesson.itemCount) * 100)
                    : 0;
                  const isCompleted = lesson.status === "completed";

                  return (
                    <div
                      key={lesson.id}
                      className={cn(
                        "surface-card flex flex-col justify-between p-6 border border-border/80 transition-all hover:-translate-y-1 hover:border-accent/60 shadow-sm",
                        isCompleted && "border-emerald-500/40 bg-emerald-500/5"
                      )}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-accent">
                            {lesson.contentType === "VOCABULARY" ? "Từ vựng" : lesson.contentType === "KANJI" ? "Kanji" : "Ngữ pháp"}
                          </span>
                          <LevelBadge level={lesson.jlptLevel as any} />
                        </div>

                        <h3 className="mt-3 text-lg font-bold">{lesson.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {lesson.description}
                        </p>
                      </div>

                      <div className="mt-6 border-t border-border/60 pt-4">
                        {/* Progress bar */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5 font-mono">
                          <span>Tiến độ: {lesson.completedCount}/{lesson.itemCount} mục</span>
                          <span className="font-bold text-foreground">{percent}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              isCompleted ? "bg-emerald-500" : "bg-accent"
                            )}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {/* Action button */}
                        <div className="mt-4 flex items-center justify-between">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                              <CheckCircle2 className="size-4" /> Đã hoàn thành
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {lesson.completedCount > 0 ? "Đang học dở" : "Chưa học"}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => navigate(`/lesson/${lesson.id}`)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                              isCompleted
                                ? "border border-border bg-card text-foreground hover:bg-secondary"
                                : "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
                            )}
                          >
                            <Play className="size-3.5 fill-current" />
                            <span>{isCompleted ? "Học lại" : "Bắt đầu học"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Component */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
