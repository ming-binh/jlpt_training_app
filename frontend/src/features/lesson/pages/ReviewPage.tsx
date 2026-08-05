import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { AppHeader } from '@/components/common/app-header';
import { quizService } from '@/services/lesson.service';
import type { Exercise } from '@/services/lesson.service';

export const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizService.getReviewItems()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const startReview = () => {
    navigate('/review/session');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="jp text-sm text-accent">復習</p>
            <h1 className="mt-1 text-3xl font-semibold">Ôn tập</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Flashcard theo thuật toán nhắc lại thông minh.
            </p>
          </div>
          <span className="jp hidden shrink-0 text-6xl text-border sm:block">復</span>
        </header>

        {loading ? (
          <div className="surface-card mt-8 h-24 animate-pulse" />
        ) : items.length === 0 ? (
          <div className="surface-card mt-8 flex items-center gap-4 p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-accent bg-accent/15 text-accent">
              <Check className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Bạn đã ôn tập hết tất cả thẻ hôm nay</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Quay lại vào ngày mai để ôn tiếp.</p>
            </div>
          </div>
        ) : (
          <>
            <section className="surface-card mt-8 p-8 text-center">
              <p className="jp text-6xl font-semibold text-accent">{items.length}</p>
              <p className="mt-2 text-sm text-muted-foreground">thẻ cần ôn tập hôm nay</p>
            </section>

            <p className="mt-8 text-[11px] uppercase tracking-widest text-muted-foreground">
              Xem trước
            </p>
            <div className="surface-card mt-3 divide-y divide-border overflow-hidden">
              {items.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="jp min-w-12 text-lg font-medium">{item.question}</span>
                  {item.questionFurigana && (
                    <span className="jp text-xs text-muted-foreground">{item.questionFurigana}</span>
                  )}
                  <span className="ml-auto text-sm text-muted-foreground">
                    {item.questionMeaning ?? item.correctAnswer}
                  </span>
                </div>
              ))}
              {items.length > 5 && (
                <div className="px-4 py-3 text-center text-xs text-muted-foreground">
                  + {items.length - 5} thẻ nữa...
                </div>
              )}
            </div>

            <button
              id="review-start-btn"
              type="button"
              onClick={startReview}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              Bắt đầu ôn tập ({items.length} thẻ) <ArrowRight className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
