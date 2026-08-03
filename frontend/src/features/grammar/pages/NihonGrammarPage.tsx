import { useEffect, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { type Level } from "@/data/jlpt";
import { LevelBadge, LevelFilter } from "@/components/common/level-filter";
import { AppHeader } from "@/components/common/app-header";
import { Pagination } from "@/components/common/pagination";
import { cn } from "@/lib/utils";
import { jlptService, type GrammarPointItem } from "@/services/jlpt.service";

export function NihonGrammarPage() {
  const [level, setLevel] = useState<Level | "all">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const [openId, setOpenId] = useState<string | null>(null);
  const [grammarList, setGrammarList] = useState<GrammarPointItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    jlptService
      .getGrammar(level, query, page, pageSize)
      .then((res) => {
        setGrammarList(res.content || []);
        setTotalPages(res.totalPages || 0);
        setTotalElements(res.totalElements || 0);
      })
      .catch((err) => {
        console.error("Failed to load grammar:", err);
        setGrammarList([]);
        setTotalPages(0);
        setTotalElements(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [level, query, page]);

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="jp text-sm font-semibold text-accent">文法</p>
            <h1 className="mt-1 text-3xl font-semibold">Ghi nhớ cấu trúc ngữ pháp</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Mỗi mẫu câu gồm công thức, lưu ý sắc thái và các câu ví dụ song ngữ Nhật - Việt. ({totalElements} mẫu)
            </p>
          </div>
          <LevelFilter
            value={level}
            onChange={(l) => {
              setLevel(l);
              setPage(0);
            }}
          />
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
              return (
                <article
                  key={g.id}
                  className={cn(
                    "surface-card overflow-hidden transition-colors",
                    open && "border-accent/60",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : g.id)}
                    className="flex w-full items-center gap-4 px-6 py-5 text-left cursor-pointer"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="jp block text-xl font-bold">{g.pattern}</span>
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
