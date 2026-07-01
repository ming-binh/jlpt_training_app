import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, BookOpen, PenTool, Brain, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartLearning = () => {
    navigate('/chat');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: <MessageSquare size={24} />,
      title: 'Hội thoại tiếng Nhật',
      description: 'Luyện tập giao tiếp thực tế với các tình huống giao tiếp JLPT được cá nhân hóa.'
    },
    {
      icon: <BookOpen size={24} />,
      title: 'Giải thích Ngữ pháp',
      description: 'Hiểu cặn kẽ mọi điểm ngữ pháp khó với ví dụ minh họa và bài tập vận dụng.'
    },
    {
      icon: <PenTool size={24} />,
      title: 'Sửa lỗi Viết',
      description: 'AI phát hiện lỗi sai, giải thích cặn kẽ và gợi ý cách hành văn tự nhiên như người bản xứ.'
    },
    {
      icon: <Brain size={24} />,
      title: 'Phân tích Đề thi',
      description: 'Hệ thống hóa lỗi sai sau khi làm bài thi thử và đề xuất lộ trình khắc phục.'
    }
  ];

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="nav-brand">
          <span className="brand-orange">JLPT</span> AI Tutor
        </div>
        <div className="nav-actions">
          <Button variant="ghost" onClick={handleLogin}>Sign In</Button>
          <Button variant="primary" onClick={handleStartLearning}>Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Master JLPT with <br /> <span className="text-orange">AI Precision</span>
          </h1>
          <p className="hero-subtitle">
            A developer-friendly workspace for learning Japanese. Syntax highlighted grammar, structured feedback, and a smart conversational tutor.
          </p>
          <div className="hero-cta">
            <Button variant="primary" size="lg" onClick={handleStartLearning}>
              Start Learning Now <ArrowRight size={16} />
            </Button>
          </div>
        </div>
        
        {/* Mockup / Terminal Window Style */}
        <div className="hero-mockup">
          <div className="mockup-header">
            <div className="mockup-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="mockup-title">bash — jlpt-tutor</div>
          </div>
          <div className="mockup-body mono-text">
            <p><span className="text-muted">$</span> npm install -g jlpt-skills</p>
            <p className="text-success">&gt; Successfully installed N4 Grammar Pack</p>
            <p><span className="text-muted">$</span> chat --topic "て-form"</p>
            <p className="text-orange">AI: Here is how you use the て-form...</p>
            <p className="cursor-blink">_</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <h2>Core Features</h2>
          <p className="text-muted">Tools designed to accelerate your Japanese proficiency.</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <Card key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description text-muted">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="home-footer">
        <p className="text-subdued">© 2026 JLPT AI Tutor. All rights reserved.</p>
      </footer>
    </div>
  );
};
