import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Search, Volume2, CheckCircle2, Bookmark } from "lucide-react";
import { type Level } from "@/data/jlpt";
import { LevelBadge, LevelFilter } from "@/components/common/level-filter";
import { AppHeader } from "@/components/common/app-header";
import { Pagination } from "@/components/common/pagination";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { jlptService, type VocabularyItem } from "@/services/jlpt.service";

export function NihonVocabPage() {
  const [level, setLevel] = useState<Level | "all">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, "LEARNING" | "MASTERED">>({});

  // Fetch vocabulary & user progress map
  useEffect(() => {
    setLoading(true);
    Promise.all([
      jlptService.getVocabulary(level, query, page, pageSize).catch(() => null),
      jlptService.getUserProgressMap().catch(() => ({})),
    ]).then(([res, map]) => {
      if (res) {
        setVocabList(res.content || []);
        setTotalPages(res.totalPages || 0);
        setTotalElements(res.totalElements || 0);
        setIndex(0);
        setFlipped(false);
      }
      if (map) {
        setProgressMap(map);
      }
      setLoading(false);
    });
  }, [level, query, page]);

  const list = vocabList.map((v) => ({
    id: String(v.id),
    word: v.word,
    reading: v.reading,
    meaning: v.meaning,
    romaji: v.romaji || "",
    level: (v.jlptLevel || "N5") as Level,
    type: "Từ vựng",
    example: v.word,
    exampleVi: v.meaning,
  }));

  const current = list[index];
  const currentStatus = current ? progressMap[`VOCABULARY_${current.id}`] : undefined;

  const move = (delta: number) => {
    if (list.length === 0) return;
    setFlipped(false);
    setIndex((i) => (i + delta + list.length) % list.length);
  };

  const handleMarkProgress = async (status: "LEARNING" | "MASTERED") => {
    if (!current) return;
    try {
      await jlptService.markProgress("VOCABULARY", Number(current.id), status);
      setProgressMap((prev) => ({ ...prev, [`VOCABULARY_${current.id}`]: status }));
      if (status === "MASTERED") {
        toast.success(`Đã lưu "${current.word}" vào Đã thuộc (+10 XP)!`);
      } else {
        toast.info(`Đã lưu "${current.word}" vào Cần học lại.`);
      }
      move(1);
    } catch (err) {
      console.error("Mark progress failed", err);
      toast.error("Không thể lưu tiến độ. Vui lòng đăng nhập!");
    }
  };

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="jp text-sm font-semibold uppercase tracking-[0.24em] text-accent">
                単語 · Vocab
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                {totalElements} từ
              </span>
            </div>
            <h1 className="mt-1 text-3xl font-bold">Ôn tập từ vựng JLPT</h1>
          </div>

          <LevelFilter value={level} onChange={(l) => { setLevel(l); setPage(0); }} />
        </div>

        {/* Workspace grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Flashcard viewer */}
          <div>
            <div className="perspective-1000 relative">
              <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                className={cn(
                  "flip-3d relative block h-80 w-full text-left cursor-pointer transition-all duration-300",
                  flipped && "[transform:rotateY(180deg)]"
                )}
                disabled={!current}
              >
                {/* Front of card */}
                <div className="surface-card backface-hidden absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center shadow-md">
                  {currentStatus === "MASTERED" && (
                    <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="size-3.5" /> Đã thuộc
                    </span>
                  )}
                  {currentStatus === "LEARNING" && (
                    <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-400">
                      <Bookmark className="size-3.5" /> Cần học lại
                    </span>
                  )}

                  <span className="jp text-6xl font-bold">{current ? current.word : "—"}</span>
                  <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Nhấn để lật xem nghĩa
                  </span>
                </div>

                {/* Back of card */}
                <div className="surface-card backface-hidden absolute inset-0 flex flex-col justify-center gap-2 bg-secondary p-8 [transform:rotateY(180deg)] shadow-md">
                  {current && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="jp text-2xl font-semibold text-accent">{current.reading}</span>
                        <LevelBadge level={current.level} />
                      </div>
                      <p className="text-xl font-medium">{current.meaning}</p>
                      <p className="text-xs text-muted-foreground">{current.type}</p>
                      <div className="mt-4 border-t border-border pt-4 text-sm">
                        <p className="jp font-medium">{current.example}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{current.exampleVi}</p>
                      </div>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Navigation & Action Controls */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  disabled={list.length <= 1}
                  className="rounded-xl border border-border bg-card p-3 transition-colors hover:bg-secondary disabled:opacity-40 cursor-pointer"
                  aria-label="Thẻ trước"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  disabled={list.length <= 1}
                  className="rounded-xl border border-border bg-card p-3 transition-colors hover:bg-secondary disabled:opacity-40 cursor-pointer"
                  aria-label="Thẻ tiếp theo"
                >
                  <ChevronRight className="size-5" />
                </button>
                <span className="font-mono text-sm text-muted-foreground ml-2">
                  {list.length === 0 ? "0 / 0" : `${index + 1} / ${list.length}`}
                </span>
              </div>

              {/* Progress Marking Action Buttons */}
              {current && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMarkProgress("LEARNING")}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs font-bold text-amber-400 transition-all hover:bg-amber-500/20 cursor-pointer"
                    title="Đánh dấu cần ôn tập lại"
                  >
                    <Bookmark className="size-4" /> Cần học lại
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkProgress("MASTERED")}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-emerald-950 cursor-pointer shadow-sm"
                    title="Đánh dấu đã thuộc từ này vào Database"
                  >
                    <CheckCircle2 className="size-4" /> Đã thuộc (+10 XP)
                  </button>

                  <button
                    type="button"
                    onClick={() => speak(current.word)}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                    title="Nghe phát âm tiếng Nhật"
                  >
                    <Volume2 className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlipped((f) => !f)}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                    title="Lật thẻ"
                  >
                    <RotateCcw className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search & List Table */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder="Tìm từ vựng, cách đọc hoặc nghĩa…"
                className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="max-h-[460px] overflow-y-auto rounded-2xl border border-border bg-card">
              <div className="divide-y divide-border">
                {loading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
                    Đang tải dữ liệu từ vựng...
                  </div>
                ) : list.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Không tìm thấy từ vựng phù hợp.
                  </div>
                ) : (
                  list.map((item, i) => {
                    const status = progressMap[`VOCABULARY_${item.id}`];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setIndex(i);
                          setFlipped(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/60 cursor-pointer",
                          i === index && "bg-secondary font-medium"
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="jp font-bold text-foreground text-base">{item.word}</span>
                            <span className="jp text-xs text-accent font-medium">{item.reading}</span>
                            {status === "MASTERED" && (
                              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                                ✓ Đã thuộc
                              </span>
                            )}
                            {status === "LEARNING" && (
                              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                                📖 Đang học
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{item.meaning}</p>
                        </div>
                        <LevelBadge level={item.level} />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
