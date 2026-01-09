import React, { useState } from 'react';
import type { Player, GameType } from '../../types';
import { GAME_ICONS, GAME_NAMES } from '../../types';
import { LeaderboardRow } from './LeaderboardRow';

interface LeaderboardProps {
  players: Player[];
  getSortedStandings: () => Player[];
  getGameStandings: (gameType: GameType) => Player[];
  isClosing?: boolean;
  showMedals?: boolean;
}

type ViewType = 'overall' | GameType;

export function Leaderboard({
  players,
  getSortedStandings,
  getGameStandings,
  isClosing = false,
  showMedals = false,
}: LeaderboardProps) {
  const [view, setView] = useState<ViewType>('overall');

  const views: { key: ViewType; label: string; icon?: string }[] = [
    { key: 'overall', label: 'Overall' },
    { key: 'smash', label: 'Smash', icon: GAME_ICONS.smash },
    { key: 'chess', label: 'Chess', icon: GAME_ICONS.chess },
    { key: 'pingPong', label: 'Ping Pong', icon: GAME_ICONS.pingPong },
  ];

  const sortedPlayers = view === 'overall'
    ? getSortedStandings()
    : getGameStandings(view);

  const isGameView = view !== 'overall';
  const gameType = isGameView ? view : null;

  return (
    <div className={`smash-card rounded-lg overflow-hidden ${isClosing ? 'animate-slide-out' : 'animate-slide-in'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#e60012] to-[#b8000e] px-4 py-3">
        <h2 className="text-xl font-bold uppercase tracking-wider text-white"
            style={{ fontFamily: "'Russo One', sans-serif" }}>
          {isGameView ? `${GAME_NAMES[view]} Standings` : 'Standings'}
        </h2>
      </div>

      {/* View Tabs */}
      <div className="flex bg-[#1a1a1a] border-b-2 border-[#e60012]/30">
        {views.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
              view === v.key
                ? 'bg-[#e60012] text-white shadow-[0_0_15px_rgba(230,0,18,0.5)]'
                : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
            }`}
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            {v.icon && <span className="mr-1">{v.icon}</span>}
            {v.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider border-b-2 border-[#e60012]/30"
                style={{ fontFamily: "'Russo One', sans-serif" }}>
              <th className="py-3 px-4 text-[#e60012] w-16">Rank</th>
              <th className="py-3 px-2 text-[#e60012]">Player</th>
              {view === 'overall' ? (
                <>
                  <th className="py-3 px-4 text-center text-[#ffd700]">Pts</th>
                  <th className="py-3 px-4 text-center text-gray-400">W-L</th>
                  <th className="py-3 px-4 text-center text-[#ffd700]" title="Dominant wins">Dom</th>
                  <th className="py-3 px-2 text-center text-gray-400" title="Total matches played">GP</th>
                  <th className="py-3 px-4 text-center">{GAME_ICONS.smash}</th>
                  <th className="py-3 px-4 text-center">{GAME_ICONS.chess}</th>
                  <th className="py-3 px-4 text-center">{GAME_ICONS.pingPong}</th>
                  <th className="py-3 px-4 text-center text-gray-400">BH</th>
                  <th className="py-3 px-4 text-center text-gray-400">Bets</th>
                  <th className="py-3 px-3 text-center text-[#ffd700]" title="Playoff Seed">Seed</th>
                </>
              ) : (
                <>
                  <th className="py-3 px-4 text-center text-green-400">Wins</th>
                  <th className="py-3 px-4 text-center text-red-400">Losses</th>
                  <th className="py-3 px-4 text-center text-[#ffd700]" title="Dominant wins">Dom</th>
                  <th className="py-3 px-4 text-center text-gray-400" title="Win percentage">Win%</th>
                  <th className="py-3 px-2 text-center text-gray-400" title="Games played">GP</th>
                  <th className="py-3 px-4 text-center text-gray-400" title="Game-specific Buchholz">BH</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <LeaderboardRow
                key={player.id}
                player={player}
                rank={index + 1}
                view={view}
                gameType={gameType}
                showMedals={showMedals}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
