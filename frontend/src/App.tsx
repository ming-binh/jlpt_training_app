import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toast';

// Lovable Japanese Aesthetic Pages
import { NihonHomePage } from './pages/NihonHomePage';
import { NihonVocabPage } from './pages/NihonVocabPage';
import { NihonKanjiPage } from './pages/NihonKanjiPage';
import { NihonGrammarPage } from './pages/NihonGrammarPage';
import { NihonChatPage } from './pages/NihonChatPage';

// Auth Pages & System
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { LessonPage } from './pages/LessonPage';
import { PracticePage } from './pages/PracticePage';
import { ReviewPage } from './pages/ReviewPage';
import { ProgressPage } from './pages/ProgressPage';
import { MainLayout } from './layouts/MainLayout';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* ── Lovable Japanese Journey Pages ─────────────────── */}
        <Route path="/" element={<NihonHomePage />} />
        <Route path="/tu-vung" element={<NihonVocabPage />} />
        <Route path="/kanji" element={<NihonKanjiPage />} />
        <Route path="/ngu-phap" element={<NihonGrammarPage />} />
        <Route path="/chat" element={<NihonChatPage />} />

        {/* ── Auth System ─────────────────────────────────── */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        <Route path="/dashboard" element={
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        } />

        <Route path="/learn" element={<NihonVocabPage />} />

        <Route path="/lesson/:id" element={
          <MainLayout fullscreen>
            <LessonPage />
          </MainLayout>
        } />

        <Route path="/practice" element={
          <MainLayout>
            <PracticePage />
          </MainLayout>
        } />

        <Route path="/review" element={
          <MainLayout>
            <ReviewPage />
          </MainLayout>
        } />

        <Route path="/progress" element={
          <MainLayout>
            <ProgressPage />
          </MainLayout>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
