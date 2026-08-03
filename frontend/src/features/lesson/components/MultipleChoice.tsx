import React, { useEffect, useRef } from 'react';
import type { Exercise, ExerciseOption } from '@/services/lesson.service';
import type { AnswerState } from '../types';
import './MultipleChoice.css';

interface MultipleChoiceProps {
  exercise: Exercise;
  selectedAnswer: string | null;
  answerState: AnswerState;
  onSelect: (answer: string) => void;
  onSubmit: (answer: string) => void;
  onNext: () => void;
}

export const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  exercise,
  selectedAnswer,
  answerState,
  onSelect,
  onSubmit,
  onNext,
}) => {
  const isAnswered = answerState === 'correct' || answerState === 'incorrect';
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-focus Continue button after answering for keyboard users
  useEffect(() => {
    if (isAnswered) {
      submitBtnRef.current?.focus();
    }
  }, [isAnswered]);

  const getOptionClass = (option: ExerciseOption) => {
    const isSelected = selectedAnswer === option.id;
    const isCorrect = option.id === exercise.correctAnswer || option.text === exercise.correctAnswer;
    if (!isAnswered) {
      return isSelected ? 'mc-option mc-option--selected' : 'mc-option';
    }
    if (isCorrect) return 'mc-option mc-option--correct animate-correct';
    if (isSelected && !isCorrect) return 'mc-option mc-option--incorrect animate-incorrect animate-shake';
    return 'mc-option mc-option--dimmed';
  };

  return (
    <div className="mc-wrapper">
      {/* Question */}
      <div className="mc-question">
        <div className="mc-question-label">Chọn nghĩa đúng</div>
        <div className="mc-question-word">{exercise.question}</div>
        {exercise.questionFurigana && (
          <div className="mc-question-furigana">{exercise.questionFurigana}</div>
        )}
      </div>

      {/* Options */}
      <div className="mc-options" role="radiogroup" aria-label="Answer options">
        {(exercise.options ?? []).map((option, idx) => (
          <button
            key={option.id}
            id={`mc-option-${idx}`}
            className={`${getOptionClass(option)} animate-pop`}
            onClick={() => {
              if (isAnswered) return;
              onSelect(option.id);
              onSubmit(option.id);
            }}
            disabled={isAnswered}
            aria-pressed={selectedAnswer === option.id}
          >
            <span className="mc-option-letter">{String.fromCharCode(65 + idx)}</span>
            <span className="mc-option-text">{option.text}</span>
            {option.furigana && <span className="mc-option-furigana">{option.furigana}</span>}
          </button>
        ))}
      </div>

      {/* Feedback + Continue */}
      {isAnswered && (
        <div className={`mc-feedback mc-feedback--${answerState} animate-slide-up`}>
          <div className="mc-feedback-icon">{answerState === 'correct' ? '✓' : '✗'}</div>
          <div className="mc-feedback-text">
            {answerState === 'correct'
              ? '正解！ Chính xác!'
              : `Đáp án đúng: ${exercise.options?.find(o => o.id === exercise.correctAnswer)?.text ?? exercise.correctAnswer}`
            }
            {exercise.explanation && (
              <p className="mc-feedback-explanation">{exercise.explanation}</p>
            )}
          </div>
          <button
            ref={submitBtnRef}
            id="mc-continue-btn"
            className="mc-continue-btn"
            onClick={onNext}
          >
            Tiếp tục →
          </button>
        </div>
      )}
    </div>
  );
};
