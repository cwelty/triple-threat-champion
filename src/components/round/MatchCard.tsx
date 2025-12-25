import React from 'react';
import type { Match, Player } from '../../types';
import { GAME_ICONS, GAME_NAMES } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';
import { Button } from '../ui/Button';

interface MatchCardProps {
  match: Match;
  player1: Player | undefined;
  player2: Player | undefined;
  onSelectWinner?: (match: Match) => void;
  showResult?: boolean;
}

const gameColors = {
  smash: { bg: 'from-red-900/50 to-red-950/50', border: 'border-red-500', text: 'text-red-400' },
  chess: { bg: 'from-purple-900/50 to-purple-950/50', border: 'border-purple-500', text: 'text-purple-400' },
  pingPong: { bg: 'from-green-900/50 to-green-950/50', border: 'border-green-500', text: 'text-green-400' },
};

export function MatchCard({
  match,
  player1,
  player2,
  onSelectWinner,
  showResult = false,
}: MatchCardProps) {
  const isComplete = match.winnerId !== null;
  const colors = gameColors[match.gameType];
  const isPlayer1Winner = isComplete && match.winnerId === match.player1Id;
  const isPlayer2Winner = isComplete && match.winnerId === match.player2Id;

  return (
    <div className={`
      group relative smash-card rounded-lg overflow-hidden
      ${isComplete ? 'border-green-500' : ''}
    `}>
      {/* Edit button - pencil in corner, only on hover when complete */}
      {onSelectWinner && isComplete && (
        <button
          onClick={() => onSelectWinner(match)}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-gray-700/80 hover:bg-gray-600
                     flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Edit Result"
        >
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}

      {/* Game Type Header */}
      <div className={`bg-gradient-to-r ${colors.bg} px-4 py-2 border-b border-[#333]`}>
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">{GAME_ICONS[match.gameType]}</span>
          <span className={`font-bold uppercase tracking-wider ${colors.text}`}
                style={{ fontFamily: "'Russo One', sans-serif" }}>
            {GAME_NAMES[match.gameType]}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-center gap-3">
          {/* Player 1 */}
          <div className="flex flex-col items-center">
            <div
              className={`
                relative w-32 text-center p-3 rounded-lg transition-all duration-300
                ${isPlayer1Winner
                  ? 'bg-gradient-to-b from-green-800/60 to-green-900/60 ring-2 ring-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                  : isComplete
                    ? 'bg-[#1a1a1a] opacity-50'
                    : 'bg-[#1a1a1a]'
                }
              `}
            >
              <div className={`text-5xl mb-2 ${isPlayer1Winner ? 'animate-bounce-in' : ''}`}>
                {player1 ? getAvatarEmoji(player1.avatar) : '?'}
              </div>
              <div className="font-bold text-white truncate tracking-wide text-sm"
                   style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                {player1?.nickname ?? 'Unknown'}
              </div>
              {isPlayer1Winner && (
                <div className="mt-1 text-xs text-green-400 font-bold uppercase">Winner!</div>
              )}
            </div>
          </div>

          {/* VS */}
          <div className="smash-vs text-3xl">VS</div>

          {/* Player 2 */}
          <div className="flex flex-col items-center">
            <div
              className={`
                relative w-32 text-center p-3 rounded-lg transition-all duration-300
                ${isPlayer2Winner
                  ? 'bg-gradient-to-b from-green-800/60 to-green-900/60 ring-2 ring-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                  : isComplete
                    ? 'bg-[#1a1a1a] opacity-50'
                    : 'bg-[#1a1a1a]'
                }
              `}
            >
              <div className={`text-5xl mb-2 ${isPlayer2Winner ? 'animate-bounce-in' : ''}`}>
                {player2 ? getAvatarEmoji(player2.avatar) : '?'}
              </div>
              <div className="font-bold text-white truncate tracking-wide text-sm"
                   style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                {player2?.nickname ?? 'Unknown'}
              </div>
              {isPlayer2Winner && (
                <div className="mt-1 text-xs text-green-400 font-bold uppercase">Winner!</div>
              )}
            </div>
          </div>
        </div>

        {/* Enter Result button for incomplete matches */}
        {onSelectWinner && !isComplete && (
          <div className="mt-6">
            <Button
              onClick={() => onSelectWinner(match)}
              variant="primary"
              className="w-full"
            >
              Enter Result
            </Button>
          </div>
        )}

        {/* Dominant indicator for complete matches */}
        {isComplete && match.isDominant && (
          <div className="mt-4 text-center">
            <span
              className="inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider
                         bg-[#ffd700]/20 text-[#ffd700] border border-[#ffd700]/50"
              style={{ fontFamily: "'Russo One', sans-serif" }}
            >
              Dominant!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
