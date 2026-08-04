import React from 'react';
import { Clock, X } from 'lucide-react';
import './ExerciseProgress.css';

interface ExerciseProgressProps {
  current: number;
  total: number;
  correctCount: number;
  categoryLabel?: string;
  levelLabel?: string;
  timerText?: string;
  onExit?: () => void;
}

export const ExerciseProgress: React.FC<ExerciseProgressProps> = ({
  current,
  total,
  categoryLabel = 'TỪ VỰNG',
  levelLabel = 'N5–N3',
  timerText = 'Không giới hạn',
  onExit,
}) => {
  const currentStep = Math.min(current + 1, total > 0 ? total : 1);
  const pct = total > 0 ? (currentStep / total) * 100 : 0;

  return (
    <div className="quiz-header-wrapper">
      <div className="quiz-header-top">
        {/* Left: Category tag & Question counter */}
        <div className="quiz-header-left">
          <div className="quiz-category-tag">
            <span>{categoryLabel}</span>
            <span className="quiz-tag-sep">·</span>
            <span>{levelLabel}</span>
          </div>
          <h2 className="quiz-step-counter">
            Câu {currentStep} / {total}
          </h2>
        </div>

        {/* Right: Timer pill badge & Exit button */}
        <div className="quiz-header-right">
          <div className="quiz-timer-badge">
            <Clock className="size-3.5 text-amber-400/90" />
            <span>{timerText}</span>
          </div>

          {onExit && (
            <button
              type="button"
              id="lesson-exit-btn"
              className="quiz-exit-btn"
              onClick={onExit}
              aria-label="Close quiz"
              title="Thoát"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Thin full-width progress bar line */}
      <div className="quiz-progress-track">
        <div
          className="quiz-progress-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
