import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { TopBar } from '../components/TopBar';
import { BottomNav } from '../components/BottomNav';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
  /** If true, shows only children without TopBar/BottomNav (used for immersive lesson screen) */
  fullscreen?: boolean;
  topBarTitle?: string;
  streak?: number;
  xp?: number;
  xpMax?: number;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  fullscreen = false,
  topBarTitle,
  streak = 0,
  xp = 0,
  xpMax = 100,
}) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (fullscreen) {
    return <div className="main-layout-fullscreen">{children}</div>;
  }

  return (
    <div className="main-layout">
      <TopBar
        streak={streak}
        xp={xp}
        xpMax={xpMax}
        title={topBarTitle}
        showBranding={!topBarTitle}
      />
      <main className="main-content" id="main-content">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
