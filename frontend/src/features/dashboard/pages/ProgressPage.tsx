import React, { useEffect, useState } from 'react';
import { TrendingUp, Star, Zap } from 'lucide-react';
import { StreakBadge } from '@/components/StreakBadge';
import { XPBar } from '@/components/XPBar';
import { LevelBadge } from '@/components/LevelBadge';
import { progressService } from '@/services/lesson.service';
import type { ProgressSummary, JlptLevel } from '@/services/lesson.service';
import './ProgressPage.css';

const DEFAULT: ProgressSummary = {
  streak: 7, xp: 340, xpToNextLevel: 500,
  masteredVocab: 48, masteredKanji: 12, masteredGrammar: 9,
  todayGoalComplete: true, jlptLevel: 'N5',
};

// Last 14 days mock streak calendar
const mockCalendar = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' }),
  studied: Math.random() > 0.3,
}));

export const ProgressPage: React.FC = () => {
  const [summary, setSummary] = useState<ProgressSummary>(DEFAULT);

  useEffect(() => {
    progressService.getSummary()
      .then(setSummary)
      .catch(() => setSummary(DEFAULT));
  }, []);

  const totalMastered = summary.masteredVocab + summary.masteredKanji + summary.masteredGrammar;

  return (
    <div className="progress-page page-container">

      <div className="progress-header animate-fade-in">
        <TrendingUp size={22} className="progress-header-icon" />
        <h1 className="progress-title">Tiến độ học tập</h1>
      </div>

      {/* Level + XP */}
      <div className="progress-level-card animate-slide-up">
        <div className="progress-level-info">
          <LevelBadge level={summary.jlptLevel as JlptLevel} size="lg" />
          <div className="progress-level-detail">
            <span className="progress-level-name">JLPT {summary.jlptLevel}</span>
            <span className="progress-level-sub">Level hiện tại</span>
          </div>
        </div>
        <div className="progress-level-xp">
          <div className="progress-xp-row">
            <Zap size={14} className="progress-xp-icon" />
            <span className="progress-xp-value">{summary.xp} / {summary.xpToNextLevel} XP</span>
          </div>
          <XPBar current={summary.xp} max={summary.xpToNextLevel} showText={false} />
          <span className="progress-xp-hint">
            Còn {summary.xpToNextLevel - summary.xp} XP để lên level tiếp theo
          </span>
        </div>
      </div>

      {/* Streak */}
      <div className="progress-section animate-fade-in">
        <h2 className="progress-section-title">🔥 Streak học tập</h2>
        <div className="progress-streak-card">
          <StreakBadge days={summary.streak} size="lg" animated />
          <div className="progress-streak-detail">
            <span className="progress-streak-main">{summary.streak} ngày liên tiếp</span>
            <span className="progress-streak-sub">Tiếp tục học mỗi ngày để tăng streak!</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="progress-calendar">
          {mockCalendar.map((day, i) => (
            <div key={i} className={`progress-cal-day ${day.studied ? 'progress-cal-day--done' : ''}`}>
              <div className="progress-cal-dot" />
              <span className="progress-cal-label">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mastered items */}
      <div className="progress-section animate-slide-up">
        <h2 className="progress-section-title">⭐ Đã thuộc</h2>
        <div className="progress-mastery-row">
          <div className="progress-mastery-item progress-mastery-item--vocab">
            <div className="progress-mastery-num">{summary.masteredVocab}</div>
            <div className="progress-mastery-label">Từ vựng</div>
            <div className="progress-mastery-icon">📖</div>
          </div>
          <div className="progress-mastery-item progress-mastery-item--kanji">
            <div className="progress-mastery-num">{summary.masteredKanji}</div>
            <div className="progress-mastery-label">Kanji</div>
            <div className="progress-mastery-icon" style={{ fontSize: 20, fontWeight: 700 }}>漢</div>
          </div>
          <div className="progress-mastery-item progress-mastery-item--grammar">
            <div className="progress-mastery-num">{summary.masteredGrammar}</div>
            <div className="progress-mastery-label">Ngữ pháp</div>
            <div className="progress-mastery-icon">文</div>
          </div>
        </div>
        <div className="progress-total-badge">
          <Star size={14} />
          Tổng: {totalMastered} mục đã thuộc
        </div>
      </div>

    </div>
  );
};
