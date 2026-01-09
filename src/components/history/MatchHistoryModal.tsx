import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import type { Round, Player } from '../../types';
import { GAME_ICONS, GAME_NAMES } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  rounds: Round[];
  players: Player[];
}

export function MatchHistoryModal({
  isOpen,
  onClose,
  rounds,
  players,
}: MatchHistoryModalProps) {
  const [selectedRound, setSelectedRound] = useState<number | 'all'>('all');

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  const completedRounds = rounds.filter((r) => r.isComplete || r.matches.some((m) => m.winnerId));

  const displayRounds = selectedRound === 'all'
    ? completedRounds
    : completedRounds.filter((r) => r.roundNumber === selectedRound);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Match History" size="lg">
      <div className="flex flex-col h-[70vh]">
        {/* Round Filter */}
        <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-gray-700">
          <button
            onClick={() => setSelectedRound('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedRound === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Rounds
          </button>
          {completedRounds.map((round) => (
            <button
              key={round.roundNumber}
              onClick={() => setSelectedRound(round.roundNumber)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedRound === round.roundNumber
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {round.type === 'sync' ? 'Sync' : `R${round.roundNumber}`}
            </button>
          ))}
        </div>

        {/* Match List */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {completedRounds.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No matches played yet.</p>
          ) : (
            displayRounds.map((round) => (
              <div key={round.roundNumber} className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="bg-gray-700 px-2 py-1 rounded text-sm">
                    {round.type === 'sync' ? 'Sync Match' : `Round ${round.roundNumber}`}
                  </span>
                  {round.isComplete && (
                    <span className="text-green-400 text-xs">Complete</span>
                  )}
                </h3>

                <div className="space-y-3">
                  {round.matches.map((match) => {
                    const player1 = getPlayer(match.player1Id);
                    const player2 = getPlayer(match.player2Id);
                    const winner = match.winnerId ? getPlayer(match.winnerId) : null;
                    const isPlayer1Winner = match.winnerId === match.player1Id;
                    const isPlayer2Winner = match.winnerId === match.player2Id;

                    return (
                      <div
                        key={match.id}
                        className="bg-gray-700/50 rounded-lg p-3 flex items-center gap-3"
                      >
                        {/* Game Type */}
                        <div className="flex flex-col items-center w-16">
                          <span className="text-xl">{GAME_ICONS[match.gameType]}</span>
                          <span className="text-xs text-gray-400">
                            {GAME_NAMES[match.gameType]}
                          </span>
                        </div>

                        {/* Player 1 */}
                        <div
                          className={`flex-1 flex items-center gap-2 p-2 rounded ${
                            isPlayer1Winner
                              ? 'bg-green-900/40 border border-green-600'
                              : match.winnerId
                              ? 'opacity-60'
                              : ''
                          }`}
                        >
                          <span className="text-2xl">
                            {player1 ? getAvatarEmoji(player1.avatar) : '?'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-xs">
                              {player1?.nickname ?? '?'}
                            </div>
                            {isPlayer1Winner && (
                              <div className="text-xs text-green-400">
                                {match.isDominant ? 'Dominant Win!' : 'Winner'}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-gray-500 font-bold text-sm">VS</div>

                        {/* Player 2 */}
                        <div
                          className={`flex-1 flex items-center gap-2 p-2 rounded ${
                            isPlayer2Winner
                              ? 'bg-green-900/40 border border-green-600'
                              : match.winnerId
                              ? 'opacity-60'
                              : ''
                          }`}
                        >
                          <span className="text-2xl">
                            {player2 ? getAvatarEmoji(player2.avatar) : '?'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-xs">
                              {player2?.nickname ?? '?'}
                            </div>
                            {isPlayer2Winner && (
                              <div className="text-xs text-green-400">
                                {match.isDominant ? 'Dominant Win!' : 'Winner'}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Points */}
                        {match.winnerId && (
                          <div className="text-right w-12">
                            <span
                              className={`text-lg font-bold ${
                                match.isDominant ? 'text-yellow-400' : 'text-green-400'
                              }`}
                            >
                              +{match.isDominant ? 5 : 3}
                            </span>
                          </div>
                        )}

                        {!match.winnerId && (
                          <div className="text-right w-12">
                            <span className="text-gray-500 text-sm">Pending</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Round Bets Summary */}
                {round.bets.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="text-xs text-gray-400 mb-2">
                      Bets placed: {round.bets.length} |{' '}
                      Correct: {round.bets.filter((b) => b.isCorrect === true).length} |{' '}
                      Wrong: {round.bets.filter((b) => b.isCorrect === false).length}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
