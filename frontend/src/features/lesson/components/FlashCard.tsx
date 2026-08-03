import React, { useState } from 'react';
import type { Exercise } from '@/services/lesson.service';
import type { AnswerState } from '../types';
import './FlashCard.css';

interface FlashCardProps {
  exercise: Exercise;
  answerState: AnswerState;
  onReveal: () => void;
  onKnew: () => void;      // User knew it → correct
  onDidntKnow: () => void; // User didn't → incorrect
}

export const FlashCard: React.FC<FlashCardProps> = ({
  exercise,
  answerState,
  onReveal,
  onKnew,
  onDidntKnow,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const isRevealed = answerState === 'revealed' || answerState === 'correct' || answerState === 'incorrect';

  const handleFlip = () => {
    if (isRevealed) return;
    setIsFlipped(true);
    onReveal();
  };

  return (
    <div className="flashcard-wrapper">
      {/* Card */}
      <div
        className={`flashcard ${isFlipped ? 'flashcard--flipped' : ''}`}
        onClick={!isRevealed ? handleFlip : undefined}
        role={!isRevealed ? 'button' : undefined}
        aria-label={!isRevealed ? 'Tap to reveal answer' : undefined}
        tabIndex={!isRevealed ? 0 : undefined}
        onKeyDown={e => { if (!isRevealed && (e.key === 'Enter' || e.key === ' ')) handleFlip(); }}
      >
        {/* Front */}
        <div className="flashcard-face flashcard-face--front">
          <div className="flashcard-hint">Tap để xem nghĩa</div>
          <div className="flashcard-word">{exercise.question}</div>
          {exercise.questionFurigana && (
            <div className="flashcard-furigana">{exercise.questionFurigana}</div>
          )}
        </div>

        {/* Back */}
        <div className="flashcard-face flashcard-face--back">
          <div className="flashcard-word flashcard-word--back">{exercise.question}</div>
          {exercise.questionFurigana && (
            <div className="flashcard-furigana">{exercise.questionFurigana}</div>
          )}
          <div className="flashcard-divider" />
          <div className="flashcard-meaning">{exercise.questionMeaning || exercise.correctAnswer}</div>
          {exercise.explanation && (
            <div className="flashcard-explanation">{exercise.explanation}</div>
          )}
        </div>
      </div>

      {/* Actions — shown after reveal */}
      {isRevealed && answerState === 'revealed' && (
        <div className="flashcard-actions animate-bounce">
          <button
            id="flashcard-didnt-know-btn"
            className="flashcard-btn flashcard-btn--incorrect"
            onClick={onDidntKnow}
          >
            😕 Chưa nhớ
          </button>
          <button
            id="flashcard-knew-btn"
            className="flashcard-btn flashcard-btn--correct"
            onClick={onKnew}
          >
            ✓ Đã nhớ!
          </button>
        </div>
      )}

      {!isRevealed && (
        <p className="flashcard-tap-hint animate-fade-in">Tap vào thẻ để lật</p>
      )}
    </div>
  );
};
