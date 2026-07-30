import React from 'react';
import './XPBar.css';

interface XPBarProps {
  current: number;
  max: number;
  label?: string;
  showText?: boolean;
  className?: string;
}

export const XPBar: React.FC<XPBarProps> = ({
  current,
  max,
  label = 'XP',
  showText = true,
  className = '',
}) => {
  const pct = Math.min(100, Math.round((current / max) * 100));

  return (
    <div className={`xp-bar-wrapper ${className}`}>
      {showText && (
        <div className="xp-bar-header">
          <span className="xp-bar-label">{label}</span>
          <span className="xp-bar-value animate-xp">{current} / {max}</span>
        </div>
      )}
      <div className="xp-bar-track" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={max}>
        <div
          className="xp-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
