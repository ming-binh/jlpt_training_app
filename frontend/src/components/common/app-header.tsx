import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Brain, MessageCircle, PenLine, Home, User as UserIcon, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { userService } from "@/services/user.service";

const NAV = [
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/tu-vung", label: "Từ vựng", icon: BookOpen },
  { to: "/kanji", label: "Kanji", icon: PenLine },
  { to: "/ngu-phap", label: "Ngữ pháp", icon: Brain },
  { to: "/chat", label: "Trợ lý AI", icon: MessageCircle },
] as const;

const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [jlptLevel, setJlptLevel] = useState<string>("N5");
  const [showLevelMenu, setShowLevelMenu] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || "Học Viên");
        userService.getCurrentUser()
          .then((profile) => {
            if (profile && profile.jlptLevel) {
              setJlptLevel(profile.jlptLevel);
            }
          })
          .catch(() => null);
      } else {
        setUserEmail(null);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLevelChange = async (level: string) => {
    setJlptLevel(level);
    setShowLevelMenu(false);
    try {
      await userService.updateProfile({ jlptLevel: level });
    } catch (err) {
      console.warn("Could not save JLPT level to server:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="jp grid size-10 place-items-center rounded-xl bg-primary text-lg text-primary-foreground shadow-[var(--shadow-lift)]">
            日
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold tracking-wide">NIHON JOURNEY</span>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              JLPT TUTOR AI
            </span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1">
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

          <div className="ml-2 border-l border-border pl-3 flex items-center gap-2 shrink-0">
            {userEmail ? (
              <div className="flex items-center gap-2">
                {/* Level selector dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLevelMenu(!showLevelMenu)}
                    className="flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent transition-colors hover:bg-accent/20 cursor-pointer"
                    title="Chọn cấp độ JLPT mục tiêu"
                  >
                    <span>{jlptLevel}</span>
                    <ChevronDown className="size-3" />
                  </button>

                  {showLevelMenu && (
                    <div className="absolute right-0 mt-1 w-24 rounded-xl border border-border bg-card p-1 shadow-xl z-50">
                      {JLPT_LEVELS.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleLevelChange(lvl)}
                          className={cn(
                            "w-full text-left rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                            jlptLevel === lvl ? "bg-accent text-accent-foreground font-bold" : "hover:bg-secondary text-foreground"
                          )}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-xs font-medium text-muted-foreground max-w-[120px] truncate hidden lg:inline">
                  {userEmail}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                  <span className="hidden sm:inline">Thoát</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent/90 cursor-pointer"
              >
                <UserIcon className="size-3.5" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
