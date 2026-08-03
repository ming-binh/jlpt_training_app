import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import { AuthShell } from "../components/auth-shell";
import { AppHeader } from "@/components/common/app-header";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const isRecovery = hash.includes("type=recovery");

    supabase.auth.getSession().then(({ data }) => {
      setReady(isRecovery || Boolean(data.session));
    });
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!password || password.length < 6) {
      next.password = "Mật khẩu cần ít nhất 6 ký tự";
    }
    if (confirm !== password) {
      next.confirm = "Mật khẩu nhập lại không khớp";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error("Không cập nhật được mật khẩu. Hãy yêu cầu liên kết mới.");
        return;
      }
      setDone(true);
      toast.success("Đã đổi mật khẩu thành công.");
      setTimeout(() => navigate("/chat", { replace: true }), 1200);
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <AppHeader />
        <main className="flex-1">
          <AuthShell
            title="Liên kết không hợp lệ"
            subtitle="Liên kết đặt lại mật khẩu đã hết hạn hoặc không đúng. Hãy yêu cầu liên kết mới."
            footer={
              <Link to="/quen-mat-khau" className="font-semibold text-accent hover:underline">
                Gửi lại liên kết
              </Link>
            }
          >
            <div className="rounded-xl border border-border bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
              Mở email gần nhất từ Nihon Journey và bấm vào liên kết đặt lại mật khẩu.
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
          title={done ? "Xong rồi!" : "Đặt mật khẩu mới"}
          subtitle={
            done
              ? "Mật khẩu đã được cập nhật. Đang chuyển bạn vào ứng dụng…"
              : "Chọn mật khẩu mới, tối thiểu 6 ký tự."
          }
        >
          {done ? (
            <div className="grid place-items-center gap-3 rounded-xl border border-border bg-secondary/40 p-6 text-center">
              <ShieldCheck className="size-8 text-accent" />
              <p className="text-sm text-muted-foreground">Bạn có thể tiếp tục học ngay.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4">
              <label className="grid gap-2 text-sm">
                <span className="text-muted-foreground font-medium">Mật khẩu mới</span>
                <span className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-12 text-base outline-none transition-colors focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </span>
                {errors.password ? (
                  <span className="text-xs text-destructive">{errors.password}</span>
                ) : null}
              </label>
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
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer shadow-md"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                Cập nhật mật khẩu
              </button>
            </form>
          )}
        </AuthShell>
      </main>
    </div>
  );
}
