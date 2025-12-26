import React from 'react';
import type { Player } from '../../types';
import { GAME_ICONS } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';
import { Button } from '../ui/Button';
import { Leaderboard } from '../leaderboard/Leaderboard';

interface FinalResultsProps {
  players: Player[];
  tripleThreatchampion: Player | undefined;
  smashChampion: Player | undefined;
  chessChampion: Player | undefined;
  pingPongChampion: Player | undefined;
  bestGambler: Player | undefined;
  getSortedStandings: () => Player[];
  getGameStandings: (gameType: 'smash' | 'chess' | 'pingPong') => Player[];
  onReset: () => void;
}

export function FinalResults({
  players,
  tripleThreatchampion,
  smashChampion,
  chessChampion,
  pingPongChampion,
  bestGambler,
  getSortedStandings,
  getGameStandings,
  onReset,
}: FinalResultsProps) {
  const sortedStandings = getSortedStandings();
  const lastPlace = sortedStandings[sortedStandings.length - 1];

  return (
    <div className="space-y-8">
      {/* Triple Threat Champion */}
      {tripleThreatchampion && (
        <div className="champion-vortex bg-gradient-to-b from-yellow-600/20 via-yellow-900/30 to-gray-900 rounded-2xl p-10 text-center border-2 border-yellow-500/50">
          <div className="relative z-10">
            <div className="text-5xl mb-4" style={{ animation: 'crown-float 2s ease-in-out infinite' }}>👑</div>
            <h2 className="text-4xl font-bold text-yellow-400 mb-6 uppercase tracking-wider"
                style={{ fontFamily: "'Russo One', sans-serif", textShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }}>
              Triple Threat Champion
            </h2>
            <div className="text-9xl mb-4 drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]">
              {getAvatarEmoji(tripleThreatchampion.avatar)}
            </div>
            <div className="text-4xl font-bold text-white mb-2"
                 style={{ fontFamily: "'Russo One', sans-serif", textShadow: '0 0 20px rgba(255, 255, 255, 0.3)' }}>
              {tripleThreatchampion.nickname}
            </div>
            <div className="text-xl text-gray-300">{tripleThreatchampion.name}</div>
            <div className="mt-6 inline-block px-6 py-3 bg-yellow-500/20 border border-yellow-400/50 rounded-xl">
              <span className="text-3xl font-bold text-yellow-400"
                    style={{ fontFamily: "'Russo One', sans-serif" }}>
                {tripleThreatchampion.totalPoints} Points
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Awards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Smash Champion */}
        <div className="relative overflow-hidden bg-gradient-to-b from-red-900/50 to-gray-900 rounded-xl p-5 text-center border-2 border-red-500/50 hover:border-red-400 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.2),transparent_70%)]" />
          <div className="relative z-10">
            <div className="text-3xl mb-2 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">{GAME_ICONS.smash}</div>
            <div className="text-xs font-bold text-red-400 mb-3 uppercase tracking-wider">Smash Champion</div>
            {smashChampion && (
              <>
                <div className="text-5xl mb-2 drop-shadow-lg">{getAvatarEmoji(smashChampion.avatar)}</div>
                <div className="font-bold text-white text-lg" style={{ fontFamily: "'Russo One', sans-serif" }}>
                  {smashChampion.nickname}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chess Champion */}
        <div className="relative overflow-hidden bg-gradient-to-b from-purple-900/50 to-gray-900 rounded-xl p-5 text-center border-2 border-purple-500/50 hover:border-purple-400 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.2),transparent_70%)]" />
          <div className="relative z-10">
            <div className="text-3xl mb-2 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">{GAME_ICONS.chess}</div>
            <div className="text-xs font-bold text-purple-400 mb-3 uppercase tracking-wider">Chess Champion</div>
            {chessChampion && (
              <>
                <div className="text-5xl mb-2 drop-shadow-lg">{getAvatarEmoji(chessChampion.avatar)}</div>
                <div className="font-bold text-white text-lg" style={{ fontFamily: "'Russo One', sans-serif" }}>
                  {chessChampion.nickname}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Ping Pong Champion */}
        <div className="relative overflow-hidden bg-gradient-to-b from-green-900/50 to-gray-900 rounded-xl p-5 text-center border-2 border-green-500/50 hover:border-green-400 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.2),transparent_70%)]" />
          <div className="relative z-10">
            <div className="text-3xl mb-2 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">{GAME_ICONS.pingPong}</div>
            <div className="text-xs font-bold text-green-400 mb-3 uppercase tracking-wider">Ping Pong Champion</div>
            {pingPongChampion && (
              <>
                <div className="text-5xl mb-2 drop-shadow-lg">{getAvatarEmoji(pingPongChampion.avatar)}</div>
                <div className="font-bold text-white text-lg" style={{ fontFamily: "'Russo One', sans-serif" }}>
                  {pingPongChampion.nickname}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Best Bettor */}
        <div className="relative overflow-hidden bg-gradient-to-b from-yellow-900/50 to-gray-900 rounded-xl p-5 text-center border-2 border-yellow-500/50 hover:border-yellow-400 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.2),transparent_70%)]" />
          <div className="relative z-10">
            <div className="text-3xl mb-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">🎰</div>
            <div className="text-xs font-bold text-yellow-400 mb-3 uppercase tracking-wider">Best Gambler</div>
            {bestGambler && (
              <>
                <div className="text-5xl mb-2 drop-shadow-lg">{getAvatarEmoji(bestGambler.avatar)}</div>
                <div className="font-bold text-white text-lg" style={{ fontFamily: "'Russo One', sans-serif" }}>
                  {bestGambler.nickname}
                </div>
                <div className="mt-1 inline-block px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded text-sm font-bold text-green-400">
                  +{bestGambler.bettingProfit} profit
                </div>
              </>
            )}
          </div>
        </div>

        {/* Last Place */}
        <div className="relative overflow-hidden bg-gradient-to-b from-gray-800 to-gray-950 rounded-xl p-5 text-center border-2 border-gray-600/50 hover:border-gray-500 transition-all hover:scale-105 group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(100,100,100,0.15),transparent_70%)]" />
          <div className="relative z-10">
            <div className="text-3xl mb-2 group-hover:animate-bounce">💀</div>
            <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Last Place</div>
            {lastPlace && (
              <>
                <div className="text-5xl mb-2 grayscale group-hover:grayscale-0 transition-all">{getAvatarEmoji(lastPlace.avatar)}</div>
                <div className="font-bold text-gray-400 text-lg" style={{ fontFamily: "'Russo One', sans-serif" }}>
                  {lastPlace.nickname}
                </div>
                <div className="mt-1 text-xs text-gray-600 italic">Better luck next time</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Final Standings */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Final Standings</h3>
        <Leaderboard
          players={players}
          getSortedStandings={getSortedStandings}
          getGameStandings={getGameStandings}
        />
      </div>

      {/* Reset Button */}
      <div className="text-center pt-4">
        <Button variant="danger" size="lg" onClick={onReset}>
          Start New Tournament
        </Button>
      </div>
    </div>
  );
}
