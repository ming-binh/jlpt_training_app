import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Layers, FileText, ChevronRight } from 'lucide-react';
import { LessonCard } from '../components/LessonCard';
import { lessonService } from '../services/lesson.service';
import type { Lesson, JlptLevel, ContentType } from '../services/lesson.service';
import './LearnPage.css';

const LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

const CATEGORIES: { type: ContentType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'VOCABULARY', label: 'Từ Vựng', icon: <BookOpen size={22} />, desc: 'Học từ theo chủ đề JLPT' },
  { type: 'KANJI',      label: 'Kanji',   icon: <span style={{ fontSize: 22, fontWeight: 700 }}>漢</span>, desc: 'Chữ Hán từ cơ bản đến nâng cao' },
  { type: 'GRAMMAR',   label: 'Ngữ Pháp', icon: <FileText size={22} />, desc: 'Điểm ngữ pháp thi JLPT' },
];

export const LearnPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<JlptLevel>('N5');
  const [selectedType, setSelectedType] = useState<ContentType>('VOCABULARY');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    lessonService.getLessons(selectedLevel, selectedType)
      .then(data => setLessons(data))
      .catch(() => setLessons(MOCK_LESSONS))
      .finally(() => setLoading(false));
  }, [selectedLevel, selectedType]);

  return (
    <div className="learn-page page-container">

      {/* Page Header */}
      <div className="learn-header animate-fade-in">
        <h1 className="learn-title">Chọn bài học</h1>
        <p className="learn-subtitle">Học từng bước, chinh phục JLPT</p>
      </div>

      {/* Category Tabs */}
      <div className="learn-categories animate-fade-in">
        {CATEGORIES.map(cat => (
          <button
            key={cat.type}
            id={`learn-cat-${cat.type.toLowerCase()}`}
            className={`learn-category-btn ${selectedType === cat.type ? 'learn-category-btn--active' : ''}`}
            onClick={() => setSelectedType(cat.type)}
          >
            <span className="learn-category-icon">{cat.icon}</span>
            <div className="learn-category-info">
              <span className="learn-category-label">{cat.label}</span>
              <span className="learn-category-desc">{cat.desc}</span>
            </div>
            <ChevronRight size={16} className="learn-category-chevron" />
          </button>
        ))}
      </div>

      {/* Level Filter */}
      <div className="learn-level-filter animate-fade-in">
        <span className="learn-level-filter-label">JLPT Level:</span>
        <div className="learn-level-tabs">
          {LEVELS.map(lvl => (
            <button
              key={lvl}
              id={`learn-level-${lvl.toLowerCase()}`}
              className={`learn-level-tab ${selectedLevel === lvl ? 'learn-level-tab--active' : ''} learn-level-tab--${lvl.toLowerCase()}`}
              onClick={() => setSelectedLevel(lvl)}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons List */}
      <div className="learn-lessons-list">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="learn-lesson-skeleton skeleton" />
          ))
        ) : lessons.length === 0 ? (
          <div className="learn-empty">
            <Layers size={40} />
            <p>Chưa có bài học nào cho level {selectedLevel}.</p>
            <span>Sẽ sớm được thêm vào!</span>
          </div>
        ) : (
          lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className="animate-pop"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <LessonCard
                id={lesson.id}
                title={lesson.title}
                description={lesson.description}
                level={lesson.jlptLevel as JlptLevel}
                itemCount={lesson.itemCount}
                completedCount={lesson.completedCount ?? 0}
                status={(lesson.status as any) ?? 'available'}
                category={lesson.contentType.toLowerCase() as any}
                onClick={() => navigate(`/lesson/${lesson.id}`)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─── Mock data (while backend API is not ready) ───────────────────────────────
const MOCK_LESSONS: Lesson[] = [
  { id: 1, title: 'Chào hỏi cơ bản', jlptLevel: 'N5', contentType: 'VOCABULARY', orderIndex: 1, itemCount: 10, completedCount: 10, status: 'completed' },
  { id: 2, title: 'Số đếm & Thời gian', jlptLevel: 'N5', contentType: 'VOCABULARY', orderIndex: 2, itemCount: 12, completedCount: 6, status: 'in-progress' },
  { id: 3, title: 'Gia đình & Con người', jlptLevel: 'N5', contentType: 'VOCABULARY', orderIndex: 3, itemCount: 15, completedCount: 0, status: 'available' },
  { id: 4, title: 'Màu sắc & Hình dạng', jlptLevel: 'N5', contentType: 'VOCABULARY', orderIndex: 4, itemCount: 10, completedCount: 0, status: 'locked' },
];
