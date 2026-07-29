import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  if (!authService.isAuthenticated()) {
    // Save current path to redirect back after login if needed later, but for now just redirect
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="main-layout">
      {/* Sidebar could go here */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};
