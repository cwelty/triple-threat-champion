import React, { useState, useEffect, useRef } from 'react';
import type { Round, Player, Match, GameType } from '../../types';
import { GAME_ICONS, GAME_NAMES } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';
import { Button } from '../ui/Button';
import { ResultEntryModal } from '../round/ResultEntryModal';
import { BettingInterface } from '../round/BettingInterface';
import { BettingTimer, BettingTimerRef } from '../round/BettingTimer';
import { Modal } from '../ui/Modal';
import { playWarningBeep, playTimerEndSound } from '../../utils/sounds';

// Game display order: Ping-Pong, Smash, Chess (left to right)
const GAME_ORDER: Record<GameType, number> = {
  pingPong: 0,
  smash: 1,
  chess: 2,
};

interface SyncRoundDisplayProps {
  round: Round;
  players: Player[];
  onAcceptVolunteer: (index: number) => void;
  onDeclineVolunteer: (index: number) => void;
  onRecordResult: (matchId: string, winnerId: string, isDominant: boolean) => void;
  onPlaceBet: (bettorId: string, matchId: string, predictedWinnerId: string) => void;
  onRemoveBet: (bettorId: string) => void;
  onCloseBetting: () => void;
  onCompleteSyncRounds: () => void;
}

export function SyncRoundDisplay({
  round,
  players,
  onAcceptVolunteer,
  onDeclineVolunteer,
  onRecordResult,
  onPlaceBet,
  onRemoveBet,
  onCloseBetting,
  onCompleteSyncRounds,
}: SyncRoundDisplayProps) {
  const [resultModalMatch, setResultModalMatch] = useState<Match | null>(null);
  const [acceptedMatches, setAcceptedMatches] = useState<Set<number>>(new Set());
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [gameTimeLeft, setGameTimeLeft] = useState<number | null>(null);
  const [gamesStarted, setGamesStarted] = useState(false);
  const hasPlayedOneMinWarning = useRef(false);
  const hasPlayedTimerEnd = useRef(false);
  const bettingTimerRef = useRef<BettingTimerRef>(null);

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  // Game timer effect
  useEffect(() => {
    if (gameTimeLeft === null || gameTimeLeft < 0) return;

    if (gameTimeLeft === 60 && !hasPlayedOneMinWarning.current) {
      playWarningBeep();
      hasPlayedOneMinWarning.current = true;
    }
    if (gameTimeLeft === 0 && !hasPlayedTimerEnd.current) {
      playTimerEndSound();
      hasPlayedTimerEnd.current = true;
    }

    if (gameTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setGameTimeLeft((t) => (t !== null && t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameTimeLeft]);

  // Restore timer if betting is already closed (e.g., after page refresh)
  useEffect(() => {
    const incompleteMatches = round.matches.filter((m) => m.winnerId === null);
    if (!round.bettingOpen && !gamesStarted && incompleteMatches.length > 0) {
      setGamesStarted(true);
      setGameTimeLeft(7 * 60); // Reset to 7 minutes
    }
  }, [round.bettingOpen, gamesStarted, round.matches]);

  const handleStartGames = () => {
    setShowStartConfirm(false);
    onCloseBetting();
    setGamesStarted(true);
    setGameTimeLeft(7 * 60); // 7 minutes
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const allComplete = round.matches.every((m) => m.winnerId !== null);
  const completedCount = round.matches.filter((m) => m.winnerId !== null).length;
  const incompleteMatches = round.matches.filter((m) => m.winnerId === null);

  // Sort matches by game order for consistent display
  const sortedMatches = [...round.matches].sort(
    (a, b) => GAME_ORDER[a.gameType] - GAME_ORDER[b.gameType]
  );

  // Get non-participating players for betting (exclude all sync match participants)
  const participatingIds = new Set(
    round.matches.flatMap((m) => [m.player1Id, m.player2Id])
  );
  const bettingPlayers = players.filter((p) => !participatingIds.has(p.id));

  const handleAccept = (index: number) => {
    setAcceptedMatches((prev) => new Set([...prev, index]));
    onAcceptVolunteer(index);
  };

  const handleDecline = (index: number) => {
    setAcceptedMatches((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    onDeclineVolunteer(index);
  };

  // Matches with both underserved players are auto-accepted (no volunteer needed)
  const matchesNeedingAcceptance = round.matches.filter(m => !m.secondUnderservedPlayerId && m.winnerId === null);
  const allVolunteersAccepted = acceptedMatches.size >= matchesNeedingAcceptance.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center animate-slide-in">
        <div className="inline-block">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wider"
              style={{ fontFamily: "'Russo One', sans-serif" }}>
            <span className="text-white">Sync</span>
            <span className="text-[#e60012] mx-3">Matches</span>
          </h2>
          <div className="h-1 bg-gradient-to-r from-transparent via-[#e60012] to-transparent mt-2" />
        </div>
        <p className="text-gray-400 mt-3">
          {completedCount} of {round.matches.length} complete - Equalizing match counts
        </p>
        {(round.bettingOpen && allVolunteersAccepted) && (
          <p className="mt-2 text-lg font-semibold uppercase tracking-wide text-[#ffd700]"
             style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            💰 Betting is Open!
          </p>
        )}
        {gamesStarted && !round.bettingOpen && (
          <p className="mt-2 text-lg font-semibold uppercase tracking-wide text-green-400"
             style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            Games in Progress
          </p>
        )}
      </div>

      {/* Progress */}
      <div className="flex gap-2 justify-center">
        {round.matches.map((match) => (
          <div
            key={match.id}
            className={`w-8 h-2 rounded-full ${
              match.winnerId ? 'bg-green-500' : 'bg-[#e60012] animate-pulse'
            }`}
          />
        ))}
      </div>

      {/* PHASE 1: Volunteer Selection */}
      {!allVolunteersAccepted && incompleteMatches.length > 0 && (
        <>
          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-3 text-center">
            <p className="text-yellow-400 text-sm">
              Accept all volunteers below to enable betting
            </p>
          </div>

          {/* Volunteer Selection Cards */}
          <div className="flex flex-wrap justify-center gap-4">
            {sortedMatches.map((match) => {
              const originalIndex = round.matches.findIndex((m) => m.id === match.id);
              const isAccepted = acceptedMatches.has(originalIndex);
              const isComplete = match.winnerId !== null;
              const player1 = getPlayer(match.player1Id);
              const player2 = getPlayer(match.player2Id);
              const bothUnderserved = !!match.secondUnderservedPlayerId;

              if (isComplete) return null;

              return (
                <div
                  key={match.id}
                  className="bg-gray-800 rounded-xl overflow-hidden w-72"
                >
                  {/* Game Header */}
                  <div className={`px-4 py-2 text-center ${
                    match.gameType === 'smash' ? 'bg-red-900/50' :
                    match.gameType === 'chess' ? 'bg-purple-900/50' : 'bg-green-900/50'
                  }`}>
                    <span className="text-xl mr-2">{GAME_ICONS[match.gameType]}</span>
                    <span className="font-bold text-white uppercase tracking-wide text-sm"
                          style={{ fontFamily: "'Russo One', sans-serif" }}>
                      {GAME_NAMES[match.gameType]}
                    </span>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Players row */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center flex-1">
                        <div className="text-3xl mb-1">
                          {player1 ? getAvatarEmoji(player1.avatar) : '?'}
                        </div>
                        <div className="text-[10px] text-white font-medium leading-tight">
                          {player1?.nickname}
                        </div>
                        <div className="text-[10px] text-[#e60012] font-semibold">Needs Match</div>
                      </div>

                      <div className="text-gray-500 font-bold text-sm">VS</div>

                      <div className="text-center flex-1">
                        <div className="text-3xl mb-1">
                          {player2 ? getAvatarEmoji(player2.avatar) : '?'}
                        </div>
                        <div className="text-[10px] text-white font-medium leading-tight">
                          {player2?.nickname}
                        </div>
                        <div className={`text-[10px] font-semibold ${bothUnderserved ? 'text-[#e60012]' : 'text-blue-400'}`}>
                          {bothUnderserved ? 'Needs Match' : 'Volunteer'}
                        </div>
                      </div>
                    </div>

                    {/* Status badges */}
                    {bothUnderserved && (
                      <div className="bg-green-900/30 border border-green-500/50 rounded px-2 py-1 text-center">
                        <p className="text-green-400 text-[10px] font-medium">
                          Both players need this match
                        </p>
                      </div>
                    )}
                    {match.isVolunteerForced && !bothUnderserved && (
                      <div className="bg-purple-900/30 border border-purple-500/50 rounded px-2 py-1 text-center">
                        <p className="text-purple-400 text-[10px] font-medium">
                          Randomly Assigned
                        </p>
                      </div>
                    )}
                    {match.isVolunteerExhausted && !match.isVolunteerForced && !bothUnderserved && (
                      <div className="bg-red-900/30 border border-red-600/50 rounded px-2 py-1 text-center">
                        <p className="text-red-400 text-[10px] font-medium">
                          Rematch Required
                        </p>
                      </div>
                    )}

                    {/* Action area */}
                    {bothUnderserved ? (
                      <div className="text-center text-green-400 text-xs font-semibold">
                        ✓ Auto-matched
                      </div>
                    ) : isAccepted ? (
                      <div className="text-center text-green-400 text-xs font-semibold">
                        ✓ Volunteer Accepted
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDecline(originalIndex)}
                            className="flex-1"
                          >
                            Decline
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleAccept(originalIndex)}
                            className="flex-1"
                          >
                            Accept
                          </Button>
                        </div>
                        <p className="text-[10px] text-gray-500 text-center">
                          Volunteer's record unaffected
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* PHASE 2: Betting Phase */}
      {allVolunteersAccepted && round.bettingOpen && incompleteMatches.length > 0 && (
        <>
          {/* Betting Timer */}
          <BettingTimer
            ref={bettingTimerRef}
            duration={90}
            onComplete={() => {
              setTimerExpired(true);
              setShowStartConfirm(true);
            }}
            onAddTime={() => {
              setTimerExpired(false);
              setShowStartConfirm(false);
            }}
            isActive={round.bettingOpen}
          />

          {/* Matchups Display */}
          <div className="flex flex-col md:flex-row justify-center gap-4">
            {sortedMatches.filter(m => m.winnerId === null).map((match) => {
              const player1 = getPlayer(match.player1Id);
              const player2 = getPlayer(match.player2Id);
              const bothUnderserved = !!match.secondUnderservedPlayerId;
              const colors = match.gameType === 'smash'
                ? { bg: 'from-red-900/50 to-red-950/50', text: 'text-red-400' }
                : match.gameType === 'chess'
                  ? { bg: 'from-purple-900/50 to-purple-950/50', text: 'text-purple-400' }
                  : { bg: 'from-green-900/50 to-green-950/50', text: 'text-green-400' };

              return (
                <div
                  key={match.id}
                  className="smash-card rounded-lg overflow-hidden w-full md:flex-1"
                >
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
                        <div className="relative min-w-28 text-center p-3 rounded-lg bg-[#1a1a1a]">
                          <div className="text-5xl mb-2">
                            {player1 ? getAvatarEmoji(player1.avatar) : '?'}
                          </div>
                          <div className="font-bold text-white tracking-wide text-[9px] leading-tight"
                               style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                            {player1?.nickname ?? 'Unknown'}
                          </div>
                          <div className="mt-1 text-xs text-[#e60012] font-bold uppercase">Needs Match</div>
                        </div>
                      </div>

                      {/* VS */}
                      <div className="smash-vs text-3xl">VS</div>

                      {/* Player 2 */}
                      <div className="flex flex-col items-center">
                        <div className="relative min-w-28 text-center p-3 rounded-lg bg-[#1a1a1a]">
                          <div className="text-5xl mb-2">
                            {player2 ? getAvatarEmoji(player2.avatar) : '?'}
                          </div>
                          <div className="font-bold text-white tracking-wide text-[9px] leading-tight"
                               style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                            {player2?.nickname ?? 'Unknown'}
                          </div>
                          <div className={`mt-1 text-xs font-bold uppercase ${bothUnderserved ? 'text-[#e60012]' : 'text-blue-400'}`}>
                            {bothUnderserved ? 'Needs Match' : 'Volunteer'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Betting Interface */}
          {bettingPlayers.length > 0 && (
            <BettingInterface
              matches={incompleteMatches}
              players={players}
              onDeckPlayers={bettingPlayers}
              currentBets={round.bets}
              onPlaceBet={onPlaceBet}
              onRemoveBet={onRemoveBet}
              isLocked={!round.bettingOpen}
            />
          )}

          {/* Close Betting Button */}
          <div className="text-center">
            <Button onClick={() => {
              setTimerExpired(false);
              setShowStartConfirm(true);
            }} variant="danger" size="lg">
              Close Betting & Start Games
            </Button>
          </div>
        </>
      )}

      {/* PHASE 3: Games in Progress */}
      {!round.bettingOpen && incompleteMatches.length > 0 && (
        <>
          {/* Game Timer */}
          {gamesStarted && gameTimeLeft !== null && gameTimeLeft > 0 && (
            <div className={`smash-card text-center py-6 ${gameTimeLeft <= 60 ? 'border-red-500' : 'border-green-500'}`}
                 style={{ animation: gameTimeLeft <= 60 ? 'smash-pulse 0.5s ease-in-out infinite' : 'none' }}>
              <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold"
                   style={{ fontFamily: "'Russo One', sans-serif" }}>
                Game Time Remaining
              </div>
              <div className={`text-6xl font-mono font-bold ${
                gameTimeLeft <= 60 ? 'text-[#e60012] animate-pulse' : 'text-green-400'
              }`} style={{ textShadow: gameTimeLeft <= 60 ? '0 0 20px rgba(230,0,18,0.5)' : '0 0 20px rgba(34,197,94,0.5)' }}>
                {formatTime(gameTimeLeft)}
              </div>
            </div>
          )}

          {/* Time's Up */}
          {gamesStarted && gameTimeLeft === 0 && (
            <div className="smash-card border-[#ffd700] text-center pt-8 pb-6"
                 style={{ animation: 'smash-shake 0.5s ease-in-out infinite' }}>
              <div className="text-4xl font-bold text-[#ffd700] uppercase tracking-wider mb-2"
                   style={{ fontFamily: "'Russo One', sans-serif", textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>
                ⏰ TIME'S UP! ⏰
              </div>
              <div className="text-gray-300">Enter match results below</div>
            </div>
          )}

          {/* Match Cards for Result Entry */}
          <div className="flex flex-col md:flex-row justify-center gap-4">
            {sortedMatches.filter(m => m.winnerId === null).map((match) => {
              const player1 = getPlayer(match.player1Id);
              const player2 = getPlayer(match.player2Id);
              const bothUnderserved = !!match.secondUnderservedPlayerId;
              const colors = match.gameType === 'smash'
                ? { bg: 'from-red-900/50 to-red-950/50', text: 'text-red-400' }
                : match.gameType === 'chess'
                  ? { bg: 'from-purple-900/50 to-purple-950/50', text: 'text-purple-400' }
                  : { bg: 'from-green-900/50 to-green-950/50', text: 'text-green-400' };

              return (
                <div
                  key={match.id}
                  className="smash-card rounded-lg overflow-hidden w-full md:flex-1"
                >
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
                        <div className="relative min-w-28 text-center p-3 rounded-lg bg-[#1a1a1a]">
                          <div className="text-5xl mb-2">
                            {player1 ? getAvatarEmoji(player1.avatar) : '?'}
                          </div>
                          <div className="font-bold text-white tracking-wide text-[9px] leading-tight"
                               style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                            {player1?.nickname ?? 'Unknown'}
                          </div>
                          <div className="mt-1 text-xs text-[#e60012] font-bold uppercase">Needs Match</div>
                        </div>
                      </div>

                      {/* VS */}
                      <div className="smash-vs text-3xl">VS</div>

                      {/* Player 2 */}
                      <div className="flex flex-col items-center">
                        <div className="relative min-w-28 text-center p-3 rounded-lg bg-[#1a1a1a]">
                          <div className="text-5xl mb-2">
                            {player2 ? getAvatarEmoji(player2.avatar) : '?'}
                          </div>
                          <div className="font-bold text-white tracking-wide text-[9px] leading-tight"
                               style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                            {player2?.nickname ?? 'Unknown'}
                          </div>
                          <div className={`mt-1 text-xs font-bold uppercase ${bothUnderserved ? 'text-[#e60012]' : 'text-blue-400'}`}>
                            {bothUnderserved ? 'Needs Match' : 'Volunteer'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enter Result button */}
                    <div className="mt-6">
                      <Button
                        onClick={() => setResultModalMatch(match)}
                        variant="primary"
                        className="w-full"
                      >
                        Enter Result
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Completed Matches Summary */}
      {completedCount > 0 && !allComplete && (
        <div className="mt-6">
          <h3 className="text-center text-gray-400 text-sm uppercase tracking-wider mb-3">
            Completed Matches
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {sortedMatches.filter(m => m.winnerId !== null).map((match) => {
              const underservedPlayer = getPlayer(match.player1Id);
              const volunteerPlayer = getPlayer(match.player2Id);
              const winner = getPlayer(match.winnerId!);

              return (
                <div
                  key={match.id}
                  className="bg-gray-800/50 rounded-xl overflow-hidden w-64 opacity-70"
                >
                  <div className={`px-4 py-2 text-center ${
                    match.gameType === 'smash' ? 'bg-red-900/30' :
                    match.gameType === 'chess' ? 'bg-purple-900/30' : 'bg-green-900/30'
                  }`}>
                    <span className="text-lg mr-2">{GAME_ICONS[match.gameType]}</span>
                    <span className="font-bold text-white uppercase tracking-wide text-xs"
                          style={{ fontFamily: "'Russo One', sans-serif" }}>
                      {GAME_NAMES[match.gameType]}
                    </span>
                  </div>
                  <div className="p-3 text-center">
                    <div className="flex items-center justify-center gap-4 mb-2">
                      <div className={`text-center ${winner?.id === underservedPlayer?.id ? '' : 'opacity-50'}`}>
                        <div className="text-2xl">{underservedPlayer ? getAvatarEmoji(underservedPlayer.avatar) : '?'}</div>
                        <div className="text-[10px] text-white font-medium">{underservedPlayer?.nickname}</div>
                      </div>
                      <div className="text-gray-500 font-bold text-xs">VS</div>
                      <div className={`text-center ${winner?.id === volunteerPlayer?.id ? '' : 'opacity-50'}`}>
                        <div className="text-2xl">{volunteerPlayer ? getAvatarEmoji(volunteerPlayer.avatar) : '?'}</div>
                        <div className="text-[10px] text-white font-medium">{volunteerPlayer?.nickname}</div>
                      </div>
                    </div>
                    <div className="text-green-400 text-xs font-semibold">
                      {winner?.nickname} wins! {match.isDominant && '⚡'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Complete */}
      {allComplete && (
        <div className="text-center">
          <p className="text-green-400 mb-4 font-bold text-lg">All sync matches complete!</p>
          <Button variant="success" size="lg" onClick={onCompleteSyncRounds}>
            Proceed to Champion Awards
          </Button>
        </div>
      )}

      {/* Start Games Confirmation Modal */}
      <Modal
        isOpen={showStartConfirm}
        onClose={() => setShowStartConfirm(false)}
        title={timerExpired ? "Time's Up!" : "Start Games?"}
      >
        <div className="space-y-4">
          <p className="text-gray-300 text-center text-lg">
            {timerExpired ? 'Betting time has expired. Ready to start?' : 'Are all players ready to begin?'}
          </p>
          <p className="text-gray-400 text-center text-sm">
            This will close betting and start the 7-minute game timer.
          </p>
          <div className="flex gap-3 pt-2">
            {timerExpired ? (
              <Button
                variant="secondary"
                onClick={() => {
                  bettingTimerRef.current?.addTime(30);
                }}
                className="flex-1"
              >
                +30 sec
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setShowStartConfirm(false)}
                className="flex-1"
              >
                Not Yet
              </Button>
            )}
            <Button
              variant="success"
              onClick={handleStartGames}
              className="flex-1"
            >
              Start Games!
            </Button>
          </div>
        </div>
      </Modal>

      {/* Result Modal */}
      {resultModalMatch && (
        <ResultEntryModal
          isOpen={true}
          onClose={() => setResultModalMatch(null)}
          match={resultModalMatch}
          player1={getPlayer(resultModalMatch.player1Id)}
          player2={getPlayer(resultModalMatch.player2Id)}
          onSubmit={(matchId, winnerId, isDominant) => {
            onRecordResult(matchId, winnerId, isDominant);
            setResultModalMatch(null);
          }}
        />
      )}
    </div>
  );
}
