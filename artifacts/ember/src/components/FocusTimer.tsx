import { useState, useEffect, useCallback, useRef } from 'react';
import { PauseIcon, PlayIcon, PlusIcon } from './Icons';

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
  accentColor = 'var(--ember-accent)',
}: FocusTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => { onTick?.(remainingSeconds); }, [remainingSeconds, onTick]);
  useEffect(() => { if (isComplete) onComplete(); }, [isComplete, onComplete]);

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

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-72 h-72 flex items-center justify-center">
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 280 280">
          <circle cx="140" cy="140" r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth="6" />
          <circle
            cx="140" cy="140" r={radius}
            fill="none" stroke={accentColor} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
            style={{ filter: `drop-shadow(0 0 8px ${accentColor})` }}
          />
        </svg>

        <div className="text-center z-10">
          <div className="font-display text-[64px] leading-none text-ember-text">
            {String(minutes).padStart(2, '0')}<span className="opacity-50">:</span>{String(seconds).padStart(2, '0')}
          </div>
          <div className="font-mono-caps text-[10px] text-ember-text-muted mt-3">
            {isComplete ? 'session complete' : isRunning ? 'tending' : 'paused'}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {!isComplete && (
          <>
            <button onClick={togglePause} className="cta-quiet px-5 py-2 font-mono-caps text-[11px] inline-flex items-center gap-1.5">
              {isRunning ? <><PauseIcon size={12} /> Pause</> : <><PlayIcon size={12} /> Resume</>}
            </button>
            <button onClick={endEarly} className="cta-quiet px-5 py-2 font-mono-caps text-[11px] text-ember-text-muted">
              End Early
            </button>
          </>
        )}
      </div>

      {!isComplete && (
        <div className="flex gap-2">
          {[5, 10, 20].map((mins) => (
            <button
              key={mins}
              onClick={() => addTime(mins)}
              className="px-3 py-1.5 font-mono-caps text-[10px] text-ember-text-muted hover:text-ember-text transition-colors inline-flex items-center gap-1"
              style={{ border: '1px solid var(--border-subtle)', borderRadius: '4px' }}
            >
              <PlusIcon size={10} />{mins} min
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
