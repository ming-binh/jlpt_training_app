import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "../components/ui/toast";
import { supabase } from "../lib/supabase";
import { AuthShell } from "../components/auth/auth-shell";
import { AppHeader } from "../components/app-header";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !isValidEmail(email)) {
      setError("Email không hợp lệ");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) {
        toast.error("Không gửi được email. Vui lòng thử lại sau.");
        return;
      }
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <AppHeader />
        <main className="flex-1">
          <AuthShell
            title="Đã gửi email"
            subtitle={`Hãy mở email ${email} và bấm vào liên kết để đặt lại mật khẩu.`}
            footer={
              <Link to="/login" className="font-semibold text-accent hover:underline">
                Về trang đăng nhập
              </Link>
            }
          >
            <div className="grid place-items-center gap-3 rounded-xl border border-border bg-secondary/40 p-6 text-center">
              <MailCheck className="size-8 text-accent" />
              <p className="text-sm text-muted-foreground">
                Liên kết có hiệu lực trong thời gian ngắn. Nếu không thấy, hãy kiểm tra thư mục spam.
              </p>
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
          title="Quên mật khẩu"
          subtitle="Nhập email đã dùng để đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu."
          footer={
            <Link to="/login" className="font-semibold text-accent hover:underline">
              ← Quay lại đăng nhập
            </Link>
          }
        >
          <form onSubmit={onSubmit} className="grid gap-4">
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
              {error ? <span className="text-xs text-destructive">{error}</span> : null}
            </label>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer shadow-md"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Gửi liên kết đặt lại
            </button>
          </form>
        </AuthShell>
      </main>
    </div>
  );
}
