import React from 'react';
import './ExerciseProgress.css';

interface ExerciseProgressProps {
  current: number;
  total: number;
  correctCount: number;
  onExit?: () => void;
}

export const ExerciseProgress: React.FC<ExerciseProgressProps> = ({
  current,
  total,
  correctCount,
  onExit,
}) => {
  const pct = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="ex-progress-bar-container">
      {onExit && (
        <button
          id="lesson-exit-btn"
          className="ex-progress-exit"
          onClick={onExit}
          aria-label="Exit lesson"
          title="Thoát bài học"
        >
          ✕
        </button>
      )}

      <div className="ex-progress-track" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
        <div
          className="ex-progress-fill"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="ex-progress-counter">
        <span className="ex-progress-current">{current}</span>
        <span className="ex-progress-sep">/</span>
        <span className="ex-progress-total">{total}</span>
        {current > 0 && (
          <span className="ex-progress-correct">
            ✓ {correctCount}
          </span>
        )}
      </div>
    </div>
  );
};
