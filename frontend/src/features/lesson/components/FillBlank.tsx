import React, { useState, useRef } from 'react';
import type { Exercise } from '../../../services/lesson.service';
import type { AnswerState } from '../types';
import './FillBlank.css';

interface FillBlankProps {
  exercise: Exercise;
  answerState: AnswerState;
  onSubmit: (answer: string) => void;
  onNext: () => void;
}

export const FillBlank: React.FC<FillBlankProps> = ({
  exercise,
  answerState,
  onSubmit,
  onNext,
}) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isAnswered = answerState === 'correct' || answerState === 'incorrect';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isAnswered) return;
    onSubmit(value.trim());
  };

  return (
    <div className="fb-wrapper">
      {/* Question with blank */}
      <div className="fb-question">
        <div className="fb-question-label">Điền vào chỗ trống</div>
        <div className="fb-question-text">{exercise.question}</div>
        {exercise.questionFurigana && (
          <div className="fb-question-furigana">{exercise.questionFurigana}</div>
        )}
      </div>

      {/* Input */}
      <form className="fb-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          id="fill-blank-input"
          className={`fb-input fb-input--${answerState}`}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Nhập câu trả lời..."
          disabled={isAnswered}
          autoComplete="off"
          autoFocus
          aria-label="Answer input"
        />
        {!isAnswered && (
          <button
            type="submit"
            id="fill-blank-submit-btn"
            className="fb-submit-btn"
            disabled={!value.trim()}
          >
            Kiểm tra
          </button>
        )}
      </form>

      {/* Feedback */}
      {isAnswered && (
        <div className={`fb-feedback fb-feedback--${answerState} animate-slide-up`}>
          <div className="fb-feedback-header">
            <span className="fb-feedback-icon">{answerState === 'correct' ? '✓' : '✗'}</span>
            <span className="fb-feedback-title">
              {answerState === 'correct' ? '正解！ Chính xác!' : 'Chưa đúng'}
            </span>
          </div>
          {answerState === 'incorrect' && (
            <div className="fb-correct-answer">
              Đáp án đúng: <strong>{exercise.correctAnswer}</strong>
            </div>
          )}
          {exercise.explanation && (
            <p className="fb-explanation">{exercise.explanation}</p>
          )}
          <button
            id="fill-blank-continue-btn"
            className="fb-continue-btn"
            onClick={onNext}
          >
            Tiếp tục →
          </button>
        </div>
      )}
    </div>
  );
};
