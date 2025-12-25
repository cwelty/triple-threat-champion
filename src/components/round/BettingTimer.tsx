import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { playWarningBeep, playUrgentBeep, playTimerEndSound } from '../../utils/sounds';

interface BettingTimerProps {
  duration: number; // seconds
  onComplete: () => void;
  onAddTime: (seconds: number) => void;
  isActive: boolean;
}

export interface BettingTimerRef {
  addTime: (seconds: number) => void;
}

export const BettingTimer = forwardRef<BettingTimerRef, BettingTimerProps>(
  function BettingTimer({ duration, onComplete, onAddTime, isActive }, ref) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const hasPlayedWarning = useRef(false);
  const hasPlayedUrgent = useRef(false);
  const hasCalledComplete = useRef(false);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration);
      hasPlayedWarning.current = false;
      hasPlayedUrgent.current = false;
      hasCalledComplete.current = false;
      return;
    }

    if (timeLeft <= 0) {
      if (!hasCalledComplete.current) {
        playTimerEndSound();
        hasCalledComplete.current = true;
        onComplete();
      }
      return;
    }

    // Play warning sounds at specific times
    if (timeLeft === 30 && !hasPlayedWarning.current) {
      playWarningBeep();
      hasPlayedWarning.current = true;
    }
    if (timeLeft === 10 && !hasPlayedUrgent.current) {
      playUrgentBeep();
      hasPlayedUrgent.current = true;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isActive, onComplete, duration]);

  const handleAddTime = (seconds: number = 30) => {
    setTimeLeft((t) => t + seconds);
    hasCalledComplete.current = false; // Reset so it can trigger again if timer runs out
    onAddTime(seconds);
  };

  useImperativeHandle(ref, () => ({
    addTime: handleAddTime,
  }));

  const minutes = Math.floor(Math.max(0, timeLeft) / 60);
  const seconds = Math.max(0, timeLeft) % 60;
  const isLow = timeLeft <= 10 && timeLeft > 0;
  const isExpired = timeLeft <= 0;

  if (!isActive) return null;

  return (
    <div className={`text-center py-3 rounded-lg ${isExpired ? 'bg-red-900/70' : isLow ? 'bg-red-900/50' : 'bg-gray-800'}`}>
      <div className="text-sm text-gray-400 mb-1">
        {isExpired ? 'Time expired!' : 'Betting closes in'}
      </div>
      <div className={`text-3xl font-mono font-bold ${isExpired ? 'text-red-400' : isLow ? 'text-red-400 animate-pulse' : 'text-white'}`}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
      {isExpired && (
        <button
          onClick={() => handleAddTime(30)}
          className="mt-2 px-4 py-1 bg-[#ffd700] hover:bg-[#ffed4a] text-black text-sm font-bold rounded uppercase tracking-wider transition-colors"
        >
          +30 sec
        </button>
      )}
    </div>
  );
});
