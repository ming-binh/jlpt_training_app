import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { toast } from "../components/ui/toast";
import { supabase } from "../lib/supabase";
import { AuthShell, GoogleMark } from "../components/auth/auth-shell";
import { AppHeader } from "../components/app-header";
import { cn } from "../lib/utils";
import api from "../services/api";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";
  const initialMode = searchParams.get("mode") === "dang-ky" ? "dang-ky" : "dang-nhap";

  const [tab, setTab] = useState<"dang-nhap" | "dang-ky">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sentConfirm, setSentConfirm] = useState(false);

  useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) {
      api.get("/ai/conversations").catch(() => {});
      navigate(redirectTarget, { replace: true });
    }
  });

  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      api.get("/ai/conversations").catch(() => {});
      navigate(redirectTarget, { replace: true });
    }
  });

  return () => {
    authListener.subscription.unsubscribe();
  };
}, [navigate, redirectTarget]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!email.trim() || !isValidEmail(email)) {
      next.email = "Email không hợp lệ";
    }
    if (!password || password.length < 6) {
      next.password = "Mật khẩu cần ít nhất 6 ký tự";
    }
    if (tab === "dang-ky" && confirm !== password) {
      next.confirm = "Mật khẩu nhập lại không khớp";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setBusy("email");
    try {
      if (tab === "dang-nhap") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          toast.error(
            error.message.includes("Invalid login")
              ? "Email hoặc mật khẩu không đúng."
              : error.message.includes("Email not confirmed")
              ? "Bạn cần xác nhận email trước khi đăng nhập."
              : "Không đăng nhập được. Vui lòng thử lại."
          );
          return;
        }
        toast.success("Chào mừng bạn trở lại!");
        navigate(redirectTarget);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) {
          toast.error(
            error.message.includes("already registered")
              ? "Email này đã có tài khoản. Hãy đăng nhập."
              : "Không tạo được tài khoản. Vui lòng thử lại."
          );
          return;
        }
        if (!data.session) {
          setSentConfirm(true);
          return;
        }
        toast.success("Tạo tài khoản thành công!");
        navigate(redirectTarget);
      }
    } finally {
      setBusy(null);
    }
  };

  const onGoogle = async () => {
    setBusy("google");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error("Không đăng nhập được bằng Google. Vui lòng thử lại.");
      }
    } finally {
      setBusy(null);
    }
  };

  if (sentConfirm) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <AppHeader />
        <main className="flex-1">
          <AuthShell
            title="Kiểm tra email của bạn"
            subtitle={`Chúng tôi đã gửi liên kết xác nhận tới ${email}. Mở email và bấm xác nhận để hoàn tất đăng ký.`}
          >
            <div className="grid gap-4">
              <div className="grid place-items-center gap-3 rounded-xl border border-border bg-secondary/40 p-6 text-center">
                <MailCheck className="size-8 text-accent" />
                <p className="text-sm text-muted-foreground">
                  Không thấy email? Kiểm tra mục spam hoặc thử lại sau vài phút.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSentConfirm(false);
                  setTab("dang-nhap");
                }}
                className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground cursor-pointer"
              >
                Về trang đăng nhập
              </button>
            </div>
          </AuthShell>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <AuthShell
          title={tab === "dang-nhap" ? "Đăng nhập" : "Tạo tài khoản mới"}
          subtitle={
            tab === "dang-nhap"
              ? "Tiếp tục lộ trình JLPT và lịch sử hội thoại của bạn."
              : "Chỉ cần email và mật khẩu — bắt đầu học trong 30 giây."
          }
          footer={
            tab === "dang-nhap" ? (
              <span className="text-muted-foreground">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => setTab("dang-ky")}
                  className="font-semibold text-accent cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </span>
            ) : (
              <span className="text-muted-foreground">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => setTab("dang-nhap")}
                  className="font-semibold text-accent cursor-pointer"
                >
                  Đăng nhập
                </button>
              </span>
            )
          }
        >
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary/60 p-1">
            {(["dang-nhap", "dang-ky"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                  tab === value
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {value === "dang-nhap" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground font-medium">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
                placeholder="ban@email.com"
                className="h-12 rounded-xl border border-border bg-background px-4 text-base outline-none transition-colors focus:border-accent"
              />
              {errors.email ? <span className="text-xs text-destructive">{errors.email}</span> : null}
            </label>

            <label className="grid gap-2 text-sm">
              <span className="flex items-center justify-between text-muted-foreground font-medium">
                Mật khẩu
                {tab === "dang-nhap" ? (
                  <Link to="/quen-mat-khau" className="text-xs font-medium text-accent hover:underline">
                    Quên mật khẩu?
                  </Link>
                ) : null}
              </span>
              <span className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={tab === "dang-nhap" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-12 text-base outline-none transition-colors focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
              {errors.password ? (
                <span className="text-xs text-destructive">{errors.password}</span>
              ) : null}
            </label>

            {tab === "dang-ky" ? (
              <label className="grid gap-2 text-sm">
                <span className="text-muted-foreground font-medium">Nhập lại mật khẩu</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="h-12 rounded-xl border border-border bg-background px-4 text-base outline-none transition-colors focus:border-accent"
                />
                {errors.confirm ? (
                  <span className="text-xs text-destructive">{errors.confirm}</span>
                ) : null}
              </label>
            ) : null}

            <button
              type="submit"
              disabled={busy !== null}
              className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer shadow-md"
            >
              {busy === "email" ? <Loader2 className="size-4 animate-spin" /> : null}
              {tab === "dang-nhap" ? "Đăng nhập" : "Tạo tài khoản"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> hoặc <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={onGoogle}
            disabled={busy !== null}
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-background text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60 cursor-pointer"
          >
            {busy === "google" ? <Loader2 className="size-4 animate-spin" /> : <GoogleMark />}
            Tiếp tục với Google
          </button>

          <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
            Khi tiếp tục, bạn đồng ý với điều khoản sử dụng của Nihon Journey.
          </p>
        </AuthShell>
      </main>
    </div>
  );
}
