import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Search, Volume2 } from "lucide-react";
import { VOCAB, type Level } from "@/data/jlpt";
import { LevelBadge, LevelFilter } from "@/components/level-filter";
import { AppHeader } from "@/components/app-header";
import { cn } from "@/lib/utils";

export function NihonVocabPage() {
  const [level, setLevel] = useState<Level | "all">("all");
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VOCAB.filter(
      (v) =>
        (level === "all" || v.level === level) &&
        (q === "" ||
          v.word.includes(q) ||
          v.reading.includes(q) ||
          v.meaning.toLowerCase().includes(q)),
    );
  }, [level, query]);

  const current = list[Math.min(index, Math.max(list.length - 1, 0))];

  const move = (dir: 1 | -1) => {
    if (list.length === 0) return;
    setFlipped(false);
    setIndex((i) => (i + dir + list.length) % list.length);
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ja-JP";
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="jp text-sm font-semibold text-accent">単語</p>
            <h1 className="mt-1 text-3xl font-semibold">Ôn từ vựng</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Lật thẻ để kiểm tra trí nhớ, sau đó lướt qua danh sách đầy đủ bên dưới.
            </p>
          </div>
          <LevelFilter
            value={level}
            onChange={(l) => {
              setLevel(l);
              setIndex(0);
              setFlipped(false);
            }}
          />
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Flashcard Player */}
          <div>
            <div className="[perspective:1400px]">
              <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                className={cn(
                  "flip-3d relative block h-72 w-full text-left cursor-pointer",
                  flipped && "[transform:rotateY(180deg)]",
                )}
                disabled={!current}
              >
                {/* Front of card */}
                <div className="surface-card backface-hidden absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <span className="jp text-6xl font-bold">{current ? current.word : "—"}</span>
                  <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Nhấn để lật thẻ
                  </span>
                </div>

                {/* Back of card */}
                <div className="surface-card backface-hidden absolute inset-0 flex flex-col justify-center gap-2 bg-secondary p-8 [transform:rotateY(180deg)]">
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

            {/* Controls */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  disabled={list.length <= 1}
                  className="rounded-xl border border-border bg-card p-3 transition-colors hover:bg-secondary disabled:opacity-40"
                  aria-label="Thẻ trước"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  disabled={list.length <= 1}
                  className="rounded-xl border border-border bg-card p-3 transition-colors hover:bg-secondary disabled:opacity-40"
                  aria-label="Thẻ tiếp theo"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>

              <span className="font-mono text-sm text-muted-foreground">
                {list.length === 0 ? "0 / 0" : `${index + 1} / ${list.length}`}
              </span>

              <div className="flex gap-2">
                {current && (
                  <button
                    type="button"
                    onClick={() => speak(current.word)}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-accent transition-colors hover:bg-secondary"
                  >
                    <Volume2 className="size-4" /> Phát âm
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFlipped((f) => !f)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold transition-colors hover:bg-secondary"
                >
                  <RotateCcw className="size-4" /> Lật mặt
                </button>
              </div>
            </div>
          </div>

          {/* List Search & Table */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                placeholder="Tìm từ vựng, cách đọc hoặc nghĩa…"
                className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="max-h-[500px] overflow-y-auto rounded-2xl border border-border bg-card">
              <div className="divide-y divide-border">
                {list.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Không tìm thấy từ vựng phù hợp.
                  </div>
                ) : (
                  list.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setIndex(i);
                        setFlipped(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary",
                        index === i && "bg-secondary/80",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className="jp text-2xl font-bold">{item.word}</span>
                        <div>
                          <span className="jp block text-sm text-accent">{item.reading}</span>
                          <span className="block text-xs text-muted-foreground">{item.meaning}</span>
                        </div>
                      </div>
                      <LevelBadge level={item.level} />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
