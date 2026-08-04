import { useState, useMemo } from "react";
import {
  ArrowRight,
  Check,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  X,
  BookOpen,
  PenLine,
  Brain
} from "lucide-react";
import { AppHeader } from "@/components/common/app-header";
import { VOCAB, KANJI, GRAMMAR, LEVELS, type Level } from "@/data/jlpt-data";
import { cn } from "@/lib/utils";

type Mode = "vocab" | "kanji" | "grammar";

type Question = {
  id: string;
  prompt: string;
  promptJp: boolean;
  hint?: string;
  options: string[];
  answer: string;
  explain: string;
};

const MODES: { key: Mode; label: string; jp: string; desc: string; icon: any }[] = [
  { key: "vocab", label: "Từ vựng", jp: "単語", desc: "Chọn nghĩa đúng của từ", icon: BookOpen },
  { key: "kanji", label: "Kanji", jp: "漢字", desc: "Nhận diện nghĩa & âm đọc", icon: PenLine },
  { key: "grammar", label: "Ngữ pháp", jp: "文法", desc: "Chọn ý nghĩa mẫu câu", icon: Brain },
];

const COUNTS = [5, 10, 15];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(pool: string[], answer: string) {
  return shuffle(pool.filter((p) => p !== answer)).slice(0, 3);
}

function buildQuestions(mode: Mode, level: Level | "all", count: number): Question[] {
  const byLevel = <T extends { level: Level }>(items: T[]) =>
    items.filter((i) => level === "all" || i.level === level);

  if (mode === "vocab") {
    const items = byLevel(VOCAB);
    const pool = VOCAB.map((v) => v.meaning);
    return shuffle(items)
      .slice(0, count)
      .map((v) => ({
        id: v.id,
        prompt: v.word,
        promptJp: true,
        hint: v.reading,
        options: shuffle([v.meaning, ...pickDistractors(pool, v.meaning)]),
        answer: v.meaning,
        explain: `${v.word}（${v.reading}）· ${v.type} — ${v.example}`,
      }));
  }

  if (mode === "kanji") {
    const items = byLevel(KANJI);
    const pool = KANJI.map((k) => k.meaning);
    return shuffle(items)
      .slice(0, count)
      .map((k) => ({
        id: k.id,
        prompt: k.char,
        promptJp: true,
        hint: `${k.strokes} nét · On: ${k.onyomi} · Kun: ${k.kunyomi}`,
        options: shuffle([k.meaning, ...pickDistractors(pool, k.meaning)]),
        answer: k.meaning,
        explain: `Âm On ${k.onyomi} · Âm Kun ${k.kunyomi} — ví dụ: ${k.words[0]?.jp ?? ""}`,
      }));
  }

  const items = byLevel(GRAMMAR);
  const pool = GRAMMAR.map((g) => g.meaning);
  return shuffle(items)
    .slice(0, count)
    .map((g) => ({
      id: g.id,
      prompt: g.pattern,
      promptJp: true,
      hint: g.romaji,
      options: shuffle([g.meaning, ...pickDistractors(pool, g.meaning)]),
      answer: g.meaning,
      explain: `${g.formation} — ${g.note}`,
    }));
}

export function NihonQuizPage() {
  const [mode, setMode] = useState<Mode>("vocab");
  const [level, setLevel] = useState<Level | "all">("all");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ q: Question; picked: string }[]>([]);

  const available = useMemo(() => {
    const src = mode === "vocab" ? VOCAB : mode === "kanji" ? KANJI : GRAMMAR;
    return src.filter((i) => level === "all" || i.level === level).length;
  }, [mode, level]);

  const start = () => {
    setQuestions(buildQuestions(mode, level, Math.min(count, available)));
    setIndex(0);
    setPicked(null);
    setAnswers([]);
  };

  const reset = () => setQuestions(null);

  const current = questions?.[index];
  const finished = questions && index >= questions.length;
  const score = answers.filter((a) => a.picked === a.q.answer).length;

  const choose = (opt: string) => {
    if (picked || !current) return;
    setPicked(opt);
    setAnswers((prev) => [...prev, { q: current, picked: opt }]);
  };

  const next = () => {
    setPicked(null);
    setIndex((i) => i + 1);
  };

  // ── Phase 1: Setup Screen (Matches Screenshot Exactly) ───────────────────────
  if (!questions) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />

        <main className="mx-auto max-w-4xl px-4 py-10">
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <p className="jp text-sm font-bold text-accent">小テスト</p>
              <h1 className="mt-1 text-3xl font-bold">Câu hỏi ôn tập (Quiz JLPT)</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Chọn nội dung, trình độ và số câu để bắt đầu kiểm tra nhanh.
              </p>
            </div>
            <span className="jp hidden shrink-0 text-7xl text-border/60 sm:block select-none">試</span>
          </header>

          <section className="mt-8 space-y-6">
            {/* Nội dung ôn */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                NỘI DUNG ÔN
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMode(m.key)}
                    className={cn(
                      "surface-card group p-5 text-left transition-all hover:-translate-y-1 hover:border-accent/60 cursor-pointer border border-border/80 shadow-sm",
                      mode === m.key && "border-accent bg-secondary/80 ring-2 ring-accent/30 shadow-md"
                    )}
                  >
                    <span className="jp block text-3xl font-bold text-accent">{m.jp}</span>
                    <span className="mt-2 block font-bold text-base">{m.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trình độ & Số câu hỏi */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  TRÌNH ĐỘ
                </p>
                <div className="mt-3 inline-flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setLevel("all")}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                      level === "all"
                        ? "border-accent bg-accent text-accent-foreground shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    TẤT CẢ
                  </button>
                  {LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevel(lvl)}
                      className={cn(
                        "rounded-xl border px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                        level === lvl
                          ? "border-accent bg-accent text-accent-foreground shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  SỐ CÂU HỎI
                </p>
                <div className="mt-3 inline-flex rounded-xl border border-border/80 bg-card p-1">
                  {COUNTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCount(c)}
                      className={cn(
                        "rounded-lg px-4 py-2 text-xs font-bold transition-colors cursor-pointer",
                        count === c
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {c} câu
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Bar Status */}
            <div className="surface-card flex flex-wrap items-center justify-between gap-4 p-5 border border-border/80 rounded-2xl shadow-sm">
              <p className="text-sm text-muted-foreground">
                <Sparkles className="mr-2 inline size-4 text-accent" />
                Có <span className="font-bold text-foreground">{available}</span> mục phù hợp —
                quiz sẽ gồm {Math.min(count, available)} câu, đảo ngẫu nhiên.
              </p>
              <button
                type="button"
                onClick={start}
                disabled={available === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer shadow-md"
              >
                <span>Bắt đầu quiz</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // ── Phase 3: Quiz Complete Screen ──────────────────────────────────────────
  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="w-[85%] max-w-[1500px] mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Side: Result Card (Sticky & Ratio 1) */}
            <div className="lg:col-span-1 lg:sticky lg:top-24 surface-card relative overflow-hidden p-8 py-9 text-center border border-border/80 rounded-2xl shadow-xl bg-[#121929]">
              {/* Watermark Kanji 結 */}
              <span className="jp absolute -right-4 -top-6 text-9xl text-border/15 select-none pointer-events-none font-serif">
                結
              </span>

              <span className="grid mx-auto size-16 place-items-center rounded-2xl bg-secondary/80 text-accent border border-border/60">
                <Trophy className="size-8 text-accent" />
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
                {percent >= 80 ? "Xuất sắc!" : percent >= 50 ? "Khá tốt!" : "Cần luyện thêm"}
              </h1>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Bạn trả lời đúng <strong className="text-foreground">{score}</strong> / {questions.length} câu (
                {MODES.find((m) => m.key === mode)?.label} · {level === "all" ? "N5–N3" : level})
              </p>

              <div className="mx-auto mt-6 h-2 overflow-hidden rounded-full bg-secondary/80 w-full max-w-xs">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="jp mt-3 text-5xl font-bold text-accent font-serif">{percent}%</p>

              {/* 3-Column Stats Card Box */}
              <div className="mx-auto mt-6 grid w-full grid-cols-3 divide-x divide-border/60 rounded-xl border border-border/80 bg-card/60 py-3 text-center text-xs shadow-sm">
                <div>
                  <p className="text-muted-foreground font-semibold">Đúng</p>
                  <p className="mt-1 text-lg font-bold text-emerald-400">{score}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Sai</p>
                  <p className="mt-1 text-lg font-bold text-rose-400">{questions.length - score}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Điểm XP</p>
                  <p className="mt-1 text-lg font-bold text-accent">+{Math.round((score / questions.length) * 45)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row lg:flex-col gap-3">
                <button
                  type="button"
                  onClick={start}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground shadow-md hover:bg-accent/90 cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <RotateCcw className="size-4" /> Làm lại
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground hover:bg-secondary cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  Đổi thiết lập
                </button>
              </div>
            </div>

            {/* Right Side: Answer Review Section (Ratio 2 - 2 Columns) */}
            <div className="lg:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                XEM LẠI ĐÁP ÁN
              </p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {answers.map(({ q, picked: p }, idx) => {
                  const ok = p === q.answer;
                  return (
                    <li
                      key={q.id}
                      className="relative flex flex-col justify-between rounded-xl border border-border/80 bg-[#121929] p-5 shadow-sm hover:border-border transition-colors h-full"
                    >
                      <span
                        className={cn(
                          "absolute right-4 top-4 grid size-7 place-items-center rounded-lg text-xs font-bold",
                          ok
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        )}
                      >
                        {ok ? <Check className="size-4" /> : <X className="size-4" />}
                      </span>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                          CÂU {idx + 1}
                        </p>
                        <p className="jp mt-1 text-2xl font-bold text-foreground font-serif">
                          {q.prompt}
                        </p>

                        <div className="mt-3 text-xs space-y-1">
                          <p className="text-muted-foreground">
                            Đáp án: <span className="font-bold text-emerald-400">{q.answer}</span>
                          </p>
                          {!ok && (
                            <p className="text-muted-foreground">
                              Bạn chọn: <span className="font-bold text-rose-400">{p}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {q.explain && (
                        <div className="mt-4 border-t border-border/50 pt-3">
                          <p className="jp text-xs text-muted-foreground/90 font-mono leading-relaxed">
                            {q.explain}
                          </p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Phase 2: Quiz Question Execution Screen (Serif Card + 2x2 Grid) ─────────
  const progress = (index / questions.length) * 100;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Top bar progress */}
        <header className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <span>{MODES.find((m) => m.key === mode)?.label}</span>
              <span>·</span>
              <span>{level === "all" ? "N5–N3" : level}</span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-foreground">
              Câu {index + 1} / {questions.length}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              <Timer className="size-3.5 text-accent" /> Không giới hạn
            </span>
            <button
              type="button"
              onClick={reset}
              aria-label="Thoát quiz"
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Serif Card */}
        <section className="surface-card mt-6 p-8 text-center border border-border/80 rounded-2xl shadow-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
            CHỌN NGHĨA ĐÚNG
          </p>
          <p className={cn("mt-4 font-bold text-foreground my-2", current!.promptJp && "jp text-5xl md:text-6xl font-serif tracking-wide")}>
            {current!.prompt}
          </p>
          {current!.hint && (
            <p className="jp mt-2 text-sm text-accent font-mono">{current!.hint}</p>
          )}
        </section>

        {/* 2x2 Options Grid */}
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {current!.options.map((opt, optIdx) => {
            const isAnswer = opt === current!.answer;
            const isPicked = picked === opt;
            return (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => choose(opt)}
                  disabled={!!picked}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border border-border/80 bg-card p-4 text-left text-sm font-medium transition-all cursor-pointer min-h-[60px]",
                    !picked && "hover:-translate-y-0.5 hover:border-accent hover:bg-secondary/50",
                    picked && isAnswer && "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold",
                    picked && isPicked && !isAnswer && "border-rose-500 bg-rose-500/10 text-rose-300 font-bold",
                    picked && !isAnswer && !isPicked && "opacity-40"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-mono font-bold transition-all",
                      picked && isAnswer
                        ? "bg-emerald-500 border-emerald-500 text-slate-950"
                        : picked && isPicked
                        ? "bg-rose-500 border-rose-500 text-white"
                        : "bg-secondary border-border text-muted-foreground"
                    )}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="min-w-0 flex-1">{opt}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Feedback & Next Button */}
        {picked && (
          <div className="surface-card mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center justify-between border border-border/80 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <p className="jp min-w-0 flex-1 text-xs sm:text-sm text-muted-foreground font-mono">
              💡 {current!.explain}
            </p>
            <button
              type="button"
              onClick={next}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground shadow-md hover:bg-accent/90 cursor-pointer"
            >
              <span>{index + 1 === questions.length ? "Xem kết quả" : "Câu tiếp theo"}</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
