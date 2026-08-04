import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Brain, MessageCircle, PenLine, Home, GraduationCap, Layers, User as UserIcon, LogOut, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { userService } from "@/services/user.service";

const NAV = [
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/bai-hoc", label: "Bài học", icon: GraduationCap },
  { to: "/tu-vung", label: "Từ vựng", icon: BookOpen },
  { to: "/kanji", label: "Kanji", icon: PenLine },
  { to: "/ngu-phap", label: "Ngữ pháp", icon: Brain },
  { to: "/practice", label: "Câu hỏi ôn tập", icon: Layers },
  { to: "/chat", label: "Trợ lý AI", icon: MessageCircle },
] as const;

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || "Học Viên");
        userService.getCurrentUser()
          .then((profile) => {
            if (profile && profile.username) {
              setUsername(profile.username);
            }
          })
          .catch(() => null);
      } else {
        setUserEmail(null);
        setUsername(null);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await supabase.auth.signOut();
    setUserEmail(null);
    setUsername(null);
    navigate("/login");
  };

  const initial = (username?.[0] || userEmail?.[0] || "M").toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
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

        {/* Right Section: Navigation Links & Avatar grouped together */}
        <div className="flex items-center gap-3">
          {/* Navigation Bar */}
          <nav className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1">
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
                  {item.to === "/kanji" ? (
                    <span className="jp font-bold text-xs">漢</span>
                  ) : (
                    <item.icon className="size-4" />
                  )}
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Separator line | */}
          <div className="h-5 w-px bg-border/80 shrink-0" aria-hidden="true" />

          {/* User Profile Avatar Section */}
          <div ref={menuRef} className="flex items-center gap-2 shrink-0 relative">
            {userEmail ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="grid size-9 place-items-center rounded-full border border-accent/50 bg-secondary text-sm font-bold text-accent transition-all hover:ring-2 hover:ring-accent/50 cursor-pointer shadow-md"
                  title="Tài khoản cá nhân (Bấm để xem Menu)"
                >
                  {initial}
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-2xl z-50 divide-y divide-border animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2">
                      <p className="truncate text-xs font-bold text-foreground">{username || "Học Viên"}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{userEmail}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary cursor-pointer"
                      >
                        <UserCheck className="size-4 text-accent" />
                        <span>Trang cá nhân</span>
                      </Link>
                      <Link
                        to="/chat"
                        onClick={() => setShowUserMenu(false)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary cursor-pointer"
                      >
                        <MessageCircle className="size-4 text-accent" />
                        <span>Phòng chat của tôi</span>
                      </Link>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
                      >
                        <LogOut className="size-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
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
        </div>
      </div>
    </header>
  );
}
