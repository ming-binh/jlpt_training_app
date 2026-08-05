import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toast';

// Japanese Journey Feature Pages
import { NihonHomePage } from './features/dashboard/pages/NihonHomePage';
import { NihonProfilePage } from './features/dashboard/pages/NihonProfilePage';
import { NihonLessonListPage } from './features/lesson/pages/NihonLessonListPage';
import { NihonVocabPage } from './features/vocab/pages/NihonVocabPage';
import { NihonKanjiPage } from './features/kanji/pages/NihonKanjiPage';
import { NihonGrammarPage } from './features/grammar/pages/NihonGrammarPage';
import { NihonChatPage } from './features/ai-chat/pages/NihonChatPage';

// Auth Feature Pages
import { AuthPage } from './features/auth/pages/AuthPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage';
import { AuthCallbackPage } from './features/auth/pages/AuthCallbackPage';

// Learning & Dashboard Feature Pages
import { LessonPage } from './features/lesson/pages/LessonPage';
import { ReviewPage } from './features/lesson/pages/ReviewPage';
import { PracticePage } from './features/lesson/pages/PracticePage';
import { QuizSessionPage } from './features/lesson/pages/QuizSessionPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* ── Japanese Journey Primary Pages ─────────────────── */}
        <Route path="/" element={<NihonHomePage />} />
        <Route path="/profile" element={<NihonProfilePage />} />
        <Route path="/bai-hoc" element={<NihonLessonListPage />} />
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

        {/* ── Dashboard & Learning Modules ────────────────── */}
        {/* Dashboard is now the top section of "/" for logged-in users */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

        <Route path="/learn" element={<NihonLessonListPage />} />

        <Route path="/lesson/:id" element={<LessonPage />} />

        <Route path="/review" element={<ReviewPage />} />
        <Route path="/review/session" element={<QuizSessionPage mode="review" />} />

        <Route path="/practice" element={<PracticePage />} />
        <Route path="/quiz" element={<PracticePage />} />
        <Route path="/practice/session" element={<QuizSessionPage mode="practice" />} />

        {/* /progress redirects to /profile where progress is embedded */}
        <Route path="/progress" element={<Navigate to="/profile" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
