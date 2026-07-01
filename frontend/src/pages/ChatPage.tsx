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

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState<AiUseCase>(AiUseCase.CONVERSATION);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage({
        useCase: selectedUseCase,
        params: { user_message: userMessage.content }
      });

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.message,
      };
      
      setMessages(prev => [...prev, modelMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
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

  const useCases = [
    { value: AiUseCase.CONVERSATION, label: 'Giao tiếp JLPT', icon: <MessageSquare size={18} /> },
    { value: AiUseCase.GRAMMAR_EXPLAIN, label: 'Giải thích Ngữ pháp', icon: <BookOpen size={18} /> },
    { value: AiUseCase.WRITING_CHECK, label: 'Sửa lỗi Viết', icon: <PenTool size={18} /> },
    { value: AiUseCase.MOCK_ANALYSIS, label: 'Phân tích Đề thi', icon: <Brain size={18} /> }
  ];

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <aside className="chat-sidebar glass-panel">
        <div className="sidebar-header">
          <h2 className="gradient-text">JLPT AI Tutor</h2>
        </div>
        
        <div className="sidebar-content">
          <h3 className="section-title">Chế độ học (Use Case)</h3>
          <div className="use-case-list">
            {useCases.map((uc) => (
              <button
                key={uc.value}
                className={`use-case-btn ${selectedUseCase === uc.value ? 'active' : ''}`}
                onClick={() => setSelectedUseCase(uc.value)}
              >
                {uc.icon}
                <span>{uc.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        <header className="chat-header glass-panel">
          <div className="mobile-menu-btn"><Menu size={24} /></div>
          <h3>{useCases.find(uc => uc.value === selectedUseCase)?.label}</h3>
          <div className="user-profile">
            <User size={20} />
          </div>
        </header>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state animate-fade-in">
              <Brain size={48} className="empty-icon" />
              <h2>Xin chào! Tôi có thể giúp gì cho bạn hôm nay?</h2>
              <p className="text-secondary">Hãy bắt đầu gửi tin nhắn hoặc chọn một chế độ học ở bên trái.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper ${msg.role} animate-slide-up`}>
                <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'model-bubble glass-panel'}`}>
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
              <div className="message-bubble model-bubble glass-panel typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <form onSubmit={handleSend} className="chat-input-form glass-panel">
            <input
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
            >
              <Send size={20} />
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
