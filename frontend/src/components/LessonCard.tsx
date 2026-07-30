import React from 'react';
import { Lock, CheckCircle2, PlayCircle } from 'lucide-react';
import { LevelBadge } from './LevelBadge';
import './LessonCard.css';

export type LessonStatus = 'locked' | 'available' | 'in-progress' | 'completed';

interface LessonCardProps {
  id: number;
  title: string;
  description?: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  itemCount: number;
  completedCount?: number;
  status: LessonStatus;
  category: 'vocabulary' | 'kanji' | 'grammar';
  onClick?: () => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  vocabulary: '📖',
  kanji: '漢',
  grammar: '文',
};

export const LessonCard: React.FC<LessonCardProps> = ({
  title,
  description,
  level,
  itemCount,
  completedCount = 0,
  status,
  category,
  onClick,
}) => {
  const pct = itemCount > 0 ? Math.round((completedCount / itemCount) * 100) : 0;
  const isLocked = status === 'locked';

  return (
    <button
      className={`lesson-card lesson-card--${status} lesson-card--${category}`}
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      aria-disabled={isLocked}
    >
      {/* Category icon */}
      <div className="lesson-card-icon" aria-hidden="true">
        {CATEGORY_EMOJI[category]}
      </div>

      {/* Content */}
      <div className="lesson-card-body">
        <div className="lesson-card-header">
          <span className="lesson-card-title">{title}</span>
          <LevelBadge level={level} size="sm" />
        </div>
        {description && (
          <p className="lesson-card-desc">{description}</p>
        )}

        {/* Progress bar */}
        {status !== 'locked' && (
          <div className="lesson-card-progress">
            <div className="lesson-card-progress-track">
              <div
                className="lesson-card-progress-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="lesson-card-progress-text">{completedCount}/{itemCount}</span>
          </div>
        )}
      </div>

      {/* Status icon */}
      <div className="lesson-card-status" aria-hidden="true">
        {status === 'locked'    && <Lock size={18} />}
        {status === 'completed' && <CheckCircle2 size={18} />}
        {(status === 'available' || status === 'in-progress') && <PlayCircle size={18} />}
      </div>
    </button>
  );
};
