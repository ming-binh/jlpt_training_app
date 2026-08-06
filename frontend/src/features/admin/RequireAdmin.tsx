import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'denied'>('loading');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setStatus('denied');
      return;
    }
    userService.getCurrentUser()
      .then((profile) => setStatus(profile.role === 'ADMIN' ? 'ok' : 'denied'))
      .catch(() => setStatus('denied'));
  }, []);

  if (status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Đang xác thực quyền truy cập...
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
