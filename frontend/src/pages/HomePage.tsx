import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, BookOpen, PenTool, Brain, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MessageSquare size={20} />,
      title: 'Hội thoại tiếng Nhật',
      description: 'Luyện tập giao tiếp thực tế với các tình huống JLPT được cá nhân hóa.'
    },
    {
      icon: <BookOpen size={20} />,
      title: 'Giải thích Ngữ pháp',
      description: 'Hiểu cặn kẽ mọi điểm ngữ pháp với ví dụ minh họa và bài tập vận dụng.'
    },
    {
      icon: <PenTool size={20} />,
      title: 'Sửa lỗi Viết',
      description: 'AI phát hiện lỗi sai và gợi ý cách hành văn tự nhiên như người bản xứ.'
    },
    {
      icon: <Brain size={20} />,
      title: 'Phân tích Đề thi',
      description: 'Hệ thống hóa lỗi sai sau bài thi thử và đề xuất lộ trình khắc phục.'
    }
  ];

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="nav-brand">
          <div className="nav-brand-mark">J</div>
          <span><span className="brand-orange">JLPT</span> AI Tutor</span>
        </div>
        <div className="nav-actions">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/chat')}>Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content animate-fade-in">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Powered by Gemini AI · N5 – N1 coverage
          </div>

          <h1 className="hero-title">
            Master JLPT with<br />
            <span className="text-orange">AI Precision</span>
          </h1>

          <p className="hero-subtitle">
            A developer-friendly workspace for learning Japanese. Syntax-highlighted grammar,
            structured feedback, and a smart conversational tutor — all in one place.
          </p>

          <div className="hero-cta">
            <Button variant="primary" size="lg" onClick={() => navigate('/chat')}>
              Start Learning <ArrowRight size={16} />
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>

          <div className="hero-meta">
            <div className="hero-meta-item">
              <div className="hero-meta-value">N5–N1</div>
              <div className="hero-meta-label">JLPT Levels</div>
            </div>
            <div className="hero-meta-sep" />
            <div className="hero-meta-item">
              <div className="hero-meta-value">4</div>
              <div className="hero-meta-label">Study Modes</div>
            </div>
            <div className="hero-meta-sep" />
            <div className="hero-meta-item">
              <div className="hero-meta-value">24/7</div>
              <div className="hero-meta-label">AI Tutor</div>
            </div>
          </div>
        </div>

        {/* Terminal Mockup */}
        <div className="hero-mockup animate-slide-up">
          <div className="mockup-header">
            <div className="mockup-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <div className="mockup-title">bash — jlpt-tutor</div>
          </div>
          <div className="mockup-body">
            <p><span className="text-muted">$</span> jlpt-tutor --mode grammar-explain</p>
            <p className="text-success">&gt; Session started. Level: N4</p>
            <p><span className="text-muted">$</span> ask "て-form の使い方を教えてください"</p>
            <p className="text-orange">AI: て-form is used to connect verbs...</p>
            <p><span className="text-muted">$</span> ask "例文をください"</p>
            <p className="text-success">&gt; 食べてください (Please eat)</p>
            <p className="cursor-blink">▋</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <h2>Core Features</h2>
          <p>Tools designed to accelerate your Japanese proficiency.</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <Card key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <span>© 2026 JLPT AI Tutor</span>
        <span>Built with Gemini AI · React · Spring Boot</span>
      </footer>
    </div>
  );
};
