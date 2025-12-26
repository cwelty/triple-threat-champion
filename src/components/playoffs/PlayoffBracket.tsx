import React, { useState } from 'react';
import type { Player, PlayoffBracket as BracketType, GameType, Bet } from '../../types';
import { GAME_ICONS, GAME_NAMES } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';
import { Button } from '../ui/Button';
import { GamePicker } from './GamePicker';
import { ResultEntryModal } from '../round/ResultEntryModal';

interface PlayoffBracketProps {
  bracket: BracketType;
  players: Player[];
  phase: 'semifinals' | 'finals';
  onSelectGame: (semifinalNumber: 1 | 2, gameType: GameType) => void;
  onRecordSemifinalResult: (semifinalNumber: 1 | 2, winnerId: string) => void;
  onSelectFinalsGame: (gameNumber: number, gameType: GameType) => void;
  onRecordFinalsResult: (winnerId: string, isDominant: boolean) => void;
  playoffBets: Bet[];
  onPlacePlayoffBet: (bettorId: string, matchKey: string, predictedWinnerId: string) => void;
  onRemovePlayoffBet: (bettorId: string, matchKey: string) => void;
}

export function PlayoffBracket({
  bracket,
  players,
  phase,
  onSelectGame,
  onRecordSemifinalResult,
  onSelectFinalsGame,
  onRecordFinalsResult,
  playoffBets,
  onPlacePlayoffBet,
  onRemovePlayoffBet,
}: PlayoffBracketProps) {
  const [activeSemifinal, setActiveSemifinal] = useState<1 | 2 | null>(null);
  const [finalsResultModal, setFinalsResultModal] = useState(false);
  const [showBettingPanel, setShowBettingPanel] = useState(false);

  const getPlayer = (id: string | null) => id ? players.find((p) => p.id === id) : undefined;

  // Get playoff player IDs
  const playoffPlayerIds = new Set([
    bracket.semifinal1.player1Id,
    bracket.semifinal1.player2Id,
    bracket.semifinal2.player1Id,
    bracket.semifinal2.player2Id,
  ].filter(Boolean));

  // Spectators are players not in playoffs
  const spectators = players.filter((p) => !playoffPlayerIds.has(p.id));

  const semifinal1Player1 = getPlayer(bracket.semifinal1.player1Id);
  const semifinal1Player2 = getPlayer(bracket.semifinal1.player2Id);
  const semifinal2Player1 = getPlayer(bracket.semifinal2.player1Id);
  const semifinal2Player2 = getPlayer(bracket.semifinal2.player2Id);
  const finalsPlayer1 = getPlayer(bracket.finals.player1Id);
  const finalsPlayer2 = getPlayer(bracket.finals.player2Id);

  const currentFinalsGame = bracket.finals.games.length + 1;
  const needsFinalsGamePick = phase === 'finals' &&
    bracket.finals.player1Id &&
    bracket.finals.player2Id &&
    !bracket.finals.games.some((g) => g.winnerId === null);

  const usedFinalsGames = bracket.finals.games.map((g) => g.gameType);

  const getDisabledGames = (): GameType[] => {
    if (usedFinalsGames.length >= 3) return [];
    return usedFinalsGames;
  };

  const getFinalsPickerName = () => {
    if (currentFinalsGame === 1) {
      return finalsPlayer1?.nickname ?? 'Higher Seed';
    } else if (currentFinalsGame === 2) {
      return finalsPlayer2?.nickname ?? 'Lower Seed';
    } else {
      return 'Random Draw';
    }
  };

  // Get the remaining game for sudden death (the one not played yet)
  const getRemainingGame = (): GameType => {
    const allGames: GameType[] = ['smash', 'chess', 'pingPong'];
    return allGames.find((g) => !usedFinalsGames.includes(g))!;
  };

  // Check for finals winner (used for display purposes)
  const finalsWinner = bracket.finals.player1Wins >= 2
    ? finalsPlayer1
    : bracket.finals.player2Wins >= 2
    ? finalsPlayer2
    : null;

  return (
    <div className="space-y-8">
      {/* SEMIFINALS */}
      {phase === 'semifinals' && (
        <>
          {/* Epic Header */}
          <div className="text-center animate-slide-in">
            <div className="inline-block">
              <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wider"
                  style={{ fontFamily: "'Russo One', sans-serif" }}>
                <span className="text-[#e60012]">Semi</span>
                <span className="text-white">finals</span>
              </h2>
              <div className="h-1 bg-gradient-to-r from-transparent via-[#e60012] to-transparent mt-2" />
            </div>
            <p className="text-gray-400 mt-4 text-lg">Top 4 battle for a spot in the Finals!</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Semifinal 1 */}
            <div className="smash-card rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#e60012] to-[#b8000e] px-4 py-3">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider text-center"
                    style={{ fontFamily: "'Russo One', sans-serif" }}>
                  Semifinal 1
                </h3>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-4 mb-6">
                  {/* Player 1 */}
                  <div className={`flex-1 text-center p-4 rounded-xl transition-all duration-500 ${
                    bracket.semifinal1.winnerId === bracket.semifinal1.player1Id
                      ? 'bg-gradient-to-b from-green-800/60 to-green-900/60 ring-2 ring-green-400 shadow-[0_0_30px_rgba(34,197,94,0.4)] scale-105'
                      : bracket.semifinal1.winnerId
                      ? 'bg-[#1a1a1a] opacity-40 scale-95'
                      : 'bg-[#1a1a1a]'
                  }`}>
                    <div className="text-5xl mb-2">
                      {semifinal1Player1 ? getAvatarEmoji(semifinal1Player1.avatar) : '?'}
                    </div>
                    <div className="font-bold text-white text-lg uppercase tracking-wide"
                         style={{ fontFamily: "'Russo One', sans-serif" }}>
                      {semifinal1Player1?.nickname ?? '?'}
                    </div>
                    <div className="text-sm text-gray-400 font-bold mt-1">#1 SEED</div>
                    {bracket.semifinal1.winnerId === bracket.semifinal1.player1Id && (
                      <div className="mt-2 text-green-400 font-bold uppercase animate-pulse">Winner!</div>
                    )}
                  </div>

                  {/* VS */}
                  <div className="smash-vs text-3xl" style={{ animation: !bracket.semifinal1.winnerId ? 'smash-pulse 2s ease-in-out infinite' : 'none' }}>
                    VS
                  </div>

                  {/* Player 2 */}
                  <div className={`flex-1 text-center p-4 rounded-xl transition-all duration-500 ${
                    bracket.semifinal1.winnerId === bracket.semifinal1.player2Id
                      ? 'bg-gradient-to-b from-green-800/60 to-green-900/60 ring-2 ring-green-400 shadow-[0_0_30px_rgba(34,197,94,0.4)] scale-105'
                      : bracket.semifinal1.winnerId
                      ? 'bg-[#1a1a1a] opacity-40 scale-95'
                      : 'bg-[#1a1a1a]'
                  }`}>
                    <div className="text-5xl mb-2">
                      {semifinal1Player2 ? getAvatarEmoji(semifinal1Player2.avatar) : '?'}
                    </div>
                    <div className="font-bold text-white text-lg uppercase tracking-wide"
                         style={{ fontFamily: "'Russo One', sans-serif" }}>
                      {semifinal1Player2?.nickname ?? '?'}
                    </div>
                    <div className="text-sm text-gray-400 font-bold mt-1">#4 SEED</div>
                    {bracket.semifinal1.winnerId === bracket.semifinal1.player2Id && (
                      <div className="mt-2 text-green-400 font-bold uppercase animate-pulse">Winner!</div>
                    )}
                  </div>
                </div>

                {/* Game Selection / Status */}
                {!bracket.semifinal1.gameType && !bracket.semifinal1.winnerId && (
                  <GamePicker
                    onSelect={(game) => onSelectGame(1, game)}
                    pickerName={semifinal1Player1?.nickname ?? '#1 Seed'}
                  />
                )}

                {bracket.semifinal1.gameType && !bracket.semifinal1.winnerId && (
                  <div className="text-center space-y-4">
                    <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-900/50 to-purple-800/50 rounded-xl border-2 border-purple-500">
                      <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Playing</div>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-4xl">{GAME_ICONS[bracket.semifinal1.gameType]}</span>
                        <span className="text-2xl font-bold text-white uppercase"
                              style={{ fontFamily: "'Russo One', sans-serif" }}>
                          {GAME_NAMES[bracket.semifinal1.gameType]}
                        </span>
                      </div>
                    </div>
                    <Button variant="primary" size="lg" className="w-full" onClick={() => setActiveSemifinal(1)}>
                      Enter Result
                    </Button>
                  </div>
                )}

                {bracket.semifinal1.winnerId && (
                  <div className="text-center">
                    <div className="inline-block px-4 py-2 bg-green-900/30 border border-green-500 rounded-full">
                      <span className="text-green-400 font-bold">
                        {GAME_ICONS[bracket.semifinal1.gameType!]} {getPlayer(bracket.semifinal1.winnerId)?.nickname} advances!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Semifinal 2 */}
            <div className="smash-card rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#e60012] to-[#b8000e] px-4 py-3">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider text-center"
                    style={{ fontFamily: "'Russo One', sans-serif" }}>
                  Semifinal 2
                </h3>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-4 mb-6">
                  {/* Player 1 */}
                  <div className={`flex-1 text-center p-4 rounded-xl transition-all duration-500 ${
                    bracket.semifinal2.winnerId === bracket.semifinal2.player1Id
                      ? 'bg-gradient-to-b from-green-800/60 to-green-900/60 ring-2 ring-green-400 shadow-[0_0_30px_rgba(34,197,94,0.4)] scale-105'
                      : bracket.semifinal2.winnerId
                      ? 'bg-[#1a1a1a] opacity-40 scale-95'
                      : 'bg-[#1a1a1a]'
                  }`}>
                    <div className="text-5xl mb-2">
                      {semifinal2Player1 ? getAvatarEmoji(semifinal2Player1.avatar) : '?'}
                    </div>
                    <div className="font-bold text-white text-lg uppercase tracking-wide"
                         style={{ fontFamily: "'Russo One', sans-serif" }}>
                      {semifinal2Player1?.nickname ?? '?'}
                    </div>
                    <div className="text-sm text-gray-400 font-bold mt-1">#2 SEED</div>
                    {bracket.semifinal2.winnerId === bracket.semifinal2.player1Id && (
                      <div className="mt-2 text-green-400 font-bold uppercase animate-pulse">Winner!</div>
                    )}
                  </div>

                  {/* VS */}
                  <div className="smash-vs text-3xl" style={{ animation: !bracket.semifinal2.winnerId ? 'smash-pulse 2s ease-in-out infinite' : 'none' }}>
                    VS
                  </div>

                  {/* Player 2 */}
                  <div className={`flex-1 text-center p-4 rounded-xl transition-all duration-500 ${
                    bracket.semifinal2.winnerId === bracket.semifinal2.player2Id
                      ? 'bg-gradient-to-b from-green-800/60 to-green-900/60 ring-2 ring-green-400 shadow-[0_0_30px_rgba(34,197,94,0.4)] scale-105'
                      : bracket.semifinal2.winnerId
                      ? 'bg-[#1a1a1a] opacity-40 scale-95'
                      : 'bg-[#1a1a1a]'
                  }`}>
                    <div className="text-5xl mb-2">
                      {semifinal2Player2 ? getAvatarEmoji(semifinal2Player2.avatar) : '?'}
                    </div>
                    <div className="font-bold text-white text-lg uppercase tracking-wide"
                         style={{ fontFamily: "'Russo One', sans-serif" }}>
                      {semifinal2Player2?.nickname ?? '?'}
                    </div>
                    <div className="text-sm text-gray-400 font-bold mt-1">#3 SEED</div>
                    {bracket.semifinal2.winnerId === bracket.semifinal2.player2Id && (
                      <div className="mt-2 text-green-400 font-bold uppercase animate-pulse">Winner!</div>
                    )}
                  </div>
                </div>

                {/* Game Selection / Status */}
                {!bracket.semifinal2.gameType && !bracket.semifinal2.winnerId && (
                  <GamePicker
                    onSelect={(game) => onSelectGame(2, game)}
                    pickerName={semifinal2Player1?.nickname ?? '#2 Seed'}
                  />
                )}

                {bracket.semifinal2.gameType && !bracket.semifinal2.winnerId && (
                  <div className="text-center space-y-4">
                    <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-900/50 to-purple-800/50 rounded-xl border-2 border-purple-500">
                      <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Playing</div>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-4xl">{GAME_ICONS[bracket.semifinal2.gameType]}</span>
                        <span className="text-2xl font-bold text-white uppercase"
                              style={{ fontFamily: "'Russo One', sans-serif" }}>
                          {GAME_NAMES[bracket.semifinal2.gameType]}
                        </span>
                      </div>
                    </div>
                    <Button variant="primary" size="lg" className="w-full" onClick={() => setActiveSemifinal(2)}>
                      Enter Result
                    </Button>
                  </div>
                )}

                {bracket.semifinal2.winnerId && (
                  <div className="text-center">
                    <div className="inline-block px-4 py-2 bg-green-900/30 border border-green-500 rounded-full">
                      <span className="text-green-400 font-bold">
                        {GAME_ICONS[bracket.semifinal2.gameType!]} {getPlayer(bracket.semifinal2.winnerId)?.nickname} advances!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* FINALS */}
      {phase === 'finals' && finalsPlayer1 && finalsPlayer2 && (
        <>
          {/* Epic Finals Header */}
          <div className="text-center animate-slide-in">
            <div className="text-6xl mb-4">🏆</div>
            <div className="inline-block">
              <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-wider"
                  style={{ fontFamily: "'Russo One', sans-serif", textShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
                <span className="text-[#ffd700]">Grand</span>
                <span className="text-white"> Finals</span>
              </h2>
              <div className="h-1 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent mt-2" />
            </div>
            <p className="text-[#ffd700] mt-4 text-xl font-bold uppercase tracking-wider"
               style={{ fontFamily: "'Russo One', sans-serif" }}>
              Best of 3
            </p>
          </div>

          {/* Score Display */}
          {(() => {
            // Determine seeds for finalists
            const getPlayerSeed = (playerId: string | null): number => {
              if (playerId === bracket.semifinal1.player1Id) return 1;
              if (playerId === bracket.semifinal1.player2Id) return 4;
              if (playerId === bracket.semifinal2.player1Id) return 2;
              if (playerId === bracket.semifinal2.player2Id) return 3;
              return 0;
            };
            const player1Seed = getPlayerSeed(bracket.finals.player1Id);
            const player2Seed = getPlayerSeed(bracket.finals.player2Id);

            return (
          <div className="smash-card rounded-2xl p-8 border-[#ffd700]"
               style={{ boxShadow: '0 0 50px rgba(255,215,0,0.2)' }}>
            <div className="flex items-center justify-center gap-8 md:gap-16">
              {/* Player 1 */}
              <div className={`text-center transition-all duration-500 ${
                finalsWinner === finalsPlayer1 ? 'scale-110' : finalsWinner ? 'opacity-40 scale-90' : ''
              }`}>
                <div className={`text-7xl md:text-8xl mb-4 ${finalsWinner === finalsPlayer1 ? 'animate-bounce' : ''}`}>
                  {getAvatarEmoji(finalsPlayer1.avatar)}
                </div>
                <div className="text-xl md:text-2xl font-bold text-white tracking-wider mb-1"
                     style={{ fontFamily: "'Russo One', sans-serif" }}>
                  {finalsPlayer1.nickname}
                </div>
                <div className="text-sm text-gray-400 font-bold mb-2">#{player1Seed} SEED</div>
                <div className={`text-6xl md:text-8xl font-bold transition-all duration-300 ${
                  bracket.finals.player1Wins >= 2 ? 'text-[#ffd700]' : 'text-white'
                }`} style={{ fontFamily: "'Russo One', sans-serif", textShadow: bracket.finals.player1Wins >= 2 ? '0 0 30px rgba(255,215,0,0.8)' : 'none' }}>
                  {bracket.finals.player1Wins}
                </div>
              </div>

              {/* Divider */}
              <div className="text-4xl md:text-6xl font-bold text-gray-500">-</div>

              {/* Player 2 */}
              <div className={`text-center transition-all duration-500 ${
                finalsWinner === finalsPlayer2 ? 'scale-110' : finalsWinner ? 'opacity-40 scale-90' : ''
              }`}>
                <div className={`text-7xl md:text-8xl mb-4 ${finalsWinner === finalsPlayer2 ? 'animate-bounce' : ''}`}>
                  {getAvatarEmoji(finalsPlayer2.avatar)}
                </div>
                <div className="text-xl md:text-2xl font-bold text-white tracking-wider mb-1"
                     style={{ fontFamily: "'Russo One', sans-serif" }}>
                  {finalsPlayer2.nickname}
                </div>
                <div className="text-sm text-gray-400 font-bold mb-2">#{player2Seed} SEED</div>
                <div className={`text-6xl md:text-8xl font-bold transition-all duration-300 ${
                  bracket.finals.player2Wins >= 2 ? 'text-[#ffd700]' : 'text-white'
                }`} style={{ fontFamily: "'Russo One', sans-serif", textShadow: bracket.finals.player2Wins >= 2 ? '0 0 30px rgba(255,215,0,0.8)' : 'none' }}>
                  {bracket.finals.player2Wins}
                </div>
              </div>
            </div>

            {/* Winner Banner */}
            {finalsWinner && (
              <div className="mt-8 text-center animate-bounce-in">
                <div className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-2xl"
                     style={{ boxShadow: '0 0 50px rgba(255,215,0,0.6)', animation: 'smash-pulse 1s ease-in-out infinite' }}>
                  <div className="text-black text-3xl md:text-4xl font-bold tracking-wider"
                       style={{ fontFamily: "'Russo One', sans-serif" }}>
                    🏆 {finalsWinner.nickname} Wins! 🏆
                  </div>
                  <div className="text-black/70 text-lg uppercase tracking-wider mt-1">
                    Triple Threat Champion
                  </div>
                </div>
              </div>
            )}
          </div>
            );
          })()}

          {/* Games Tracker */}
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map((gameNum) => {
              const game = bracket.finals.games[gameNum - 1];
              const isActive = gameNum === bracket.finals.games.length + 1 && !finalsWinner;
              const isCompleted = game?.winnerId;
              const winner = game?.winnerId ? getPlayer(game.winnerId) : null;

              return (
                <div
                  key={gameNum}
                  className={`
                    w-36 px-6 py-4 rounded-xl text-center transition-all duration-300
                    ${isActive ? 'bg-red-900/50 border-2 border-[#e60012] shadow-[0_0_20px_rgba(230,0,18,0.4)]' : ''}
                    ${isCompleted ? 'bg-green-900/50 border-2 border-green-500' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-800/50 border-2 border-gray-600' : ''}
                  `}
                  style={{ animation: isActive ? 'smash-pulse 2s ease-in-out infinite' : 'none' }}
                >
                  <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Game {gameNum}</div>
                  {game?.gameType && (
                    <div className="text-3xl mb-1">{GAME_ICONS[game.gameType]}</div>
                  )}
                  {isCompleted && winner && (
                    <div className="text-green-400 text-sm font-bold">{winner.nickname}</div>
                  )}
                  {isActive && !game && (
                    <div className="text-white text-sm font-bold animate-pulse">Next</div>
                  )}
                  {!isActive && !isCompleted && !game && (
                    <div className="text-gray-500 text-2xl">?</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Game Picker / Current Game */}
          {needsFinalsGamePick && !finalsWinner && (
            <div className="mt-6">
              {currentFinalsGame === 3 ? (
                <div className="smash-card rounded-xl p-8 text-center border-[#ffd700]">
                  <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider"
                      style={{ fontFamily: "'Russo One', sans-serif" }}>
                    Game 3 - Sudden Death!
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Players can agree on any game, or play the remaining event
                  </p>

                  {/* All game options */}
                  <div className="flex flex-wrap justify-center gap-4 mb-6">
                    {(['smash', 'chess', 'pingPong'] as GameType[]).map((game) => (
                      <button
                        key={game}
                        onClick={() => onSelectFinalsGame(3, game)}
                        className="flex flex-col items-center gap-2 px-6 py-4 bg-gray-800 hover:bg-gray-700
                                   rounded-xl border-2 border-gray-600 hover:border-[#ffd700] transition-all
                                   hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]"
                      >
                        <span className="text-4xl">{GAME_ICONS[game]}</span>
                        <span className="text-white font-bold uppercase tracking-wide"
                              style={{ fontFamily: "'Russo One', sans-serif" }}>
                          {GAME_NAMES[game]}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Can't Agree - Play Remaining */}
                  <div className="border-t border-gray-700 pt-6">
                    <p className="text-gray-500 text-sm mb-3 uppercase tracking-wider">Can't agree?</p>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => onSelectFinalsGame(3, getRemainingGame())}
                    >
                      Play Remaining: {GAME_ICONS[getRemainingGame()]} {GAME_NAMES[getRemainingGame()]}
                    </Button>
                  </div>
                </div>
              ) : (
                <GamePicker
                  onSelect={(game) => onSelectFinalsGame(currentFinalsGame, game)}
                  pickerName={getFinalsPickerName()}
                  disabledGames={getDisabledGames()}
                />
              )}
            </div>
          )}

          {/* Enter Result for Current Game */}
          {bracket.finals.games.length > 0 && !bracket.finals.games[bracket.finals.games.length - 1].winnerId && !finalsWinner && (
            <div className="text-center">
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-900/50 to-purple-800/50 rounded-xl border-2 border-purple-500 mb-4">
                <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Now Playing - Game {bracket.finals.games.length}</div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl">{GAME_ICONS[bracket.finals.games[bracket.finals.games.length - 1].gameType]}</span>
                  <span className="text-2xl font-bold text-white uppercase"
                        style={{ fontFamily: "'Russo One', sans-serif" }}>
                    {GAME_NAMES[bracket.finals.games[bracket.finals.games.length - 1].gameType]}
                  </span>
                </div>
              </div>
              <div>
                <Button variant="primary" size="lg" onClick={() => setFinalsResultModal(true)}>
                  Enter Game {bracket.finals.games.length} Result
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Spectator Betting Panel */}
      {spectators.length > 0 && (() => {
        // Check if betting is available (game type must be selected)
        const sf1BettingAvailable = !bracket.semifinal1.winnerId && bracket.semifinal1.gameType;
        const sf2BettingAvailable = !bracket.semifinal2.winnerId && bracket.semifinal2.gameType;
        const currentFinalsGame = bracket.finals.games[bracket.finals.games.length - 1];
        const finalsBettingAvailable = phase === 'finals' && currentFinalsGame && !currentFinalsGame.winnerId && !finalsWinner;

        const bettingAvailable = phase === 'semifinals'
          ? (sf1BettingAvailable || sf2BettingAvailable)
          : finalsBettingAvailable;

        return (
        <div className="mt-8">
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

          {showBettingPanel && (
            <div className="mt-4 smash-card rounded-xl p-6 space-y-6">
              {/* Semifinal Bets */}
              {phase === 'semifinals' && (
                <div className="space-y-4">
                  {/* SF1 Betting */}
                  {!bracket.semifinal1.winnerId && bracket.semifinal1.gameType && (
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{GAME_ICONS[bracket.semifinal1.gameType]}</span>
                        <h4 className="font-bold text-white uppercase tracking-wide">Semifinal 1</h4>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-3">
                        <span>{semifinal1Player1?.nickname}</span>
                        <span className="text-gray-500">vs</span>
                        <span>{semifinal1Player2?.nickname}</span>
                      </div>
                      <div className="space-y-2">
                        {spectators.map((spectator) => {
                          const existingBet = playoffBets.find(
                            (b) => b.bettorId === spectator.id && b.matchId === 'sf1'
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
                                    if (existingBet?.predictedWinnerId === bracket.semifinal1.player1Id) {
                                      onRemovePlayoffBet(spectator.id, 'sf1');
                                    } else {
                                      onPlacePlayoffBet(spectator.id, 'sf1', bracket.semifinal1.player1Id!);
                                    }
                                  }}
                                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                                    existingBet?.predictedWinnerId === bracket.semifinal1.player1Id
                                      ? 'bg-green-600 text-white'
                                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                  }`}
                                >
                                  {semifinal1Player1?.nickname}
                                </button>
                                <button
                                  onClick={() => {
                                    if (existingBet?.predictedWinnerId === bracket.semifinal1.player2Id) {
                                      onRemovePlayoffBet(spectator.id, 'sf1');
                                    } else {
                                      onPlacePlayoffBet(spectator.id, 'sf1', bracket.semifinal1.player2Id!);
                                    }
                                  }}
                                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                                    existingBet?.predictedWinnerId === bracket.semifinal1.player2Id
                                      ? 'bg-green-600 text-white'
                                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                  }`}
                                >
                                  {semifinal1Player2?.nickname}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SF2 Betting */}
                  {!bracket.semifinal2.winnerId && bracket.semifinal2.gameType && (
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{GAME_ICONS[bracket.semifinal2.gameType]}</span>
                        <h4 className="font-bold text-white uppercase tracking-wide">Semifinal 2</h4>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-3">
                        <span>{semifinal2Player1?.nickname}</span>
                        <span className="text-gray-500">vs</span>
                        <span>{semifinal2Player2?.nickname}</span>
                      </div>
                      <div className="space-y-2">
                        {spectators.map((spectator) => {
                          const existingBet = playoffBets.find(
                            (b) => b.bettorId === spectator.id && b.matchId === 'sf2'
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
                                    if (existingBet?.predictedWinnerId === bracket.semifinal2.player1Id) {
                                      onRemovePlayoffBet(spectator.id, 'sf2');
                                    } else {
                                      onPlacePlayoffBet(spectator.id, 'sf2', bracket.semifinal2.player1Id!);
                                    }
                                  }}
                                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                                    existingBet?.predictedWinnerId === bracket.semifinal2.player1Id
                                      ? 'bg-green-600 text-white'
                                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                  }`}
                                >
                                  {semifinal2Player1?.nickname}
                                </button>
                                <button
                                  onClick={() => {
                                    if (existingBet?.predictedWinnerId === bracket.semifinal2.player2Id) {
                                      onRemovePlayoffBet(spectator.id, 'sf2');
                                    } else {
                                      onPlacePlayoffBet(spectator.id, 'sf2', bracket.semifinal2.player2Id!);
                                    }
                                  }}
                                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                                    existingBet?.predictedWinnerId === bracket.semifinal2.player2Id
                                      ? 'bg-green-600 text-white'
                                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                  }`}
                                >
                                  {semifinal2Player2?.nickname}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {bracket.semifinal1.winnerId && bracket.semifinal2.winnerId && (
                    <div className="text-center text-gray-400 py-4">
                      Both semifinals are complete. Finals betting will be available soon!
                    </div>
                  )}
                </div>
              )}

              {/* Finals Bets */}
              {phase === 'finals' && finalsPlayer1 && finalsPlayer2 && (
                <div className="space-y-4">
                  {(() => {
                    const currentGame = bracket.finals.games[bracket.finals.games.length - 1];
                    const canBet = currentGame && !currentGame.winnerId && !finalsWinner;
                    const matchKey = `finals-${bracket.finals.games.length}`;

                    if (!canBet) {
                      if (finalsWinner) {
                        return (
                          <div className="text-center text-gray-400 py-4">
                            The finals are complete!
                          </div>
                        );
                      }
                      return (
                        <div className="text-center text-gray-400 py-4">
                          Waiting for game selection...
                        </div>
                      );
                    }

                    return (
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{GAME_ICONS[currentGame.gameType]}</span>
                          <h4 className="font-bold text-white uppercase tracking-wide">
                            Finals - Game {bracket.finals.games.length}
                          </h4>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-3">
                          <span>{finalsPlayer1.nickname} ({bracket.finals.player1Wins})</span>
                          <span className="text-gray-500">vs</span>
                          <span>{finalsPlayer2.nickname} ({bracket.finals.player2Wins})</span>
                        </div>
                        <div className="space-y-2">
                          {spectators.map((spectator) => {
                            const existingBet = playoffBets.find(
                              (b) => b.bettorId === spectator.id && b.matchId === matchKey
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
                                      if (existingBet?.predictedWinnerId === bracket.finals.player1Id) {
                                        onRemovePlayoffBet(spectator.id, matchKey);
                                      } else {
                                        onPlacePlayoffBet(spectator.id, matchKey, bracket.finals.player1Id!);
                                      }
                                    }}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                                      existingBet?.predictedWinnerId === bracket.finals.player1Id
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                    }`}
                                  >
                                    {finalsPlayer1.nickname}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (existingBet?.predictedWinnerId === bracket.finals.player2Id) {
                                        onRemovePlayoffBet(spectator.id, matchKey);
                                      } else {
                                        onPlacePlayoffBet(spectator.id, matchKey, bracket.finals.player2Id!);
                                      }
                                    }}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                                      existingBet?.predictedWinnerId === bracket.finals.player2Id
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                    }`}
                                  >
                                    {finalsPlayer2.nickname}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
        );
      })()}

      {/* Semifinal Result Modals */}
      {activeSemifinal === 1 && (
        <ResultEntryModal
          isOpen={true}
          onClose={() => setActiveSemifinal(null)}
          match={{
            id: 'sf1',
            roundNumber: 18,
            gameType: bracket.semifinal1.gameType!,
            player1Id: bracket.semifinal1.player1Id!,
            player2Id: bracket.semifinal1.player2Id!,
            winnerId: null,
            isDominant: false,
            isSyncRound: false,
            isPlayoff: true,
            playoffRound: 'semifinal',
            underservedPlayerId: null,
            volunteerId: null,
          }}
          player1={semifinal1Player1}
          player2={semifinal1Player2}
          onSubmit={(_, winnerId) => {
            onRecordSemifinalResult(1, winnerId);
            setActiveSemifinal(null);
          }}
        />
      )}

      {activeSemifinal === 2 && (
        <ResultEntryModal
          isOpen={true}
          onClose={() => setActiveSemifinal(null)}
          match={{
            id: 'sf2',
            roundNumber: 18,
            gameType: bracket.semifinal2.gameType!,
            player1Id: bracket.semifinal2.player1Id!,
            player2Id: bracket.semifinal2.player2Id!,
            winnerId: null,
            isDominant: false,
            isSyncRound: false,
            isPlayoff: true,
            playoffRound: 'semifinal',
            underservedPlayerId: null,
            volunteerId: null,
          }}
          player1={semifinal2Player1}
          player2={semifinal2Player2}
          onSubmit={(_, winnerId) => {
            onRecordSemifinalResult(2, winnerId);
            setActiveSemifinal(null);
          }}
        />
      )}

      {/* Finals Result Modal */}
      {finalsResultModal && bracket.finals.games.length > 0 && (
        <ResultEntryModal
          isOpen={true}
          onClose={() => setFinalsResultModal(false)}
          match={bracket.finals.games[bracket.finals.games.length - 1]}
          player1={finalsPlayer1}
          player2={finalsPlayer2}
          onSubmit={(_, winnerId, isDominant) => {
            onRecordFinalsResult(winnerId, isDominant);
            setFinalsResultModal(false);
          }}
        />
      )}
    </div>
  );
}
