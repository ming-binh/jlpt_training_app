import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

type Listener = (toasts: ToastMessage[]) => void;

let toasts: ToastMessage[] = [];
let listeners: Listener[] = [];

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

function formatToastText(text: unknown, fallback: string): string {
  if (text === null || text === undefined) return fallback;
  if (typeof text === "string") {
    const trimmed = text.trim();
    if (!trimmed || trimmed === "{}" || trimmed === "[object Object]") return fallback;
    return trimmed;
  }
  if (typeof text === "object") {
    try {
      const str = JSON.stringify(text);
      if (str === "{}" || str === "[]") return fallback;
      return str;
    } catch {
      return fallback;
    }
  }
  return String(text);
}

export const toast = {
  success: (text: unknown) => {
    const id = String(Date.now() + Math.random());
    const displayText = formatToastText(text, "Thao tác thành công!");
    toasts = [...toasts, { id, type: "success", text: displayText }];
    notify();
    setTimeout(() => toast.dismiss(id), 4000);
  },
  error: (text: unknown) => {
    const id = String(Date.now() + Math.random());
    const displayText = formatToastText(text, "Có lỗi xảy ra. Vui lòng thử lại.");
    toasts = [...toasts, { id, type: "error", text: displayText }];
    notify();
    setTimeout(() => toast.dismiss(id), 5000);
  },
  info: (text: unknown) => {
    const id = String(Date.now() + Math.random());
    const displayText = formatToastText(text, "Thông báo từ hệ thống.");
    toasts = [...toasts, { id, type: "info", text: displayText }];
    notify();
    setTimeout(() => toast.dismiss(id), 4000);
  },
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
};

export function Toaster(_props?: { position?: string; richColors?: boolean }) {
  const [items, setItems] = useState<ToastMessage[]>([]);

  useEffect(() => {
    listeners.push(setItems);
    return () => {
      listeners = listeners.filter((l) => l !== setItems);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl p-4 shadow-xl border backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 ${
            t.type === "success"
              ? "bg-secondary/95 border-emerald-500/40 text-foreground"
              : t.type === "error"
              ? "bg-secondary/95 border-destructive/50 text-foreground"
              : "bg-secondary/95 border-accent/40 text-foreground"
          }`}
        >
          {t.type === "success" && <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />}
          {t.type === "error" && <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />}
          {t.type === "info" && <Info className="size-5 text-accent shrink-0 mt-0.5" />}
          
          <p className="flex-1 text-xs font-medium leading-relaxed">{t.text}</p>
          
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
