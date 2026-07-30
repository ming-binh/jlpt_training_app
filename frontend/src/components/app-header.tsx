import { Link, useLocation } from "react-router-dom";
import { BookOpen, Brain, MessageCircle, PenLine, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/tu-vung", label: "Từ vựng", icon: BookOpen },
  { to: "/kanji", label: "Kanji", icon: PenLine },
  { to: "/ngu-phap", label: "Ngữ pháp", icon: Brain },
  { to: "/chat", label: "Trợ lý AI", icon: MessageCircle },
] as const;

export function AppHeader() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="jp grid size-10 place-items-center rounded-xl bg-primary text-lg text-primary-foreground shadow-[var(--shadow-lift)]">
            日
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold tracking-wide">NIHON JOURNEY</span>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              JLPT N5 → N3
            </span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 overflow-x-auto">
          {NAV.map((item) => {
            const isActive = item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  isActive && "bg-secondary text-accent font-medium"
                )}
              >
                <item.icon className="size-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
