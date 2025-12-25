import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import type { Round, Player, Match, GameType } from '../../types';
import { GAME_ICONS, GAME_NAMES } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';

interface HeadToHeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  rounds: Round[];
  players: Player[];
  initialPlayer1Id?: string;
  initialPlayer2Id?: string;
}

interface HeadToHeadRecord {
  player1Wins: number;
  player2Wins: number;
  matches: Match[];
}

export function HeadToHeadModal({
  isOpen,
  onClose,
  rounds,
  players,
  initialPlayer1Id,
  initialPlayer2Id,
}: HeadToHeadModalProps) {
  const [player1Id, setPlayer1Id] = useState<string>(initialPlayer1Id ?? '');
  const [player2Id, setPlayer2Id] = useState<string>(initialPlayer2Id ?? '');

  const getPlayer = (id: string) => players.find((p) => p.id === id);
  const player1 = getPlayer(player1Id);
  const player2 = getPlayer(player2Id);

  // Find all matches between the two players
  const headToHead = useMemo((): HeadToHeadRecord | null => {
    if (!player1Id || !player2Id) return null;

    const allMatches = rounds.flatMap((r) => r.matches);
    const matchesBetween = allMatches.filter(
      (m) =>
        (m.player1Id === player1Id && m.player2Id === player2Id) ||
        (m.player1Id === player2Id && m.player2Id === player1Id)
    );

    const completedMatches = matchesBetween.filter((m) => m.winnerId);

    const player1Wins = completedMatches.filter(
      (m) => m.winnerId === player1Id
    ).length;
    const player2Wins = completedMatches.filter(
      (m) => m.winnerId === player2Id
    ).length;

    return {
      player1Wins,
      player2Wins,
      matches: matchesBetween,
    };
  }, [player1Id, player2Id, rounds]);

  // Get record by game type
  const getGameRecord = (gameType: GameType): { p1: number; p2: number } => {
    if (!headToHead) return { p1: 0, p2: 0 };
    const gameMatches = headToHead.matches.filter(
      (m) => m.gameType === gameType && m.winnerId
    );
    return {
      p1: gameMatches.filter((m) => m.winnerId === player1Id).length,
      p2: gameMatches.filter((m) => m.winnerId === player2Id).length,
    };
  };

  const smashRecord = getGameRecord('smash');
  const chessRecord = getGameRecord('chess');
  const pingPongRecord = getGameRecord('pingPong');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Head-to-Head History" size="lg">
      <div className="space-y-6">
        {/* Player Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Player 1</label>
            <select
              value={player1Id}
              onChange={(e) => setPlayer1Id(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select player...</option>
              {players
                .filter((p) => p.id !== player2Id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {getAvatarEmoji(p.avatar)} {p.nickname}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Player 2</label>
            <select
              value={player2Id}
              onChange={(e) => setPlayer2Id(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select player...</option>
              {players
                .filter((p) => p.id !== player1Id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {getAvatarEmoji(p.avatar)} {p.nickname}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {player1 && player2 && headToHead && (
          <>
            {/* Overall Record */}
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-4xl mb-2">{getAvatarEmoji(player1.avatar)}</div>
                  <div className="font-semibold text-white">{player1.nickname}</div>
                  <div className="text-3xl font-bold text-white mt-2">
                    {headToHead.player1Wins}
                  </div>
                </div>

                <div className="text-center px-4">
                  <div className="text-gray-500 text-lg font-bold">VS</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {headToHead.matches.filter((m) => m.winnerId).length} matches
                  </div>
                </div>

                <div className="text-center flex-1">
                  <div className="text-4xl mb-2">{getAvatarEmoji(player2.avatar)}</div>
                  <div className="font-semibold text-white">{player2.nickname}</div>
                  <div className="text-3xl font-bold text-white mt-2">
                    {headToHead.player2Wins}
                  </div>
                </div>
              </div>
            </div>

            {/* By Game Type */}
            <div className="grid grid-cols-3 gap-3">
              {(['smash', 'chess', 'pingPong'] as GameType[]).map((gameType) => {
                const record =
                  gameType === 'smash'
                    ? smashRecord
                    : gameType === 'chess'
                    ? chessRecord
                    : pingPongRecord;
                const hasPlayed = record.p1 > 0 || record.p2 > 0;

                return (
                  <div
                    key={gameType}
                    className={`bg-gray-700 rounded-lg p-3 text-center ${
                      !hasPlayed ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="text-2xl mb-1">{GAME_ICONS[gameType]}</div>
                    <div className="text-xs text-gray-400 mb-2">{GAME_NAMES[gameType]}</div>
                    {hasPlayed ? (
                      <div className="font-bold text-white">
                        {record.p1} - {record.p2}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">No matches</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Match History */}
            <div>
              <h4 className="font-semibold text-white mb-3">Match History</h4>
              {headToHead.matches.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  These players haven't faced each other yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {headToHead.matches.map((match) => {
                    const isPlayer1Winner = match.winnerId === player1Id;
                    const isPlayer2Winner = match.winnerId === player2Id;
                    const winner = isPlayer1Winner ? player1 : isPlayer2Winner ? player2 : null;
                    const round = rounds.find((r) =>
                      r.matches.some((m) => m.id === match.id)
                    );

                    return (
                      <div
                        key={match.id}
                        className="bg-gray-700/50 rounded-lg px-3 py-2 flex items-center gap-2"
                      >
                        {/* Game icon */}
                        <div className="text-lg">{GAME_ICONS[match.gameType]}</div>

                        {/* Round info */}
                        <div className="text-xs text-gray-500 w-16">
                          {round?.type === 'sync' ? 'Sync' : `R${match.roundNumber}`}
                        </div>

                        {/* Players */}
                        <div className="flex-1 flex items-center gap-1 text-sm">
                          <span className="text-gray-300">{player1.nickname}</span>
                          <span className="text-gray-600 mx-1">vs</span>
                          <span className="text-gray-300">{player2.nickname}</span>
                        </div>

                        {/* Result */}
                        <div className="text-right text-sm">
                          {winner ? (
                            <span className={`font-bold ${match.isDominant ? 'text-yellow-400' : 'text-green-400'}`}>
                              {match.isDominant && '⚡'} {winner.nickname} {match.isDominant && '⚡'}
                            </span>
                          ) : (
                            <span className="text-gray-500">Pending</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {(!player1 || !player2) && (
          <div className="text-center py-8 text-gray-400">
            Select two players to view their head-to-head history
          </div>
        )}
      </div>
    </Modal>
  );
}
