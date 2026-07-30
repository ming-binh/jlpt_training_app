import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, RotateCcw, Home } from 'lucide-react';
import type { ExerciseResult } from '../types';
import './LessonComplete.css';

interface LessonCompleteProps {
  results: ExerciseResult[];
  xpEarned: number;
  lessonTitle: string;
  onRetry: () => void;
}

export const LessonComplete: React.FC<LessonCompleteProps> = ({
  results,
  xpEarned,
  lessonTitle,
  onRetry,
}) => {
  const navigate = useNavigate();
  const correctCount = results.filter(r => r.correct).length;
  const totalCount = results.length;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const avgTime = totalCount > 0
    ? Math.round(results.reduce((s, r) => s + r.timeMs, 0) / totalCount / 1000)
    : 0;

  const getScoreLabel = () => {
    if (score >= 90) return { emoji: '🏆', label: 'Xuất sắc!', color: 'gold' };
    if (score >= 70) return { emoji: '🌟', label: 'Tốt lắm!', color: 'primary' };
    if (score >= 50) return { emoji: '💪', label: 'Cần cố gắng hơn', color: 'warning' };
    return { emoji: '📚', label: 'Ôn tập thêm nhé', color: 'muted' };
  };

  const { emoji, label, color } = getScoreLabel();

  return (
    <div className="lc-wrapper animate-bounce">
      {/* Trophy */}
      <div className={`lc-trophy lc-trophy--${color}`}>
        <span className="lc-trophy-emoji" role="img" aria-label={label}>{emoji}</span>
      </div>

      <div className="lc-title">{label}</div>
      <div className="lc-lesson-name">{lessonTitle}</div>

      {/* Score ring */}
      <div className="lc-score-ring" style={{ '--score-pct': `${score}` } as React.CSSProperties}>
        <div className="lc-score-value">{score}<span className="lc-score-unit">%</span></div>
        <div className="lc-score-label">Điểm số</div>
      </div>

      {/* Stats */}
      <div className="lc-stats">
        <div className="lc-stat">
          <div className="lc-stat-value lc-stat-correct">{correctCount}</div>
          <div className="lc-stat-label">Đúng</div>
        </div>
        <div className="lc-stat-divider" />
        <div className="lc-stat">
          <div className="lc-stat-value lc-stat-incorrect">{totalCount - correctCount}</div>
          <div className="lc-stat-label">Sai</div>
        </div>
        <div className="lc-stat-divider" />
        <div className="lc-stat">
          <div className="lc-stat-value lc-stat-time">{avgTime}s</div>
          <div className="lc-stat-label">Avg/câu</div>
        </div>
        <div className="lc-stat-divider" />
        <div className="lc-stat">
          <div className="lc-stat-value lc-stat-xp animate-xp">+{xpEarned}</div>
          <div className="lc-stat-label">XP</div>
        </div>
      </div>

      {/* Actions */}
      <div className="lc-actions">
        <button
          id="lesson-complete-retry-btn"
          className="lc-btn lc-btn--secondary"
          onClick={onRetry}
        >
          <RotateCcw size={16} />
          Học lại
        </button>
        <button
          id="lesson-complete-home-btn"
          className="lc-btn lc-btn--primary"
          onClick={() => navigate('/learn')}
        >
          <Home size={16} />
          Bài học khác
        </button>
      </div>

      {/* Stars */}
      <div className="lc-stars" aria-label={`${Math.ceil(score / 33.4)} out of 3 stars`}>
        {[1, 2, 3].map(star => (
          <Star
            key={star}
            size={28}
            className={`lc-star ${score >= star * 33.4 ? 'lc-star--filled' : ''}`}
            fill={score >= star * 33.4 ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    </div>
  );
};
