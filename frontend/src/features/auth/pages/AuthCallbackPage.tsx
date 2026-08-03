import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/Card';
import './AuthPage.css';

export const AuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xác thực email...');
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase will automatically parse the hash/code in the URL
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setStatus('error');
        setMessage(error.message || 'Xác thực thất bại hoặc liên kết đã hết hạn.');
      } else if (data.session) {
        setStatus('success');
        setMessage('Xác thực Email thành công! Tài khoản của bạn đã được kích hoạt.');
        // Redirect to chat after 2.5 seconds
        setTimeout(() => {
          navigate('/chat');
        }, 2500);
      } else {
        // Fallback check via auth state listener
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' || session) {
            setStatus('success');
            setMessage('Xác thực Email thành công! Tài khoản của bạn đã được kích hoạt.');
            setTimeout(() => {
              navigate('/chat');
            }, 2500);
          }
        });
        return () => authListener.subscription.unsubscribe();
      }
    });
  }, [navigate]);

  return (
    <div className="auth-container animate-fade-in">
      <Card className="auth-card animate-slide-up" style={{ textAlign: 'center' }}>
        <div className="auth-logo">
          <div className="auth-logo-mark">J</div>
          <span className="auth-logo-name"><span>JLPT</span> AI Tutor</span>
        </div>

        {status === 'loading' && (
          <div style={{ padding: '24px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 16px', width: 24, height: 24 }} />
            <p style={{ color: 'var(--color-ink-muted)', fontSize: 14 }}>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ padding: '16px 0' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--color-primary-subtle)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-method-get)',
              margin: '0 auto 16px',
              boxShadow: '0 0 20px rgba(52, 211, 153, 0.2)'
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: 18, margin: '0 0 8px', color: 'var(--color-ink)' }}>
              Xác thực thành công! <Sparkles size={16} style={{ color: 'var(--color-accent)', display: 'inline' }} />
            </h2>
            <p style={{ color: 'var(--color-ink-muted)', fontSize: 13, lineHeight: 1.6 }}>
              {message}
            </p>
            <p style={{ color: 'var(--color-ink-subdued)', fontSize: 12, marginTop: 16 }}>
              Tự động chuyển hướng về phòng học trong vài giây...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ padding: '16px 0' }}>
            <div className="auth-error" style={{ justifyContent: 'center' }}>
              {message}
            </div>
            <button
              className="btn btn-primary btn-md"
              onClick={() => navigate('/login')}
              style={{ marginTop: 16 }}
            >
              Quay lại đăng nhập
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};
