import React, { useState, useRef, useEffect } from "react";
import {
  ChevronUp,
  Check,
  Zap,
  Sparkles,
  Bot,
  Info,
} from "lucide-react";

export interface AiModelOption {
  id: string;
  name: string;
  shortName: string;
  provider: "Groq" | "Google AI";
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

export const AI_MODELS: AiModelOption[] = [
  {
    id: "openai/gpt-oss-120b",
    name: "GPT OSS (120B)",
    shortName: "GPT OSS 120B",
    provider: "Groq",
    badge: "⚡ Siêu tốc",
    description: "Tốc độ phản hồi cực nhanh (1-2s), giải thích chi tiết mẫu câu và ngữ cảnh",
    icon: Bot,
    accentColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    shortName: "Gemini 2.5 Flash",
    provider: "Google AI",
    badge: "🧠 Phân tích sâu",
    description: "Khả năng phân tích sâu cấu trúc ngữ pháp phức tạp và đặt ví dụ tự nhiên",
    icon: Zap,
    accentColor: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  },
  {
    id: "qwen/qwen3.6-27b",
    name: "Qwen 3.6 (27B)",
    shortName: "Qwen 3.6 27B",
    provider: "Groq",
    badge: "✨ Chuyên Kanji",
    description: "Khả năng xử lý chữ Hán Kanji và thành ngữ tiếng Nhật xuất sắc",
    icon: Sparkles,
    accentColor: "text-violet-400 bg-violet-400/10 border-violet-400/30",
  },
];

const STORAGE_KEY = "nihon_ai_selected_model";

export function getSavedAiModel(): string {
  if (typeof window === "undefined") return AI_MODELS[0].id;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && AI_MODELS.some((m) => m.id === saved)) {
    return saved;
  }
  return AI_MODELS[0].id;
}

export function saveAiModel(modelId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, modelId);
  }
}

interface AiModelSelectorProps {
  selectedModelId: string;
  onSelectModel: (model: AiModelOption) => void;
  disabled?: boolean;
}

export function AiModelSelector({
  selectedModelId,
  onSelectModel,
  disabled = false,
}: AiModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentModel =
    AI_MODELS.find((m) => m.id === selectedModelId) || AI_MODELS[0];
  const CurrentIcon = currentModel.icon;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (model: AiModelOption) => {
    saveAiModel(model.id);
    onSelectModel(model);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer select-none ${
          isOpen
            ? "border-accent bg-secondary text-foreground shadow-sm ring-1 ring-accent/30"
            : "border-border/70 bg-card hover:bg-secondary/70 hover:border-accent/40 text-foreground/90"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        title={`Mô hình AI: ${currentModel.name}`}
      >
        <span
          className={`grid size-5 place-items-center rounded-lg border text-[11px] ${currentModel.accentColor}`}
        >
          <CurrentIcon className="size-3" />
        </span>
        <span className="font-semibold text-[11.5px] truncate max-w-[100px] sm:max-w-[130px]">
          {currentModel.shortName}
        </span>
        <ChevronUp
          className={`size-3 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-0 text-accent" : "rotate-180"
          }`}
        />
      </button>

      {/* Popover Dropdown (Aligned to right edge of trigger, expanding leftwards) */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute bottom-full mb-3 right-0 z-50 w-[300px] sm:w-[350px] rounded-2xl border border-border/80 bg-card/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Sparkles className="size-3.5 text-accent" />
              <span>Chọn Mô hình AI</span>
            </div>
            <span className="text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md font-mono">
              {AI_MODELS.length} models
            </span>
          </div>

          {/* Model Options List */}
          <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-0.5">
            {AI_MODELS.map((model) => {
              const isSelected = model.id === currentModel.id;
              const ModelIcon = model.icon;

              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => handleSelect(model)}
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full flex items-start gap-2.5 rounded-xl p-2.5 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-accent/15 border border-accent/40 shadow-xs"
                      : "hover:bg-secondary/70 border border-transparent"
                  }`}
                >
                  <div
                    className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-xl border text-xs font-bold ${model.accentColor}`}
                  >
                    <ModelIcon className="size-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span className="text-xs font-bold text-foreground truncate">
                        {model.name}
                      </span>
                      <span className="shrink-0 text-[10px] font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                        {model.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                      {model.description}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground/80">
                      <span className="uppercase tracking-wider font-semibold font-mono text-[9px] px-1.5 py-0.5 rounded bg-secondary">
                        {model.provider}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="shrink-0 text-accent mt-1">
                      <Check className="size-4 stroke-[2.5]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Hint */}
          <div className="mt-1.5 pt-1.5 border-t border-border/40 px-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Info className="size-3 shrink-0 text-accent/80" />
            <span>Tự động lưu cho các lượt hỏi tiếp theo.</span>
          </div>
        </div>
      )}
    </div>
  );
}
