import { useEffect, useState, useRef } from "react";

/**
 * Shared exam timer hook.
 * Manages a countdown from `initialMinutes`, calls `onTimeUp` when done.
 * Returns display-ready values and a stable `secondsRemaining` for rendering.
 */
export function useExamTimer(initialMinutes: number, onTimeUp: () => void) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialMinutes * 60);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  // Reset when initialMinutes changes (e.g., switching sections)
  useEffect(() => {
    setSecondsRemaining(initialMinutes * 60);
  }, [initialMinutes]);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onTimeUpRef.current();
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isUrgent = secondsRemaining < 300; // < 5 min
  const isCritical = secondsRemaining < 60; // < 1 min
  const displayTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return { secondsRemaining, minutes, seconds, isUrgent, isCritical, displayTime };
}
