import { useEffect, useState } from "react";
import { ChevronDown, Search, CheckCircle2, Bookmark } from "lucide-react";
import { type Level } from "@/data/jlpt";
import { LevelBadge, LevelFilter } from "@/components/common/level-filter";
import { StatusFilter, type ProgressStatusFilter } from "@/components/common/status-filter";
import { AppHeader } from "@/components/common/app-header";
import { Pagination } from "@/components/common/pagination";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { jlptService, type GrammarPointItem } from "@/services/jlpt.service";

export function NihonGrammarPage() {
  const [level, setLevel] = useState<Level | "all">("all");
  const [status, setStatus] = useState<ProgressStatusFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const [openId, setOpenId] = useState<string | null>(null);
  const [grammarList, setGrammarList] = useState<GrammarPointItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progressMap, setProgressMap] = useState<Record<string, "LEARNING" | "MASTERED">>({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      jlptService.getGrammar(level, query, page, pageSize, status).catch(() => null),
      jlptService.getUserProgressMap().catch(() => ({})),
    ]).then(([res, map]) => {
      if (res) {
        setGrammarList(res.content || []);
        setTotalPages(res.totalPages || 0);
        setTotalElements(res.totalElements || 0);
      }
      if (map) {
        setProgressMap(map);
      }
      setLoading(false);
    });
  }, [level, status, query, page]);

  const list = grammarList.map((g) => {
    let examplesArray: any[] = [];
    try {
      if (g.examples) {
        examplesArray = typeof g.examples === "string" ? JSON.parse(g.examples) : g.examples;
      }
    } catch (e) {
      examplesArray = [];
    }

    return {
      id: String(g.id),
      pattern: g.title,
      romaji: g.structure || "",
      meaning: g.meaning,
      level: (g.jlptLevel?.toLowerCase() || "n5") as Level,
      note: g.relatedGrammar ? `Liên quan: ${g.relatedGrammar}` : "",
      examples: examplesArray.map((ex: any) => ({
        ja: ex.ja || ex.jp || "",
        vi: ex.vi || "",
      })),
    };
  });

  const handleMarkProgress = async (grammarId: string, pattern: string, status: "LEARNING" | "MASTERED") => {
    try {
      await jlptService.markProgress("GRAMMAR", Number(grammarId), status);
      setProgressMap((prev) => ({ ...prev, [`GRAMMAR_${grammarId}`]: status }));
      if (status === "MASTERED") {
        toast.success(`Đã lưu mẫu ngữ pháp "${pattern}" vào Đã thuộc (+10 XP)!`);
      } else {
        toast.info(`Đã lưu mẫu ngữ pháp "${pattern}" vào Cần học lại.`);
      }
    } catch (err) {
      console.error("Mark progress failed", err);
      toast.error("Không thể lưu tiến độ. Vui lòng đăng nhập!");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="jp text-sm font-semibold text-accent">文法 · GRAMMAR</p>
            <h1 className="mt-1 text-3xl font-semibold">Ghi nhớ cấu trúc ngữ pháp JLPT</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Mỗi mẫu câu gồm công thức, lưu ý sắc thái và các câu ví dụ song ngữ Nhật - Việt. ({totalElements} mẫu)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LevelFilter
              value={level}
              onChange={(l) => {
                setLevel(l);
                setPage(0);
              }}
            />
            <StatusFilter
              value={status}
              onChange={(s) => {
                setStatus(s);
                setPage(0);
              }}
            />
          </div>
        </header>

        <div className="relative mt-7">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm mẫu ngữ pháp hoặc ý nghĩa…"
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="surface-card p-8 text-center text-sm text-muted-foreground animate-pulse">
              Đang tải cấu trúc Ngữ pháp từ cơ sở dữ liệu...
            </div>
          ) : list.length === 0 ? (
            <div className="surface-card p-8 text-center text-sm text-muted-foreground">
              Không tìm thấy mẫu ngữ pháp phù hợp.
            </div>
          ) : (
            list.map((g) => {
              const open = openId === g.id;
              const status = progressMap[`GRAMMAR_${g.id}`];

              return (
                <article
                  key={g.id}
                  className={cn(
                    "surface-card overflow-hidden transition-colors border border-border",
                    open && "border-accent/60",
                    status === "MASTERED" && "border-emerald-500/40 bg-emerald-500/5"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : g.id)}
                    className="flex w-full items-center gap-4 px-6 py-5 text-left cursor-pointer"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="jp text-xl font-bold">{g.pattern}</span>
                        {status === "MASTERED" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                            <CheckCircle2 className="size-3" /> Đã thuộc
                          </span>
                        )}
                        {status === "LEARNING" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">
                            <Bookmark className="size-3" /> Cần học lại
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {g.meaning} · <span className="italic">{g.romaji}</span>
                      </span>
                    </span>
                    <LevelBadge level={g.level} />
                    <ChevronDown
                      className={cn(
                        "size-5 text-muted-foreground transition-transform duration-200",
                        open && "rotate-180 text-accent",
                      )}
                    />
                  </button>

                  {open && (
                    <div className="border-t border-border bg-secondary/50 p-6 space-y-4">
                      {g.note && (
                        <p className="text-xs text-muted-foreground italic">{g.note}</p>
                      )}
                      {g.examples && g.examples.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Ví dụ:</p>
                          {g.examples.map((ex: any, idx: number) => (
                            <div key={idx} className="rounded-lg bg-card p-3 border border-border">
                              <p className="jp font-medium">{ex.ja || ex.jp}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{ex.vi}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {/* Action buttons for saving progress */}
                      <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                        <button
                          type="button"
                          onClick={() => handleMarkProgress(g.id, g.pattern, "LEARNING")}
                          className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-400 transition-colors hover:bg-amber-500/20 cursor-pointer"
                        >
                          <Bookmark className="size-3.5" /> Cần học lại
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkProgress(g.id, g.pattern, "MASTERED")}
                          disabled={status === "MASTERED"}
                          className={cn(
                            "flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition-colors",
                            status === "MASTERED"
                              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400/70 cursor-not-allowed"
                              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-emerald-950 cursor-pointer"
                          )}
                        >
                          <CheckCircle2 className="size-3.5" /> {status === "MASTERED" ? "Đã thuộc" : "Đã thuộc (+10 XP)"}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
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
  );
}
