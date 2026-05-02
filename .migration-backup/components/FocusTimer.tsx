'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface FocusTimerProps {
  initialMinutes?: number;
  onComplete: () => void;
  onTick?: (remainingSeconds: number) => void;
  accentColor?: string;
}

export default function FocusTimer({
  initialMinutes = 20,
  onComplete,
  onTick,
  accentColor = 'var(--color-ember-cinder)',
}: FocusTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tick = useCallback(() => {
    setRemainingSeconds((prev) => {
      if (prev <= 1) {
        setIsRunning(false);
        setIsComplete(true);
        return 0;
      }
      return prev - 1;
    });
  }, []);

  useEffect(() => {
    if (isRunning && !isComplete) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isComplete, tick]);

  useEffect(() => {
    onTick?.(remainingSeconds);
  }, [remainingSeconds, onTick]);

  useEffect(() => {
    if (isComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  const togglePause = () => setIsRunning(!isRunning);

  const addTime = (minutes: number) => {
    const additionalSeconds = minutes * 60;
    setTotalSeconds((prev) => prev + additionalSeconds);
    setRemainingSeconds((prev) => prev + additionalSeconds);
    if (isComplete) {
      setIsComplete(false);
      setIsRunning(true);
    }
  };

  const endEarly = () => {
    setIsRunning(false);
    setIsComplete(true);
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progress = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 1;

  // SVG circle progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer circle */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 280 280">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="var(--color-ember-panel)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
            style={{ filter: `drop-shadow(0 0 8px ${accentColor})` }}
          />
        </svg>

        {/* Time display */}
        <div className="text-center z-10">
          <div className="text-5xl font-light tracking-wider">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-sm text-ember-text-muted mt-2">
            {isComplete ? 'Session complete!' : isRunning ? 'Focusing...' : 'Paused'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isComplete && (
          <>
            <button
              onClick={togglePause}
              className="px-6 py-2.5 rounded-xl bg-ember-panel hover:bg-ember-panel-light text-sm font-medium transition-colors"
            >
              {isRunning ? '⏸ Pause' : '▶ Resume'}
            </button>
            <button
              onClick={endEarly}
              className="px-6 py-2.5 rounded-xl bg-ember-panel hover:bg-ember-panel-light text-sm font-medium transition-colors text-ember-text-muted"
            >
              End Early
            </button>
          </>
        )}
      </div>

      {/* Add time buttons */}
      {!isComplete && (
        <div className="flex gap-2">
          {[5, 10, 20].map((mins) => (
            <button
              key={mins}
              onClick={() => addTime(mins)}
              className="px-3 py-1.5 rounded-lg bg-ember-bg-light text-xs text-ember-text-muted hover:text-ember-text transition-colors"
            >
              +{mins}min
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
