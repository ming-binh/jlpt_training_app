import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sword, ChevronRight } from 'lucide-react';
import type { JlptLevel, ContentType } from '../services/lesson.service';
import { LevelBadge } from '../components/LevelBadge';
import './PracticePage.css';

const LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
const TYPES: { type: ContentType | 'MIXED'; label: string }[] = [
  { type: 'MIXED',      label: '🎲 Tổng hợp (Trộn ngẫu nhiên)' },
  { type: 'VOCABULARY', label: '📖 Từ vựng' },
  { type: 'KANJI',      label: '漢 Kanji' },
  { type: 'GRAMMAR',    label: '文 Ngữ pháp' },
];

export const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<JlptLevel>('N5');
  const [selectedType, setSelectedType] = useState<ContentType | 'MIXED'>('MIXED');
  const [questionCount, setQuestionCount] = useState(10);

  const handleStart = () => {
    const params = new URLSearchParams({
      level: selectedLevel,
      type: selectedType,
      count: String(questionCount),
    });
    navigate(`/practice/session?${params}`);
  };

  return (
    <div className="practice-page page-container">
      <div className="practice-header animate-fade-in">
        <div className="practice-icon"><Sword size={28} /></div>
        <h1 className="practice-title">Luyện tập</h1>
        <p className="practice-subtitle">Quiz tổng hợp theo lựa chọn của bạn</p>
      </div>

      {/* Level */}
      <div className="practice-section animate-slide-up">
        <label className="practice-section-label">JLPT Level</label>
        <div className="practice-level-grid">
          {LEVELS.map(lvl => (
            <button
              key={lvl}
              id={`practice-level-${lvl.toLowerCase()}`}
              className={`practice-level-btn ${selectedLevel === lvl ? 'practice-level-btn--active' : ''}`}
              onClick={() => setSelectedLevel(lvl)}
            >
              <LevelBadge level={lvl} size="lg" />
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="practice-section animate-slide-up">
        <label className="practice-section-label">Loại bài tập</label>
        <div className="practice-type-list">
          {TYPES.map(t => (
            <button
              key={t.type}
              id={`practice-type-${t.type.toLowerCase()}`}
              className={`practice-type-btn ${selectedType === t.type ? 'practice-type-btn--active' : ''}`}
              onClick={() => setSelectedType(t.type)}
            >
              {t.label}
              <ChevronRight size={14} className="practice-type-arrow" />
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="practice-section animate-slide-up">
        <label className="practice-section-label">Số câu hỏi</label>
        <div className="practice-count-row">
          {[5, 10, 20, 30].map(n => (
            <button
              key={n}
              id={`practice-count-${n}`}
              className={`practice-count-btn ${questionCount === n ? 'practice-count-btn--active' : ''}`}
              onClick={() => setQuestionCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Start */}
      <button id="practice-start-btn" className="practice-start-btn animate-bounce" onClick={handleStart}>
        Bắt đầu luyện tập ⚡
      </button>
    </div>
  );
};
