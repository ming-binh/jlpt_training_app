import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppHeader } from "@/components/app-header";
import { chatService, AiUseCase } from "@/services/chat.service";

interface MessageItem {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const SUGGESTIONS = [
  "Phân biệt 〜ながら và 〜つつ",
  "Giải thích kanji 覚 và từ ghép thông dụng",
  "Dịch giúp tôi: Tôi định đi Nhật năm sau",
  "Tạo 5 câu ví dụ với cấu trúc 〜てしまう",
];

export function NihonChatPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: MessageItem = {
      id: String(Date.now()),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await chatService.sendMessage({
        useCase: AiUseCase.GRAMMAR_EXPLAIN,
        params: {
          user_message: query,
          grammar_point: query,
        },
        userContext: {
          user_name: "Học Viên",
          jlpt_level: "N4",
        },
      });

      let text = res.message || "Xin lỗi, Sensei chưa hiểu rõ câu hỏi. Bạn có thể hỏi lại không?";

      // Append quiz section if provided by backend
      if ((res as any).quiz) {
        const quiz = (res as any).quiz;
        text +=
          `\n\n---\n🎯 **Bài tập luyện tập:**\n**${quiz.question}**\n` +
          (quiz.options || [])
            .map((opt: string, i: number) => `${i === quiz.correct_index ? "✓" : "•"} ${opt}`)
            .join("\n");
      }

      const aiMsg: MessageItem = {
        id: String(Date.now() + 1),
        sender: "ai",
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const aiMsg: MessageItem = {
        id: String(Date.now() + 1),
        sender: "ai",
        text: "⚠️ Sensei hiện không kết nối được với server. Hãy đảm bảo backend đang chạy (`./mvnw spring-boot:run`) rồi thử lại nhé!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-6 flex flex-col">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-6">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-lg py-12 text-center">
              <span className="jp mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground shadow-[var(--shadow-glow)]">
                先生
              </span>
              <h2 className="mt-5 text-2xl font-bold">Sensei AI đang chờ bạn</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Hỏi bất cứ điều gì về ngữ pháp, từ vựng, kanji hoặc luyện giao tiếp JLPT.
              </p>
              <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSend(s)}
                    className="rounded-xl border border-border bg-card p-3.5 text-left text-xs font-medium transition-all hover:border-accent/60 hover:bg-secondary cursor-pointer"
                  >
                    <Sparkles className="inline size-3.5 text-accent mr-1.5" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <span className="jp grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                    先生
                  </span>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                    m.sender === "user"
                      ? "bg-accent text-accent-foreground font-medium rounded-tr-none"
                      : "surface-card text-foreground rounded-tl-none"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                  <span className="block mt-1 text-[10px] opacity-60 text-right">
                    {m.timestamp}
                  </span>
                </div>
                {m.sender === "user" && (
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground">
                    <User className="size-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3.5 items-center">
              <span className="jp grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                先生
              </span>
              <div className="surface-card rounded-2xl rounded-tl-none px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-accent" /> Sensei đang suy nghĩ...
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <div className="sticky bottom-4 mt-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="surface-card flex items-center gap-2 p-2 focus-within:ring-2 focus-within:ring-ring"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi cho Sensei AI…"
              className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground transition-transform hover:scale-105 disabled:opacity-40 cursor-pointer"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
