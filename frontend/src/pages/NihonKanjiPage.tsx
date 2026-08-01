import { useEffect, useMemo, useState } from "react";
import { KANJI, type Level } from "@/data/jlpt";
import { LevelBadge, LevelFilter } from "@/components/level-filter";
import { AppHeader } from "@/components/app-header";
import { cn } from "@/lib/utils";
import { jlptService, type KanjiItem } from "@/services/jlpt.service";

export function NihonKanjiPage() {
  const [level, setLevel] = useState<Level | "all">("all");
  const [activeId, setActiveId] = useState<string>("");
  const [apiKanjiList, setApiKanjiList] = useState<KanjiItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    jlptService
      .getKanji(level, 0, 300)
      .then((res) => {
        if (res.content && res.content.length > 0) {
          setApiKanjiList(res.content);
        } else {
          setApiKanjiList([]);
        }
      })
      .catch(() => {
        setApiKanjiList([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [level]);

  const sourceList = useMemo(() => {
    if (apiKanjiList.length > 0) {
      return apiKanjiList.map((k) => ({
        id: String(k.id),
        char: k.character,
        meaning: k.meanings,
        onyomi: k.onReadings || "—",
        kunyomi: k.kunReadings || "—",
        strokes: k.strokeCount || 0,
        level: (k.jlptLevel?.toLowerCase() || "n5") as Level,
        words: [],
      }));
    }
    return KANJI;
  }, [apiKanjiList]);

  const list = useMemo(
    () => sourceList.filter((k) => level === "all" || k.level === level),
    [sourceList, level],
  );

  const active = sourceList.find((k) => k.id === activeId) ?? list[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="jp text-sm font-semibold text-accent">漢字</p>
            <h1 className="mt-1 text-3xl font-semibold">Ôn kanji</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Chạm vào một chữ để xem âm đọc, số nét và thông tin chi tiết. ({list.length} chữ)
            </p>
          </div>
          <LevelFilter value={level} onChange={setLevel} />
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Grid of Kanji Cards */}
          <div>
            {loading ? (
              <div className="surface-card p-8 text-center text-sm text-muted-foreground animate-pulse">
                Đang tải dữ liệu Kanji từ Backend Database...
              </div>
            ) : list.length === 0 ? (
              <div className="surface-card p-8 text-center text-sm text-muted-foreground">
                Không tìm thấy Kanji phù hợp.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 max-h-[600px] overflow-y-auto pr-1">
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
