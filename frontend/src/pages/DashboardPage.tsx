import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, RotateCcw, Sword, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import { StreakBadge } from '../components/StreakBadge';
import { XPBar } from '../components/XPBar';
import { LevelBadge } from '../components/LevelBadge';
import { progressService } from '../services/lesson.service';
import type { ProgressSummary, JlptLevel } from '../services/lesson.service';
import { supabase } from '../lib/supabase';
import './DashboardPage.css';


const DEFAULT_SUMMARY: ProgressSummary = {
  streak: 7,
  xp: 340,
  xpToNextLevel: 500,
  masteredVocab: 48,
  masteredKanji: 12,
  masteredGrammar: 9,
  todayGoalComplete: false,
  jlptLevel: 'N5',
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ProgressSummary>(DEFAULT_SUMMARY);
  const [userName, setUserName] = useState<string>('Học Viên');

  useEffect(() => {
    progressService.getSummary()
      .then(setSummary)
      .catch(() => setSummary(DEFAULT_SUMMARY));

    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.full_name ?? data.user?.email ?? 'Học Viên';
      setUserName(name.split(' ').pop() ?? name);
    });
  }, []);


  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const QUICK_ACTIONS = [
    {
      id: 'dash-quick-learn',
      icon: <BookOpen size={20} />,
      label: 'Tiếp tục học',
      desc: 'Từ vựng N5',
      path: '/learn',
      accent: 'primary',
    },
    {
      id: 'dash-quick-review',
      icon: <RotateCcw size={20} />,
      label: 'Ôn tập',
      desc: 'Thẻ cần nhắc lại',
      path: '/review',
      accent: 'accent',
    },
    {
      id: 'dash-quick-practice',
      icon: <Sword size={20} />,
      label: 'Luyện tập',
      desc: 'Quiz tổng hợp',
      path: '/practice',
      accent: 'n3',
    },
    {
      id: 'dash-quick-progress',
      icon: <TrendingUp size={20} />,
      label: 'Tiến độ',
      desc: 'Xem thống kê',
      path: '/progress',
      accent: 'n4',
    },
  ];

  return (
    <div className="dashboard-page page-container">

      {/* Greeting */}
      <div className="dash-greeting animate-fade-in">
        <div className="dash-greeting-text">
          <span className="dash-greeting-hello">{greeting()},</span>
          <span className="dash-greeting-name">{userName}! 👋</span>
        </div>
        <LevelBadge level={summary.jlptLevel as JlptLevel} size="lg" />
      </div>

      {/* Streak + XP Card */}
      <div className="dash-stats-card animate-slide-up">
        <div className="dash-stats-streak">
          <StreakBadge days={summary.streak} size="lg" animated />
          <span className="dash-stats-streak-label">ngày liên tiếp</span>
        </div>

        <div className="dash-stats-divider" />

        <div className="dash-stats-xp">
          <div className="dash-stats-xp-header">
            <Zap size={14} className="dash-xp-icon" />
            <span className="dash-xp-label">{summary.xp} / {summary.xpToNextLevel} XP</span>
          </div>
          <XPBar current={summary.xp} max={summary.xpToNextLevel} showText={false} />
          <span className="dash-xp-hint">Cần {summary.xpToNextLevel - summary.xp} XP nữa để lên level</span>
        </div>
      </div>

      {/* Today Goal Banner */}
      {!summary.todayGoalComplete && (
        <div className="dash-goal-banner animate-fade-in">
          <div className="dash-goal-icon">🎯</div>
          <div className="dash-goal-text">
            <span className="dash-goal-title">Mục tiêu hôm nay</span>
            <span className="dash-goal-desc">Hoàn thành 1 bài học để duy trì streak!</span>
          </div>
          <button
            id="dash-start-goal-btn"
            className="dash-goal-btn"
            onClick={() => navigate('/learn')}
          >
            Bắt đầu →
          </button>
        </div>
      )}

      {summary.todayGoalComplete && (
        <div className="dash-goal-banner dash-goal-banner--done animate-fade-in">
          <div className="dash-goal-icon">✅</div>
          <div className="dash-goal-text">
            <span className="dash-goal-title">Hoàn thành hôm nay!</span>
            <span className="dash-goal-desc">Tuyệt vời! Bạn đã đạt mục tiêu ngày hôm nay.</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="dash-section animate-slide-up">
        <h2 className="dash-section-title">Bắt đầu ngay</h2>
        <div className="dash-quick-grid">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.id}
              id={action.id}
              className={`dash-quick-card dash-quick-card--${action.accent}`}
              onClick={() => navigate(action.path)}
            >
              <div className={`dash-quick-icon dash-quick-icon--${action.accent}`}>
                {action.icon}
              </div>
              <div className="dash-quick-info">
                <span className="dash-quick-label">{action.label}</span>
                <span className="dash-quick-desc">{action.desc}</span>
              </div>
              <ChevronRight size={16} className="dash-quick-arrow" />
            </button>
          ))}
        </div>
      </div>

      {/* Mastery Stats */}
      <div className="dash-section animate-slide-up">
        <h2 className="dash-section-title">Đã thuộc</h2>
        <div className="dash-mastery-grid">
          <div className="dash-mastery-card dash-mastery-card--vocab">
            <div className="dash-mastery-value">{summary.masteredVocab}</div>
            <div className="dash-mastery-label">📖 Từ vựng</div>
          </div>
          <div className="dash-mastery-card dash-mastery-card--kanji">
            <div className="dash-mastery-value">{summary.masteredKanji}</div>
            <div className="dash-mastery-label">漢 Kanji</div>
          </div>
          <div className="dash-mastery-card dash-mastery-card--grammar">
            <div className="dash-mastery-value">{summary.masteredGrammar}</div>
            <div className="dash-mastery-label">文 Ngữ pháp</div>
          </div>
        </div>
      </div>

    </div>
  );
};
