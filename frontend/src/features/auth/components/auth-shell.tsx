import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const HIGHLIGHTS = [
  { kanji: "語", text: "1.000+ từ vựng N5 → N3 kèm ví dụ" },
  { kanji: "漢", text: "Kanji với âm On/Kun và số nét" },
  { kanji: "文", text: "Cấu trúc ngữ pháp giải thích bằng tiếng Việt" },
  { kanji: "AI", text: "Sensei AI đồng hành 24/7" },
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="gradient-indigo absolute inset-0" />
      <div className="seigaiha absolute inset-0 opacity-60" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:py-14 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        {/* Cột giới thiệu — hiển thị trên màn hình máy tính (web) */}
        <div className="hidden lg:block">
          <span className="jp inline-grid size-12 place-items-center rounded-2xl bg-primary text-xl text-primary-foreground shadow-[var(--shadow-lift)]">
            日
          </span>
          <h2 className="mt-6 text-4xl font-semibold leading-tight">
            Học <span className="text-gold">JLPT</span> có lộ trình,
            <br />
            tiến độ được ghi nhớ
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Tạo tài khoản để lưu lịch sử hội thoại với Sensei AI và tiếp tục ôn tập trên mọi thiết bị.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h.kanji} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="jp grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-accent">
                  {h.kanji}
                </span>
                {h.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Thẻ form — tối ưu cho cả máy tính và điện thoại (mobile) */}
        <div className="surface-card mx-auto w-full max-w-md p-6 sm:p-8">
          <div className="lg:hidden mb-4">
            <Link to="/" className="jp inline-grid size-11 place-items-center rounded-xl bg-primary text-lg text-primary-foreground">
              日
            </Link>
          </div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          <div className="mt-7">{children}</div>
          {footer ? <div className="mt-6 text-center text-sm">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1A6.2 6.2 0 1 1 12 5.8c1.6 0 2.8.7 3.4 1.3l2.6-2.5A9.7 9.7 0 0 0 12 2a10 10 0 1 0 0 20c5.8 0 9.6-4 9.6-9.7 0-.7-.1-1.2-.2-1.7z"
      />
    </svg>
  );
}
