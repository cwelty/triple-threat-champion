import React, { useState, useEffect, useRef } from 'react';
import type { Player } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';
import { Button } from '../ui/Button';

interface BestBettorRevealProps {
  players: Player[];
  onReveal: () => void;
  onContinue: () => void;
  bestBettorId: string | null;
}

export function BestBettorReveal({
  players,
  onReveal,
  onContinue,
  bestBettorId,
}: BestBettorRevealProps) {
  const [stage, setStage] = useState<'intro' | 'drumroll' | 'reveal' | 'complete'>('intro');
  const [countdown, setCountdown] = useState(3);
  const hasRevealedRef = useRef(false);

  // Get betting leaderboard
  const bettingLeaderboard = [...players]
    .filter((p) => p.betsPlaced > 0)
    .sort((a, b) => {
      if (b.bettingProfit !== a.bettingProfit) return b.bettingProfit - a.bettingProfit;
      return b.betsWon - a.betsWon;
    })
    .slice(0, 5);

  const bestBettor = bestBettorId ? players.find((p) => p.id === bestBettorId) : null;
  const topBettor = bettingLeaderboard[0];
  const hasBestBettor = topBettor && topBettor.bettingProfit > 0;

  // Countdown effect
  useEffect(() => {
    if (stage === 'drumroll' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (stage === 'drumroll' && countdown === 0 && !hasRevealedRef.current) {
      hasRevealedRef.current = true;
      onReveal();
      setStage('reveal');
    }
  }, [stage, countdown, onReveal]);

  // Intro screen
  if (stage === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="text-center">
          <div className="text-8xl mb-6">💰</div>
          <h2 className="text-4xl font-bold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: "'Russo One', sans-serif" }}>
            Best Bettor Award
          </h2>
          <p className="text-xl text-gray-400 mb-2">Who made the smartest predictions?</p>
          <p className="text-lg text-[#ffd700]">+3 bonus points to the winner!</p>
        </div>

        <div className="smash-card rounded-xl p-8 text-center border-[#ffd700]"
             style={{ boxShadow: '0 0 30px rgba(255,215,0,0.2)' }}>
          <div className="text-6xl mb-4">🎰</div>
          <p className="text-gray-400 text-lg">
            {hasBestBettor
              ? `${bettingLeaderboard.length} players placed bets this tournament`
              : 'No one finished with positive betting profit'}
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={() => {
          if (hasBestBettor) {
            setStage('drumroll');
          } else {
            onReveal();
            setStage('reveal');
          }
        }}>
          {hasBestBettor ? 'Reveal Best Bettor' : 'Continue'}
        </Button>
      </div>
    );
  }

  // Drumroll countdown
  if (stage === 'drumroll') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="text-center">
          <div className="text-8xl mb-8" style={{ animation: 'smash-shake 0.1s ease-in-out infinite' }}>
            🥁
          </div>
          <h2 className="text-4xl font-bold text-[#ffd700] uppercase tracking-wider mb-4"
              style={{ fontFamily: "'Russo One', sans-serif" }}>
            The Best Bettor is...
          </h2>
          <div className="text-9xl font-bold text-white"
               style={{ fontFamily: "'Russo One', sans-serif", textShadow: '0 0 50px rgba(255,215,0,0.5)' }}>
            {countdown}
          </div>
        </div>
      </div>
    );
  }

  // Reveal
  if (stage === 'reveal') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        {bestBettor ? (
          <>
            <div className="text-center animate-bounce-in">
              <div className="text-8xl mb-4">💰</div>
              <h2 className="text-3xl font-bold text-[#ffd700] uppercase tracking-wider mb-2"
                  style={{ fontFamily: "'Russo One', sans-serif" }}>
                Best Bettor
              </h2>
            </div>

            <div className="smash-card rounded-2xl p-8 text-center border-[#ffd700] animate-zoom-in"
                 style={{ boxShadow: '0 0 50px rgba(255,215,0,0.4)', animation: 'smash-pulse 2s ease-in-out infinite' }}>
              <div className="text-9xl mb-4">{getAvatarEmoji(bestBettor.avatar)}</div>
              <div className="text-4xl font-bold text-white mb-2 tracking-wider"
                   style={{ fontFamily: "'Russo One', sans-serif" }}>
                {bestBettor.nickname}
              </div>
              <div className="text-gray-400 mb-4">{bestBettor.name}</div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">+{bestBettor.bettingProfit}</div>
                  <div className="text-xs text-gray-500 uppercase">Profit</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">{bestBettor.betsWon}</div>
                  <div className="text-xs text-gray-500 uppercase">Wins</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">{bestBettor.betsPlaced}</div>
                  <div className="text-xs text-gray-500 uppercase">Bets</div>
                </div>
              </div>

              <div className="inline-block px-6 py-2 bg-[#ffd700] text-black font-bold rounded-full text-xl"
                   style={{ fontFamily: "'Russo One', sans-serif" }}>
                +3 POINTS
              </div>
            </div>
          </>
        ) : (
          <div className="text-center animate-bounce-in">
            <div className="text-8xl mb-4 opacity-50">💸</div>
            <h2 className="text-3xl font-bold text-gray-400 uppercase tracking-wider mb-4"
                style={{ fontFamily: "'Russo One', sans-serif" }}>
              No Best Bettor
            </h2>
            <p className="text-gray-500 text-lg">
              No one finished with positive betting profit.
            </p>
            <p className="text-gray-600 mt-2">
              Better luck next time!
            </p>
          </div>
        )}

        <Button variant="success" size="lg" onClick={onContinue}>
          View Final Results
        </Button>
      </div>
    );
  }

  return null;
}
