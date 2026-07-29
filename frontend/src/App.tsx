import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        
        {/* Protected Routes */}
        <Route path="/chat" element={
          <MainLayout>
            <ChatPage />
          </MainLayout>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
