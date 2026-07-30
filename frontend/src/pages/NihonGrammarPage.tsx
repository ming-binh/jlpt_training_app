import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { GRAMMAR, type Level } from "@/data/jlpt";
import { LevelBadge, LevelFilter } from "@/components/level-filter";
import { AppHeader } from "@/components/app-header";
import { cn } from "@/lib/utils";

export function NihonGrammarPage() {
  const [level, setLevel] = useState<Level | "all">("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(GRAMMAR[0].id);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GRAMMAR.filter(
      (g) =>
        (level === "all" || g.level === level) &&
        (q === "" ||
          g.pattern.includes(q) ||
          g.romaji.toLowerCase().includes(q) ||
          g.meaning.toLowerCase().includes(q)),
    );
  }, [level, query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="jp text-sm font-semibold text-accent">文法</p>
            <h1 className="mt-1 text-3xl font-semibold">Ghi nhớ cấu trúc ngữ pháp</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Mỗi mẫu câu gồm công thức, lưu ý sắc thái và hai ví dụ song ngữ Nhật - Việt.
            </p>
          </div>
          <LevelFilter value={level} onChange={setLevel} />
        </header>

        <div className="relative mt-7">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm mẫu ngữ pháp hoặc ý nghĩa…"
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="mt-6 space-y-3">
          {list.length === 0 ? (
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
                        "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
                        open && "rotate-180 text-accent",
                      )}
                    />
                  </button>

                  {open && (
                    <div className="space-y-4 border-t border-border px-6 py-5">
                      <div className="rounded-lg bg-secondary px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Công thức kết hợp
                        </p>
                        <p className="jp mt-1 text-sm font-semibold text-accent">{g.formation}</p>
                      </div>

                      {g.note && (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Lưu ý sắc thái
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {g.note}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Câu ví dụ song ngữ
                        </p>
                        <ul className="mt-2 space-y-2">
                          {g.examples.map((ex, idx) => (
                            <li key={idx} className="rounded-lg bg-card border border-border p-3">
                              <p className="jp font-semibold text-foreground">{ex.jp}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">{ex.vi}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
