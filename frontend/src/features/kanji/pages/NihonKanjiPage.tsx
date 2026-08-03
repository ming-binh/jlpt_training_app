import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { type Level } from "@/data/jlpt";
import { LevelBadge, LevelFilter } from "@/components/common/level-filter";
import { AppHeader } from "@/components/common/app-header";
import { Pagination } from "@/components/common/pagination";
import { cn } from "@/lib/utils";
import { jlptService, type KanjiItem } from "@/services/jlpt.service";

export function NihonKanjiPage() {
  const [level, setLevel] = useState<Level | "all">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 24;

  const [activeId, setActiveId] = useState<string>("");
  const [kanjiList, setKanjiList] = useState<KanjiItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    jlptService
      .getKanji(level, query, page, pageSize)
      .then((res) => {
        setKanjiList(res.content || []);
        setTotalPages(res.totalPages || 0);
        setTotalElements(res.totalElements || 0);
        if (res.content && res.content.length > 0) {
          setActiveId(String(res.content[0].id));
        }
      })
      .catch((err) => {
        console.error("Failed to load kanji:", err);
        setKanjiList([]);
        setTotalPages(0);
        setTotalElements(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [level, query, page]);

  const list = kanjiList.map((k) => ({
    id: String(k.id),
    char: k.character,
    meaning: k.meanings,
    onyomi: k.onReadings || "—",
    kunyomi: k.kunReadings || "—",
    strokes: k.strokeCount || 0,
    level: (k.jlptLevel?.toLowerCase() || "n5") as Level,
  }));

  const active = list.find((k) => k.id === activeId) ?? list[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="jp text-sm font-semibold text-accent">漢字</p>
            <h1 className="mt-1 text-3xl font-semibold">Ôn kanji</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Chạm vào một chữ để xem âm đọc, số nét và thông tin chi tiết. ({totalElements} chữ)
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

        {/* Search input */}
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm chữ Hán, âm đọc Onyomi/Kunyomi hoặc nghĩa…"
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Grid of Kanji Cards */}
          <div>
            {loading ? (
              <div className="surface-card p-8 text-center text-sm text-muted-foreground animate-pulse">
                Đang tải dữ liệu Kanji...
              </div>
            ) : list.length === 0 ? (
              <div className="surface-card p-8 text-center text-sm text-muted-foreground">
                Không tìm thấy Kanji phù hợp.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 max-h-[520px] overflow-y-auto pr-1">
                {list.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setActiveId(k.id)}
                    className={cn(
                      "group relative aspect-square rounded-xl border border-border bg-card p-2 text-center transition-all hover:-translate-y-0.5 hover:border-accent/60 cursor-pointer",
                      active?.id === k.id && "border-accent bg-secondary shadow-[var(--shadow-glow)]",
                    )}
                  >
                    <span className="jp text-4xl font-bold">{k.char}</span>
                    <span className="absolute bottom-1.5 right-2 font-mono text-[10px] tracking-wider text-muted-foreground">
                      {k.level?.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>

          {/* Detailed Inspector Panel */}
          {active && (
            <aside className="surface-card sticky top-24 h-fit p-6 md:p-8">
              <div className="flex items-start justify-between">
                <span className="jp text-8xl leading-none font-bold">{active.char}</span>
                <LevelBadge level={active.level} />
              </div>
              <p className="mt-5 text-lg font-semibold">{active.meaning}</p>

              <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-border py-5 text-sm">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Âm On
                  </dt>
                  <dd className="jp mt-1 font-semibold text-accent">{active.onyomi}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Âm Kun
                  </dt>
                  <dd className="jp mt-1 font-semibold text-accent">{active.kunyomi}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Số nét
                  </dt>
                  <dd className="mt-1 font-mono">{active.strokes || "—"}</dd>
                </div>
              </dl>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
