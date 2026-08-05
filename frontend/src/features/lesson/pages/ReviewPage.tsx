import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { AppHeader } from '@/components/common/app-header';
import { quizService } from '@/services/lesson.service';
import type { Exercise } from '@/services/lesson.service';
import './ReviewPage.css';

export const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizService.getReviewItems()
      .then(setItems)
      .catch(() => setItems(MOCK_REVIEW))
      .finally(() => setLoading(false));
  }, []);

  const startReview = () => {
    navigate('/review/session');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="review-page">
      <div className="review-header animate-fade-in">
        <div className="review-icon"><RotateCcw size={26} /></div>
        <div>
          <h1 className="review-title">Ôn tập</h1>
          <p className="review-subtitle">Flashcard theo thuật toán nhắc lại thông minh</p>
        </div>
      </div>

      {/* Count badge */}
      <div className="review-count-card animate-slide-up">
        {loading ? (
          <div className="skeleton" style={{ height: 80 }} />
        ) : items.length === 0 ? (
          <div className="review-all-done">
            <CheckCircle2 size={40} className="review-done-icon" />
            <div>
              <div className="review-done-title">Tuyệt vời! 🎉</div>
              <div className="review-done-desc">Bạn đã ôn tập hết tất cả thẻ hôm nay.</div>
            </div>
          </div>
        ) : (
          <>
            <div className="review-count-number">{items.length}</div>
            <div className="review-count-label">thẻ cần ôn tập hôm nay</div>
          </>
        )}
      </div>

      {/* Item preview */}
      {!loading && items.length > 0 && (
        <>
          <div className="review-preview animate-slide-up">
            <h2 className="review-preview-title">Xem trước</h2>
            <div className="review-preview-list">
              {items.slice(0, 5).map(item => (
                <div key={item.id} className="review-preview-item">
                  <span className="review-preview-word">{item.question}</span>
                  {item.questionFurigana && <span className="review-preview-furigana">{item.questionFurigana}</span>}
                  <span className="review-preview-meaning">{item.questionMeaning ?? item.correctAnswer}</span>
                </div>
              ))}
              {items.length > 5 && (
                <div className="review-preview-more">+ {items.length - 5} thẻ nữa...</div>
              )}
            </div>
          </div>

          <button
            id="review-start-btn"
            className="review-start-btn animate-bounce"
            onClick={startReview}
          >
            <RotateCcw size={18} />
            Bắt đầu ôn tập ({items.length} thẻ)
          </button>
        </>
      )}
      </div>
    </div>
  );
};

const MOCK_REVIEW: Exercise[] = [
  { id: '1', type: 'flashcard', question: '食べる', questionFurigana: 'たべる', questionMeaning: 'ăn', correctAnswer: 'ăn', entityType: 'VOCABULARY', entityId: 1 },
  { id: '2', type: 'flashcard', question: '飲む', questionFurigana: 'のむ', questionMeaning: 'uống', correctAnswer: 'uống', entityType: 'VOCABULARY', entityId: 2 },
  { id: '3', type: 'flashcard', question: '山', questionFurigana: 'やま', questionMeaning: 'núi', correctAnswer: 'núi', entityType: 'KANJI', entityId: 3 },
];
