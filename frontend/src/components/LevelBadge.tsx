import React from 'react';
import './LevelBadge.css';

interface LevelBadgeProps {
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, size = 'md', className = '' }) => {
  return (
    <span className={`level-badge level-badge--${level.toLowerCase()} level-badge--${size} ${className}`}>
      {level}
    </span>
  );
};
