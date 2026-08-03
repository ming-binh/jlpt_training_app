import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Sparkles,
  User,
  Loader2,
  MessageSquare,
  PlusCircle,
  Trash2,
  Edit2,
  Check,
  X,
  History,
  PanelLeftOpen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppHeader } from "@/components/common/app-header";
import { chatService, AiUseCase, type ConversationItem } from "@/services/chat.service";
import { supabase } from "@/lib/supabase";

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
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userName, setUserName] = useState("Học Viên");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMessagesForConversation = (convId: string) => {
    chatService.getMessages(convId).then((history) => {
      if (history) {
        const loadedMsgs: MessageItem[] = history.map((m, idx) => ({
          id: String(idx),
          sender: m.role === "user" ? "user" : "ai",
          text: m.content,
          timestamp: m.createdAt
            ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "",
        }));
        setMessages(loadedMsgs);
      }
    });
  };

  const fetchConversations = (selectConvId?: string) => {
    chatService
      .getConversations()
      .then((convs) => {
        setConversations(convs || []);
        if (convs && convs.length > 0) {
          const targetId = selectConvId || conversationId || convs[0].id;
          const exists = convs.some((c) => c.id === targetId);
          const finalId = exists ? targetId : convs[0].id;
          setConversationId(finalId);
          loadMessagesForConversation(finalId);
        } else {
          setConversationId(null);
          setMessages([]);
        }
      })
      .catch((err) => {
        console.warn("Could not load conversations from server:", err);
      });
  };

  // Require user authentication for AI Chat
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate("/login?redirect=/chat", { replace: true });
      } else {
        const name = data.user.user_metadata?.name || data.user.email?.split("@")[0] || "Học Viên";
        setUserName(name);
        setCheckingAuth(false);
        fetchConversations();
      }
    });
  }, [navigate]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setIsMobileSidebarOpen(false);
  };

  const handleSelectConversation = (convId: string) => {
    if (editingConvId) return; // Ignore selection during inline edit
    setConversationId(convId);
    loadMessagesForConversation(convId);
    setIsMobileSidebarOpen(false);
  };

  const handleStartRename = (conv: ConversationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditingTitle(conv.title || "");
  };

  const handleSaveRename = async (convId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingTitle.trim()) {
      setEditingConvId(null);
      return;
    }

    try {
      await chatService.updateConversationTitle(convId, editingTitle.trim());
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, title: editingTitle.trim() } : c))
      );
    } catch (err) {
      console.error("Failed to rename conversation:", err);
    } finally {
      setEditingConvId(null);
    }
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này?")) return;

    try {
      await chatService.deleteConversation(convId);
      const updatedConvs = conversations.filter((c) => c.id !== convId);
      setConversations(updatedConvs);

      if (conversationId === convId) {
        if (updatedConvs.length > 0) {
          setConversationId(updatedConvs[0].id);
          loadMessagesForConversation(updatedConvs[0].id);
        } else {
          startNewChat();
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

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
        conversationId: conversationId || undefined,
        params: {
          user_message: query,
          grammar_point: query,
        },
        userContext: {
          user_name: userName,
          jlpt_level: "N4",
        },
      });

      let currentConvId = conversationId;
      if (res.conversationId) {
        currentConvId = res.conversationId;
        setConversationId(res.conversationId);
      }

      let text = res.message || "Xin lỗi, Sensei chưa hiểu rõ câu hỏi. Bạn có thể hỏi lại không?";

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

      // Refresh sidebar conversation list to keep title & order updated
      if (currentConvId) {
        fetchConversations(currentConvId);
      }
    } catch (err) {
      const aiMsg: MessageItem = {
        id: String(Date.now() + 1),
        sender: "ai",
        text: "⚠️ Sensei hiện không kết nối được với server. Hãy đảm bảo backend đang chạy rồi thử lại nhé!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderConversationItem = (conv: ConversationItem) => {
    const isActive = conversationId === conv.id;
    const isEditing = editingConvId === conv.id;

    return (
      <div
        key={conv.id}
        onClick={() => !isEditing && handleSelectConversation(conv.id)}
        className={`group relative flex items-center justify-between gap-2 rounded-xl p-2.5 text-xs transition-colors cursor-pointer ${
          isActive
            ? "bg-secondary text-accent font-semibold"
            : "hover:bg-secondary/60 text-muted-foreground"
        }`}
      >
        <MessageSquare className="size-3.5 shrink-0" />

        {isEditing ? (
          <form
            onSubmit={(e) => handleSaveRename(conv.id, e)}
            className="flex items-center gap-1 flex-1 min-w-0"
          >
            <input
              autoFocus
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="flex-1 bg-background border border-accent/40 rounded px-1.5 py-0.5 text-xs text-foreground outline-none"
            />
            <button
              type="submit"
              className="p-1 text-emerald-400 hover:text-emerald-300"
              title="Lưu"
            >
              <Check className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => setEditingConvId(null)}
              className="p-1 text-rose-400 hover:text-rose-300"
              title="Hủy"
            >
              <X className="size-3" />
            </button>
          </form>
        ) : (
          <>
            <span className="truncate flex-1" title={conv.title}>
              {conv.title || `Hội thoại ${conv.id.substring(0, 8)}`}
            </span>

            <div className="hidden group-hover:flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => handleStartRename(conv, e)}
                className="p-1 text-muted-foreground hover:text-accent rounded transition-colors"
                title="Đổi tên"
              >
                <Edit2 className="size-3" />
              </button>
              <button
                type="button"
                onClick={(e) => handleDeleteConversation(conv.id, e)}
                className="p-1 text-muted-foreground hover:text-rose-400 rounded transition-colors"
                title="Xóa"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  if (checkingAuth) {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        <AppHeader />
        <div className="flex-1 grid place-items-center">
          <div className="flex items-center gap-3 text-muted-foreground text-sm font-medium">
            <Loader2 className="size-6 animate-spin text-accent" />
            Đang kiểm tra đăng nhập...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-[1700px] px-4 md:px-6 py-4 flex gap-5 overflow-hidden relative">
        {/* Desktop Sidebar (Pinned/Sticky full-height inside flex view) */}
        <aside className="hidden md:flex md:w-72 lg:w-80 shrink-0 flex-col h-full surface-card p-4 rounded-2xl gap-3 overflow-hidden">
          <button
            type="button"
            onClick={startNewChat}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground shadow-sm transition-transform hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            <PlusCircle className="size-4" /> Cuộc trò chuyện mới
          </button>

          <div className="px-1 shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Lịch sử trò chuyện ({conversations.length})
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground p-2">Chưa có lịch sử chat.</p>
            ) : (
              conversations.map(renderConversationItem)
            )}
          </div>
        </aside>

        {/* Mobile Slide-Over Drawer Panel */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm md:hidden">
            <div className="w-72 bg-card h-full p-4 flex flex-col gap-3 shadow-2xl border-r border-border animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <History className="size-4 text-accent" /> Lịch sử trò chuyện
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              <button
                type="button"
                onClick={startNewChat}
                className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground shadow-sm shrink-0 cursor-pointer"
              >
                <PlusCircle className="size-4" /> Cuộc trò chuyện mới
              </button>

              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {conversations.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2">Chưa có lịch sử chat.</p>
                ) : (
                  conversations.map(renderConversationItem)
                )}
              </div>
            </div>
            {/* Backdrop click to close */}
            <div className="flex-1" onClick={() => setIsMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Main Chat View Container */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {/* Mobile Top Header Bar for Drawer Toggle */}
          <div className="md:hidden flex items-center justify-between pb-2 border-b border-border/40 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary cursor-pointer"
            >
              <PanelLeftOpen className="size-4 text-accent" /> Lịch sử ({conversations.length})
            </button>
            <button
              type="button"
              onClick={startNewChat}
              className="flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground cursor-pointer"
            >
              <PlusCircle className="size-3.5" /> Mới
            </button>
          </div>

          {/* Messages list (Independent vertical scroll, sleek hidden scrollbar) */}
          <div className="flex-1 overflow-y-auto space-y-6 py-4 px-2">
            {messages.length === 0 ? (
              <div className="mx-auto max-w-lg py-12 text-center">
                <span className="jp mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground shadow-[var(--shadow-glow)]">
                  先生
                </span>
                <h2 className="mt-5 text-2xl font-bold">Sensei AI đang chờ bạn</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Hỏi bất cứ điều gì về ngữ pháp, từ vựng, kanji hoặc luyện giao tiếp JLPT. Toàn bộ lịch sử cuộc trò chuyện sẽ được tự động lưu.
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

          {/* Input Bar (Pinned at bottom of chat column) */}
          <div className="shrink-0 pt-2 pb-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="surface-card flex items-center gap-2 p-2 focus-within:ring-2 focus-within:ring-ring border border-border/50 shadow-lg"
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
                className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground transition-transform hover:scale-105 disabled:opacity-40 cursor-pointer shrink-0"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
