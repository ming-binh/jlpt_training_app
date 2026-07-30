import React from 'react';
import './StreakBadge.css';

interface StreakBadgeProps {
  days: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  days,
  size = 'md',
  animated = true,
  className = '',
}) => {
  return (
    <div className={`streak-badge streak-badge--${size} ${className}`}>
      <span className={`streak-flame ${animated ? 'animate-streak' : ''}`} aria-hidden="true">
        🔥
      </span>
      <span className="streak-count">{days}</span>
      {size !== 'sm' && <span className="streak-label">ngày</span>}
    </div>
  );
};
