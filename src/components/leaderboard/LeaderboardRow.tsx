import React from 'react';
import type { Player, GameType } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';

interface LeaderboardRowProps {
  player: Player;
  rank: number;
  view: 'overall' | GameType;
  gameType: GameType | null;
}

export function LeaderboardRow({ player, rank, view, gameType }: LeaderboardRowProps) {
  const isTopFour = rank <= 4;

  const getRankClass = () => {
    switch (rank) {
      case 1: return 'rank-badge rank-1';
      case 2: return 'rank-badge rank-2';
      case 3: return 'rank-badge rank-3';
      case 4: return 'rank-badge rank-4';
      default: return 'rank-badge rank-other';
    }
  };

  // Get game-specific data
  const getGameRecord = (game: GameType) => player[`${game}Record`];
  const getGameMatchesPlayed = (game: GameType) => player[`${game}MatchesPlayed`];
  const getGameBuchholz = (game: GameType) => player[`${game}Buchholz`];
  const getGameDominantWins = (game: GameType) => {
    if (game === 'smash') return player.smashDominantWins ?? 0;
    if (game === 'chess') return player.chessDominantWins ?? 0;
    return player.pingPongDominantWins ?? 0;
  };
  const isGameChampion = (game: GameType) => {
    if (game === 'smash') return player.isSmashChampion;
    if (game === 'chess') return player.isChessChampion;
    return player.isPingPongChampion;
  };

  // Calculate win rate for a game
  const getWinRate = (game: GameType) => {
    const record = getGameRecord(game);
    const total = record.wins + record.losses;
    if (total === 0) return 0;
    return Math.round((record.wins / total) * 100);
  };

  // Overall view
  if (view === 'overall') {
    return (
      <tr className={`
        border-b border-[#2a2a2a] transition-all duration-200 hover:bg-[#e60012]/10
        ${isTopFour ? 'bg-gradient-to-r from-[#ffd700]/5 to-transparent' : ''}
        ${rank === 1 ? 'bg-gradient-to-r from-[#ffd700]/10 to-transparent' : ''}
      `}>
        <td className="py-3 px-4">
          <span className={getRankClass()}>
            {rank}
          </span>
        </td>
        <td className="py-3 px-2">
          <div className="flex items-center gap-3">
            <div className={`
              text-3xl p-1 rounded-lg relative
              ${rank === 1 ? 'bg-[#ffd700]/20 shadow-[0_0_10px_rgba(255,215,0,0.3)]' : ''}
              ${rank <= 4 ? 'transform hover:scale-110 transition-transform' : ''}
            `}>
              {getAvatarEmoji(player.avatar)}
              {rank === 1 && <span className="absolute -top-1 -right-1 text-sm">👑</span>}
              {rank === 2 && <span className="absolute -top-1 -right-1 text-sm">🥈</span>}
              {rank === 3 && <span className="absolute -top-1 -right-1 text-sm">🥉</span>}
            </div>
            <div className="text-left">
              <div className="font-bold text-white text-sm tracking-wide"
                   style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                {player.nickname}
              </div>
              <div className="text-xs text-gray-500">{player.name}</div>
            </div>
          </div>
        </td>
        <td className="py-3 px-4 text-center">
          <span className="points-display">{player.totalPoints}</span>
        </td>
        <td className="py-3 px-4 text-center text-gray-300 font-semibold">
          <span className="text-green-400">{player.matchRecord.wins}</span>
          <span className="text-gray-500">-</span>
          <span className="text-red-400">{player.matchRecord.losses}</span>
        </td>
        <td className="py-3 px-4 text-center">
          <span className={`font-bold ${player.dominantWins > 0 ? 'text-[#ffd700]' : 'text-gray-500'}`}>
            {player.dominantWins}
          </span>
        </td>
        <td
          className="py-3 px-2 text-center"
          title={`Smash: ${player.smashMatchesPlayed}/3, Chess: ${player.chessMatchesPlayed}/3, Ping-Pong: ${player.pingPongMatchesPlayed}/3`}
        >
          <span className={`font-bold ${player.matchesPlayed >= 9 ? 'text-green-400' : 'text-[#e60012]'}`}>
            {player.matchesPlayed}
          </span>
          <span className="text-gray-500 text-xs">/9</span>
        </td>
        <td className="py-3 px-4 text-center text-sm">
          <div className="text-gray-300 font-semibold">
            {player.smashRecord.wins}-{player.smashRecord.losses}
          </div>
          <div className={`text-xs ${player.smashMatchesPlayed >= 3 ? 'text-green-500' : 'text-[#e60012]'}`}>
            {player.smashMatchesPlayed}/3
          </div>
        </td>
        <td className="py-3 px-4 text-center text-sm">
          <div className="text-gray-300 font-semibold">
            {player.chessRecord.wins}-{player.chessRecord.losses}
          </div>
          <div className={`text-xs ${player.chessMatchesPlayed >= 3 ? 'text-green-500' : 'text-[#e60012]'}`}>
            {player.chessMatchesPlayed}/3
          </div>
        </td>
        <td className="py-3 px-4 text-center text-sm">
          <div className="text-gray-300 font-semibold">
            {player.pingPongRecord.wins}-{player.pingPongRecord.losses}
          </div>
          <div className={`text-xs ${player.pingPongMatchesPlayed >= 3 ? 'text-green-500' : 'text-[#e60012]'}`}>
            {player.pingPongMatchesPlayed}/3
          </div>
        </td>
        <td className="py-3 px-4 text-center text-gray-400 text-sm font-medium">
          {player.buchholzScore}
        </td>
        <td className="py-3 px-4 text-center">
          <span className={`font-bold ${player.bettingProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {player.bettingProfit > 0 ? '+' : ''}{player.bettingProfit}
          </span>
        </td>
      </tr>
    );
  }

  // Game-specific view
  const record = getGameRecord(gameType!);
  const matchesPlayed = getGameMatchesPlayed(gameType!);
  const buchholz = getGameBuchholz(gameType!);
  const dominantWins = getGameDominantWins(gameType!);
  const winRate = getWinRate(gameType!);
  const isChampion = isGameChampion(gameType!);

  return (
    <tr className={`
      border-b border-[#2a2a2a] transition-all duration-200 hover:bg-[#e60012]/10
      ${rank === 1 ? 'bg-gradient-to-r from-[#ffd700]/10 to-transparent' : ''}
      ${isChampion ? 'bg-gradient-to-r from-[#ffd700]/20 to-transparent' : ''}
    `}>
      <td className="py-3 px-4">
        <span className={getRankClass()}>
          {rank}
        </span>
      </td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-3">
          <div className={`
            text-3xl p-1 rounded-lg relative
            ${rank === 1 ? 'bg-[#ffd700]/20 shadow-[0_0_10px_rgba(255,215,0,0.3)]' : ''}
          `}>
            {getAvatarEmoji(player.avatar)}
            {isChampion && (
              <span className="absolute -top-1 -right-1 text-sm">🏆</span>
            )}
          </div>
          <div className="text-left">
            <div className="font-bold text-white text-sm tracking-wide"
                 style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              {player.nickname}
            </div>
            <div className="text-xs text-gray-500">{player.name}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="text-2xl font-bold text-green-400">{record.wins}</span>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="text-2xl font-bold text-red-400">{record.losses}</span>
      </td>
      <td className="py-3 px-4 text-center">
        <span className={`text-xl font-bold ${dominantWins > 0 ? 'text-[#ffd700]' : 'text-gray-500'}`}>
          {dominantWins}
        </span>
      </td>
      <td className="py-3 px-4 text-center">
        <span className={`font-bold ${winRate >= 50 ? 'text-green-400' : 'text-gray-400'}`}>
          {winRate}%
        </span>
      </td>
      <td className="py-3 px-2 text-center">
        <span className={`font-bold ${matchesPlayed >= 3 ? 'text-green-400' : 'text-[#e60012]'}`}>
          {matchesPlayed}
        </span>
        <span className="text-gray-500 text-xs">/3</span>
      </td>
      <td className="py-3 px-4 text-center text-gray-400 font-medium">
        {buchholz}
      </td>
    </tr>
  );
}
