import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, UserPlus, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/auth.service';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import './AuthPage.css';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await authService.login({ email, password });
        navigate('/chat');
      } else {
        const result = await authService.register({ email, password, username });
        if (result.needsEmailConfirmation) {
          setSuccessMessage(
            '🎉 Đăng ký thành công! Thư xác thực đã được gửi đến email của bạn. Vui lòng mở Gmail và bấm vào liên kết để kích hoạt tài khoản.'
          );
          setIsLogin(true);
        } else {
          navigate('/chat');
        }
      }
    } catch (err: any) {
      setError(err.message || err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <Card className="auth-card animate-slide-up">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-mark">J</div>
          <span className="auth-logo-name"><span>JLPT</span> AI Tutor</span>
        </div>

        <div className="auth-header">
          <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
          <p>
            {isLogin
              ? 'Sign in to continue your JLPT journey'
              : 'Join us to master JLPT effectively'}
          </p>
        </div>

        {successMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            background: 'var(--color-primary-subtle)',
            color: 'var(--color-ink)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            fontSize: '13px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            lineHeight: 1.5
          }}>
            <CheckCircle2 size={18} style={{ color: 'var(--color-method-get)', flexShrink: 0, marginTop: 2 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {error && <div className="auth-error animate-fade-in">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<UserPlus size={16} />}
              required
            />
          )}

          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
          />

          <Button type="submit" isLoading={isLoading} className="auth-submit-btn">
            {isLogin ? <><LogIn size={16} /> Sign In</> : <><UserPlus size={16} /> Sign Up</>}
          </Button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            type="button"
            className="btn-link"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMessage('');
            }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </Card>
    </div>
  );
};
