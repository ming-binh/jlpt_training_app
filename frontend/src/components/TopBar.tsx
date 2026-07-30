import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { StreakBadge } from './StreakBadge';
import { XPBar } from './XPBar';
import './TopBar.css';

interface TopBarProps {
  streak?: number;
  xp?: number;
  xpMax?: number;
  title?: string;
  showBranding?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  streak = 0,
  xp = 0,
  xpMax = 100,
  title,
  showBranding = true,
}) => {
  const navigate = useNavigate();

  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        {/* Brand or Title */}
        <div className="top-bar-left">
          {showBranding ? (
            <button className="top-bar-brand" onClick={() => navigate('/dashboard')} aria-label="Go to dashboard">
              <div className="top-bar-logo">日</div>
              <span className="top-bar-name"><span className="top-bar-name-accent">JLPT</span> Master</span>
            </button>
          ) : (
            <h1 className="top-bar-title">{title}</h1>
          )}
        </div>

        {/* Stats */}
        <div className="top-bar-right">
          <StreakBadge days={streak} size="sm" />
          <div className="top-bar-xp">
            <XPBar current={xp} max={xpMax} showText={false} />
            <span className="top-bar-xp-text animate-xp">{xp} XP</span>
          </div>
          <button
            id="top-bar-chat-btn"
            className="top-bar-chat-btn"
            onClick={() => navigate('/chat')}
            aria-label="AI Tutor chat"
            title="Hỏi AI Sensei"
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
