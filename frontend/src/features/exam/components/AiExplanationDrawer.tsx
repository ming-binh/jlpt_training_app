import { useState, useEffect } from "react";
import { X, Sparkles, Send, Loader2, Bot } from "lucide-react";
import { type ExamQuestion } from "@/services/exam.service";
import api from "@/services/api";

interface AiExplanationDrawerProps {
  question: ExamQuestion | null;
  onClose: () => void;
}

export function AiExplanationDrawer({ question, onClose }: AiExplanationDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [userPrompt, setUserPrompt] = useState<string>("");

  useEffect(() => {
    if (!question) return;

    setLoading(true);
    setResponse("");
    setUserPrompt("");

    const defaultPrompt = `Bạn hãy giải thích chi tiết câu hỏi thi JLPT sau đây bằng tiếng Việt:
Đề bài: "${question.questionText}"
Các phương án:
1. ${question.option1}
2. ${question.option2}
3. ${question.option3}
4. ${question.option4}
Đáp án đúng: Phương án ${question.correctOption} (${question[`option${question.correctOption}` as keyof ExamQuestion]})

Hãy phân tích:
1. Ý nghĩa và cấu trúc ngữ pháp/từ vựng của câu.
2. Tại sao đáp án ${question.correctOption} lại đúng?
3. Tại sao các đáp án còn lại chưa chính xác và ý nghĩa của chúng là gì?
4. Mẹo nhớ nhanh để không bị bẫy trong kỳ thi thật.`;

    api.post<{ response: string }>("/chat", {
      message: defaultPrompt,
    })
      .then((res) => {
        setResponse(res.data.response || "Không thể lấy giải thích từ AI.");
      })
      .catch((err) => {
        console.error("AI Explanation Error:", err);
        setResponse(question.explanation || "Không thể kết nối tới AI Tutor. Vui lòng thử lại sau!");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [question]);

  const handleSendCustomPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim() || loading || !question) return;

    const followUp = userPrompt.trim();
    setUserPrompt("");
    setLoading(true);

    api.post<{ response: string }>("/chat", {
      message: `Về câu hỏi JLPT: "${question.questionText}", câu hỏi bổ sung của học viên: "${followUp}"`,
    })
      .then((res) => {
        setResponse((prev) => prev + `\n\n---\n**Hỏi thêm:** ${followUp}\n\n**Trả lời:**\n` + res.data.response);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  if (!question) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex h-full w-full max-w-xl flex-col border-l border-border/80 bg-card p-6 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/30">
              <Bot className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <span>Nihon AI Tutor</span>
                <Sparkles className="size-3.5 text-accent animate-pulse" />
              </h3>
              <p className="text-xs text-muted-foreground">Giải thích chi tiết câu hỏi #{question.questionNumber}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Question Snapshot */}
        <div className="my-4 rounded-2xl bg-secondary/40 p-4 text-xs space-y-1.5 border border-border/60">
          <p className="font-semibold text-foreground jp text-sm">{question.questionText}</p>
          <p className="text-muted-foreground font-mono">
            Đáp án đúng: Phương án {question.correctOption} ({question[`option${question.correctOption}` as keyof ExamQuestion]})
          </p>
        </div>

        {/* AI Answer Content */}
        <div className="flex-1 overflow-y-auto pr-1 text-xs leading-relaxed space-y-3">
          {loading && !response ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="size-7 animate-spin text-accent" />
              <p className="text-xs">AI Tutor đang phân tích câu hỏi và soạn lời giải...</p>
            </div>
          ) : (
            <div className="prose prose-invert prose-xs max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {response}
            </div>
          )}
        </div>

        {/* Follow up prompt input */}
        <form onSubmit={handleSendCustomPrompt} className="mt-4 pt-3 border-t border-border flex items-center gap-2">
          <input
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Hỏi thêm về ngữ pháp, từ vựng này..."
            disabled={loading}
            className="flex-1 rounded-xl border border-border bg-secondary/50 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading || !userPrompt.trim()}
            className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground disabled:opacity-40 transition-all cursor-pointer"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
