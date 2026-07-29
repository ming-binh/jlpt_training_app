import React, { useState, useRef, useEffect } from 'react';
import { Send, LogOut, MessageSquare, Menu, BookOpen, PenTool, Brain, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { authService } from '../services/auth.service';
import { chatService, AiUseCase } from '../services/chat.service';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

const USE_CASES = [
  { value: AiUseCase.CONVERSATION,    label: 'Giao tiếp JLPT',       icon: <MessageSquare size={15} /> },
  { value: AiUseCase.GRAMMAR_EXPLAIN, label: 'Giải thích Ngữ pháp',  icon: <BookOpen size={15} /> },
  { value: AiUseCase.WRITING_CHECK,   label: 'Sửa lỗi Viết',         icon: <PenTool size={15} /> },
  { value: AiUseCase.MOCK_ANALYSIS,   label: 'Phân tích Đề thi',      icon: <Brain size={15} /> },
];

const SUGGESTIONS = [
  'て-form の使い方を教えて',
  'N4の文法を練習したい',
  'この文を添削してください',
  '模擬試験を分析して',
];

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState<AiUseCase>(AiUseCase.CONVERSATION);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage({
        useCase: selectedUseCase,
        params: { user_message: userMessage.content }
      });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.message,
      }]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `**Lỗi:** ${errorMessage}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const activeUseCase = USE_CASES.find(uc => uc.value === selectedUseCase);

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <aside className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-mark">J</div>
          <span className="sidebar-title"><span>JLPT</span> AI Tutor</span>
        </div>

        <div className="sidebar-content">
          <div className="section-label">Chế độ học</div>
          <div className="use-case-list">
            {USE_CASES.map((uc) => (
              <button
                key={uc.value}
                className={`use-case-btn ${selectedUseCase === uc.value ? 'active' : ''}`}
                onClick={() => {
                  setSelectedUseCase(uc.value);
                  setSidebarOpen(false);
                }}
              >
                {uc.icon}
                <span>{uc.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={15} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        {/* Header / Tab bar */}
        <header className="chat-header">
          <div className="chat-header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(prev => !prev)}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>

            {activeUseCase && (
              <div className="chat-active-tab">
                <span className="chat-active-tab-icon">{activeUseCase.icon}</span>
                {activeUseCase.label}
              </div>
            )}
          </div>

          <div className="user-profile" title="User profile">
            <User size={16} />
          </div>
        </header>

        {/* Messages */}
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state animate-fade-in">
              <div className="empty-icon-wrap">
                <Brain size={24} />
              </div>
              <h2>Xin chào! Tôi có thể giúp gì?</h2>
              <p>Hãy gửi tin nhắn hoặc chọn một gợi ý bên dưới để bắt đầu.</p>
              <div className="empty-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="suggestion-chip"
                    onClick={() => handleSuggestion(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper ${msg.role} animate-slide-up`}>
                {msg.role === 'model' && (
                  <div className="message-avatar ai-avatar">J</div>
                )}
                <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'model-bubble'}`}>
                  {msg.role === 'model' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="message-wrapper model animate-fade-in">
              <div className="message-avatar ai-avatar">J</div>
              <div className="message-bubble model-bubble typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-container">
          <form onSubmit={handleSend} className="chat-input-form">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={isLoading}
              className="chat-input"
            />
            <button
              type="submit"
              className={`send-btn ${input.trim() ? 'active' : ''}`}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
          <div className="disclaimer">
            JLPT AI Tutor có thể mắc lỗi. Vui lòng kiểm tra lại các thông tin quan trọng.
          </div>
        </div>
      </main>
    </div>
  );
};
