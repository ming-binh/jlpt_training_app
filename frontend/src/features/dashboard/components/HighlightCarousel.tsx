import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HighlightItem {
  type: "vocab" | "kanji";
  main: string;
  reading: string;
  meaning: string;
  level: string;
}

export function HighlightCarousel({ items }: { items: HighlightItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  useEffect(() => {
    setIndex(0);
  }, [items.length]);

  const current = items[index];

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {current?.type === "kanji" ? "Kanji nổi bật" : "Từ vựng nổi bật"}
        </p>
        {current && (
          <span className="text-xs font-bold text-accent bg-accent/10 border border-accent/30 rounded-lg px-2 py-0.5">
            {current.level}
          </span>
        )}
      </div>

      {current ? (
        <>
          <p className="jp mt-4 text-5xl font-bold leading-none md:text-6xl">{current.main}</p>
          <p className="jp mt-3 text-lg font-medium text-accent">{current.reading}</p>
          <p className="mt-1 text-sm text-muted-foreground">{current.meaning}</p>
        </>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">Đang tải…</p>
      )}

      {items.length > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
            className="grid size-7 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
            aria-label="Mục trước"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all cursor-pointer",
                  i === index ? "w-6 bg-accent" : "w-1.5 bg-border"
                )}
                aria-label={`Xem mục ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % items.length)}
            className="grid size-7 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
            aria-label="Mục tiếp theo"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
