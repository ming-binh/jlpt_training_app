import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Lovable Japanese Aesthetic Pages
import { NihonHomePage } from './pages/NihonHomePage';
import { NihonVocabPage } from './pages/NihonVocabPage';
import { NihonKanjiPage } from './pages/NihonKanjiPage';
import { NihonGrammarPage } from './pages/NihonGrammarPage';
import { NihonChatPage } from './pages/NihonChatPage';

// System Pages
import { LoginPage } from './pages/LoginPage';
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
      <Routes>
        {/* ── Lovable Japanese Journey Pages ─────────────────── */}
        <Route path="/" element={<NihonHomePage />} />
        <Route path="/tu-vung" element={<NihonVocabPage />} />
        <Route path="/kanji" element={<NihonKanjiPage />} />
        <Route path="/ngu-phap" element={<NihonGrammarPage />} />
        <Route path="/chat" element={<NihonChatPage />} />

        {/* ── Auth & Practice System ───────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
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
