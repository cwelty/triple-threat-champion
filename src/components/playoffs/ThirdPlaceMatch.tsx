import React, { useState } from 'react';
import type { Player, PlayoffBracket, GameType, Bet } from '../../types';
import { GAME_ICONS, GAME_NAMES } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';
import { Button } from '../ui/Button';
import { GamePicker } from './GamePicker';
import { ResultEntryModal } from '../round/ResultEntryModal';

interface ThirdPlaceMatchProps {
  bracket: PlayoffBracket;
  players: Player[];
  onSelectGame: (gameType: GameType) => void;
  onRecordResult: (winnerId: string) => void;
  onSkip: () => void;
  playoffBets: Bet[];
  onPlacePlayoffBet: (bettorId: string, matchKey: string, predictedWinnerId: string) => void;
  onRemovePlayoffBet: (bettorId: string, matchKey: string) => void;
}

export function ThirdPlaceMatch({
  bracket,
  players,
  onSelectGame,
  onRecordResult,
  onSkip,
  playoffBets,
  onPlacePlayoffBet,
  onRemovePlayoffBet,
}: ThirdPlaceMatchProps) {
  const [showResultModal, setShowResultModal] = useState(false);
  const [showBettingPanel, setShowBettingPanel] = useState(false);

  const getPlayer = (id: string | null) => id ? players.find((p) => p.id === id) : undefined;

  const player1 = getPlayer(bracket.thirdPlace.player1Id);
  const player2 = getPlayer(bracket.thirdPlace.player2Id);

  // Get player seeds
  const getPlayerSeed = (playerId: string | null): number => {
    if (playerId === bracket.semifinal1.player1Id) return 1;
    if (playerId === bracket.semifinal1.player2Id) return 4;
    if (playerId === bracket.semifinal2.player1Id) return 2;
    if (playerId === bracket.semifinal2.player2Id) return 3;
    return 0;
  };

  const player1Seed = getPlayerSeed(bracket.thirdPlace.player1Id);
  const player2Seed = getPlayerSeed(bracket.thirdPlace.player2Id);

  // Get spectators (players not in 3rd place match - the finalists + other non-playoff players)
  const thirdPlacePlayerIds = new Set([bracket.thirdPlace.player1Id, bracket.thirdPlace.player2Id].filter(Boolean));
  const spectators = players.filter((p) => !thirdPlacePlayerIds.has(p.id));

  // Check if betting is available (game type selected but no winner yet)
  const bettingAvailable = bracket.thirdPlace.gameType && !bracket.thirdPlace.winnerId;

  if (!player1 || !player2) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center animate-slide-in">
        <div className="text-5xl mb-4">🥉</div>
        <div className="inline-block">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wider"
              style={{ fontFamily: "'Russo One', sans-serif" }}>
            <span className="text-amber-600">3rd Place</span>
            <span className="text-white"> Match</span>
          </h2>
          <div className="h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mt-2" />
        </div>
        <p className="text-gray-400 mt-4 text-lg">Optional match to determine 3rd and 4th place</p>
      </div>

      {/* Match Card */}
      <div className="smash-card rounded-xl overflow-hidden max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-3">
          <h3 className="text-xl font-bold text-white uppercase tracking-wider text-center"
              style={{ fontFamily: "'Russo One', sans-serif" }}>
            Battle for Bronze
          </h3>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Player 1 */}
            <div className={`flex-1 text-center p-4 rounded-xl transition-all duration-500 ${
              bracket.thirdPlace.winnerId === bracket.thirdPlace.player1Id
                ? 'bg-gradient-to-b from-green-800/60 to-green-900/60 ring-2 ring-green-400 shadow-[0_0_30px_rgba(34,197,94,0.4)] scale-105'
                : bracket.thirdPlace.winnerId
                ? 'bg-[#1a1a1a] opacity-40 scale-95'
                : 'bg-[#1a1a1a]'
            }`}>
              <div className="text-5xl mb-2">
                {getAvatarEmoji(player1.avatar)}
              </div>
              <div className="font-bold text-white text-lg uppercase tracking-wide"
                   style={{ fontFamily: "'Russo One', sans-serif" }}>
                {player1.nickname}
              </div>
              <div className="text-sm text-gray-400 font-bold mt-1">#{player1Seed} SEED</div>
              {bracket.thirdPlace.winnerId === bracket.thirdPlace.player1Id && (
                <div className="mt-2 text-green-400 font-bold uppercase animate-pulse">3rd Place!</div>
              )}
            </div>

            {/* VS */}
            <div className="smash-vs text-3xl" style={{ animation: !bracket.thirdPlace.winnerId ? 'smash-pulse 2s ease-in-out infinite' : 'none' }}>
              VS
            </div>

            {/* Player 2 */}
            <div className={`flex-1 text-center p-4 rounded-xl transition-all duration-500 ${
              bracket.thirdPlace.winnerId === bracket.thirdPlace.player2Id
                ? 'bg-gradient-to-b from-green-800/60 to-green-900/60 ring-2 ring-green-400 shadow-[0_0_30px_rgba(34,197,94,0.4)] scale-105'
                : bracket.thirdPlace.winnerId
                ? 'bg-[#1a1a1a] opacity-40 scale-95'
                : 'bg-[#1a1a1a]'
            }`}>
              <div className="text-5xl mb-2">
                {getAvatarEmoji(player2.avatar)}
              </div>
              <div className="font-bold text-white text-lg uppercase tracking-wide"
                   style={{ fontFamily: "'Russo One', sans-serif" }}>
                {player2.nickname}
              </div>
              <div className="text-sm text-gray-400 font-bold mt-1">#{player2Seed} SEED</div>
              {bracket.thirdPlace.winnerId === bracket.thirdPlace.player2Id && (
                <div className="mt-2 text-green-400 font-bold uppercase animate-pulse">3rd Place!</div>
              )}
            </div>
          </div>

          {/* Game Selection / Match Status */}
          {!bracket.thirdPlace.gameType && (
            <div className="space-y-6">
              <GamePicker
                onSelect={onSelectGame}
                pickerName="Players"
              />

              <div className="border-t border-gray-700 pt-6 text-center">
                <p className="text-gray-500 text-sm mb-3">Don't want to play?</p>
                <Button variant="secondary" onClick={onSkip}>
                  Skip 3rd Place Match
                </Button>
                <p className="text-gray-600 text-xs mt-2">
                  (3rd/4th will be determined by total points)
                </p>
              </div>
            </div>
          )}

          {bracket.thirdPlace.gameType && !bracket.thirdPlace.winnerId && (
            <div className="text-center space-y-4">
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-amber-900/50 to-amber-800/50 rounded-xl border-2 border-amber-500">
                <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Playing</div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl">{GAME_ICONS[bracket.thirdPlace.gameType]}</span>
                  <span className="text-2xl font-bold text-white uppercase"
                        style={{ fontFamily: "'Russo One', sans-serif" }}>
                    {GAME_NAMES[bracket.thirdPlace.gameType]}
                  </span>
                </div>
              </div>
              <Button variant="primary" size="lg" className="w-full" onClick={() => setShowResultModal(true)}>
                Enter Result
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Spectator Betting Panel */}
      {spectators.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => bettingAvailable && setShowBettingPanel(!showBettingPanel)}
            disabled={!bettingAvailable}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
              bettingAvailable
                ? 'bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-purple-500 hover:border-purple-400 cursor-pointer'
                : 'bg-gray-800/50 border-gray-600 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{bettingAvailable ? '🎰' : '⏳'}</span>
              <div className="text-left">
                <div className={`text-lg font-bold uppercase tracking-wide ${bettingAvailable ? 'text-white' : 'text-gray-400'}`}
                     style={{ fontFamily: "'Russo One', sans-serif" }}>
                  Spectator Betting
                </div>
                <div className={`text-sm ${bettingAvailable ? 'text-purple-300' : 'text-gray-500'}`}>
                  {bettingAvailable
                    ? `${spectators.length} spectator${spectators.length !== 1 ? 's' : ''} can place bets`
                    : 'Waiting for game type selection...'}
                </div>
              </div>
            </div>
            {bettingAvailable && (
              <span className={`text-2xl transition-transform ${showBettingPanel ? 'rotate-180' : ''}`}>
                ▼
              </span>
            )}
          </button>

          {showBettingPanel && bettingAvailable && (
            <div className="mt-4 smash-card rounded-xl p-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{GAME_ICONS[bracket.thirdPlace.gameType!]}</span>
                  <h4 className="font-bold text-white uppercase tracking-wide">3rd Place Match</h4>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-3">
                  <span>{player1.nickname}</span>
                  <span className="text-gray-500">vs</span>
                  <span>{player2.nickname}</span>
                </div>
                <div className="space-y-2">
                  {spectators.map((spectator) => {
                    const existingBet = playoffBets.find(
                      (b) => b.bettorId === spectator.id && b.matchId === '3rd'
                    );
                    return (
                      <div key={spectator.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getAvatarEmoji(spectator.avatar)}</span>
                          <span className="text-white text-sm">{spectator.nickname}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (existingBet?.predictedWinnerId === bracket.thirdPlace.player1Id) {
                                onRemovePlayoffBet(spectator.id, '3rd');
                              } else {
                                onPlacePlayoffBet(spectator.id, '3rd', bracket.thirdPlace.player1Id!);
                              }
                            }}
                            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                              existingBet?.predictedWinnerId === bracket.thirdPlace.player1Id
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            {player1.nickname}
                          </button>
                          <button
                            onClick={() => {
                              if (existingBet?.predictedWinnerId === bracket.thirdPlace.player2Id) {
                                onRemovePlayoffBet(spectator.id, '3rd');
                              } else {
                                onPlacePlayoffBet(spectator.id, '3rd', bracket.thirdPlace.player2Id!);
                              }
                            }}
                            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                              existingBet?.predictedWinnerId === bracket.thirdPlace.player2Id
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            {player2.nickname}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skip Option (always visible at bottom if game not selected) */}
      {!bracket.thirdPlace.gameType && (
        <div className="text-center text-gray-500 text-sm">
          <p>The winner gets bragging rights for 3rd place!</p>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && bracket.thirdPlace.gameType && (
        <ResultEntryModal
          isOpen={true}
          onClose={() => setShowResultModal(false)}
          match={{
            id: '3rd-place',
            roundNumber: 18,
            gameType: bracket.thirdPlace.gameType,
            player1Id: bracket.thirdPlace.player1Id!,
            player2Id: bracket.thirdPlace.player2Id!,
            winnerId: null,
            isDominant: false,
            isSyncRound: false,
            isPlayoff: true,
            playoffRound: 'thirdPlace',
            underservedPlayerId: null,
            volunteerId: null,
          }}
          player1={player1}
          player2={player2}
          onSubmit={(_, winnerId) => {
            onRecordResult(winnerId);
            setShowResultModal(false);
          }}
        />
      )}
    </div>
  );
}
