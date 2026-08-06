import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AppHeader } from "@/components/common/app-header";
import { AuthShell } from "../components/auth-shell";

export function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang xác thực tài khoản của bạn...");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setStatus("error");
        setMessage(error.message || "Xác thực thất bại hoặc liên kết đã hết hạn.");
        return;
      }
      if (data.session) {
        setStatus("success");
        setMessage("Xác thực thành công! Đang đưa bạn về trang chủ...");
        setTimeout(() => navigate("/", { replace: true }), 2000);
        return;
      }

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" || session) {
          setStatus("success");
          setMessage("Xác thực thành công! Đang đưa bạn về trang chủ...");
          setTimeout(() => navigate("/", { replace: true }), 2000);
        }
      });
      return () => authListener.subscription.unsubscribe();
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <AuthShell title="Xác thực tài khoản" subtitle={message}>
          <div className="grid place-items-center gap-3 rounded-xl border border-border bg-secondary/40 p-6 text-center">
            {status === "loading" && <Loader2 className="size-8 animate-spin text-accent" />}
            {status === "success" && <CheckCircle2 className="size-8 text-emerald-400" />}
            {status === "error" && <XCircle className="size-8 text-destructive" />}
          </div>

          {status === "error" && (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-5 w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground cursor-pointer"
            >
              Quay lại đăng nhập
            </button>
          )}
        </AuthShell>
      </main>
    </div>
  );
}
