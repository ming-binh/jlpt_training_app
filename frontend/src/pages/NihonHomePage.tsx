import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Brain, Flame, MessageCircle, PenLine } from "lucide-react";
import { GRAMMAR, KANJI, VOCAB } from "@/data/jlpt";
import { AppHeader } from "@/components/app-header";
import { jlptService, type VocabularyItem } from "@/services/jlpt.service";

const PROGRESS = [
  { label: "Từ vựng", value: 62 },
  { label: "Kanji", value: 41 },
  { label: "Ngữ pháp", value: 78 },
];

export function NihonHomePage() {
  const [counts, setCounts] = useState({
    vocab: VOCAB.length,
    kanji: KANJI.length,
    grammar: GRAMMAR.length,
  });

  const [wordOfDay, setWordOfDay] = useState<VocabularyItem | null>(null);

  useEffect(() => {
    // Fetch stats & word of day from backend API
    Promise.all([
      jlptService.getVocabStats().catch(() => null),
      jlptService.getKanjiStats().catch(() => null),
      jlptService.getGrammarStats().catch(() => null),
      jlptService.getVocabulary("N5", 0, 1).catch(() => null),
    ]).then(([vocabRes, kanjiRes, grammarRes, vocabListRes]) => {
      setCounts({
        vocab: vocabRes?.total && vocabRes.total > 0 ? vocabRes.total : VOCAB.length,
        kanji: kanjiRes?.total && kanjiRes.total > 0 ? kanjiRes.total : KANJI.length,
        grammar: grammarRes?.total && grammarRes.total > 0 ? grammarRes.total : GRAMMAR.length,
      });

      if (vocabListRes?.content && vocabListRes.content.length > 0) {
        setWordOfDay(vocabListRes.content[0]);
      }
    });
  }, []);

  const features = [
    {
      to: "/tu-vung",
      kanji: "語",
      title: "Ôn từ vựng",
      desc: "Flashcard lật thẻ, ví dụ thực tế, phát âm tiếng Nhật, lọc theo cấp độ.",
      icon: BookOpen,
      count: `${counts.vocab} từ`,
    },
    {
      to: "/kanji",
      kanji: "漢",
      title: "Ôn kanji",
      desc: "Âm On/Kun, số nét và từ ghép thường gặp.",
      icon: PenLine,
      count: `${counts.kanji} chữ`,
    },
    {
      to: "/ngu-phap",
      kanji: "文",
      title: "Cấu trúc ngữ pháp",
      desc: "Công thức, sắc thái sử dụng và câu ví dụ song ngữ.",
      icon: Brain,
      count: `${counts.grammar} mẫu`,
    },
    {
      to: "/chat",
      kanji: "AI",
      title: "Trợ lý AI",
      desc: "Hỏi đáp ngữ pháp, dịch câu, luyện hội thoại 24/7.",
      icon: MessageCircle,
      count: "Chat ngay",
    },
  ];

  const currentWord = wordOfDay
    ? { word: wordOfDay.word, reading: wordOfDay.reading, meaning: wordOfDay.meaning }
    : VOCAB[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="gradient-indigo absolute inset-0" />
        <div className="seigaiha absolute inset-0 opacity-70" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.15fr_0.85fr] md:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accent backdrop-blur-sm">
              <Flame className="size-4 animate-pulse" /> Chuỗi 12 ngày liên tiếp
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.15] md:text-6xl">
              Chinh phục <span className="text-gold">JLPT</span> bằng
              <br />
              15 phút mỗi ngày
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
              Lộ trình N5 → N3 gói gọn trong bốn thói quen nhỏ: lật thẻ từ vựng, viết kanji, nắm
              cấu trúc ngữ pháp và trò chuyện cùng trợ lý AI tiếng Nhật.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/tu-vung"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Bắt đầu ôn hôm nay <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-6 py-3.5 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-secondary"
              >
                <MessageCircle className="size-4" /> Hỏi trợ lý AI
              </Link>
            </div>
          </div>

          {/* Word of the day & progress widget */}
          <div className="surface-card relative p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Từ của ngày
            </p>
            <p className="jp mt-4 text-5xl font-bold leading-none md:text-6xl">{currentWord.word}</p>
            <p className="jp mt-3 text-lg font-medium text-accent">{currentWord.reading}</p>
            <p className="mt-1 text-sm text-muted-foreground">{currentWord.meaning}</p>
            <div className="mt-6 space-y-4 border-t border-border pt-5">
              {PROGRESS.map((p) => (
                <div key={p.label}>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{p.label}</span>
                    <span className="font-mono text-accent">{p.value}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${p.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 Skill Rooms */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold">Bốn phòng luyện tập</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Chọn kỹ năng bạn muốn rèn hôm nay.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="surface-card group relative overflow-hidden p-6 transition-transform hover:-translate-y-1"
            >
              <span className="jp pointer-events-none absolute -right-3 -top-6 text-8xl text-secondary/70 transition-colors group-hover:text-primary/40">
                {f.kanji}
              </span>
              <f.icon className="relative size-6 text-accent" />
              <h3 className="relative mt-5 text-base font-semibold">{f.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
              <span className="relative mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {f.count} <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Nihon Journey · 毎日少しずつ — mỗi ngày một chút
      </footer>
    </div>
  );
}
