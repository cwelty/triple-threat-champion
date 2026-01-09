import React, { useState, useEffect, useRef } from 'react';
import type { Match, Player, Round, GameType } from '../../types';
import { MatchCard } from './MatchCard';
import { BettingTimer, BettingTimerRef } from './BettingTimer';
import { BettingInterface } from './BettingInterface';
import { ResultEntryModal } from './ResultEntryModal';
import { SmashCharacterSelectModal } from './SmashCharacterSelectModal';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { playWarningBeep, playTimerEndSound } from '../../utils/sounds';

// Order: Ping Pong (left), Smash (middle), Chess (right)
const GAME_ORDER: Record<GameType, number> = {
  pingPong: 0,
  smash: 1,
  chess: 2,
};

interface RoundDisplayProps {
  round: Round;
  players: Player[];
  onDeckPlayers: Player[];
  onCloseBetting: () => void;
  onPlaceBet: (bettorId: string, matchId: string, predictedWinnerId: string) => void;
  onRemoveBet: (bettorId: string) => void;
  onSetMatchCharacters: (matchId: string, player1Character: string, player2Character: string) => void;
  onRecordResult: (matchId: string, winnerId: string, isDominant: boolean, player1Character?: string, player2Character?: string) => void;
  onEditResult: (matchId: string, winnerId: string, isDominant: boolean) => void;
  onCompleteRound: () => void;
  totalRounds: number;
  sortedStandings: Player[];
}

export function RoundDisplay({
  round,
  players,
  onDeckPlayers,
  onCloseBetting,
  onPlaceBet,
  onRemoveBet,
  onSetMatchCharacters,
  onRecordResult,
  onEditResult,
  onCompleteRound,
  totalRounds,
  sortedStandings,
}: RoundDisplayProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [characterSelectMatch, setCharacterSelectMatch] = useState<Match | null>(null);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [gameTimeLeft, setGameTimeLeft] = useState<number | null>(null);
  const [gamesStarted, setGamesStarted] = useState(false);
  const hasPlayedOneMinWarning = useRef(false);
  const hasPlayedTimerEnd = useRef(false);
  const bettingTimerRef = useRef<BettingTimerRef>(null);

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  const allMatchesComplete = round.matches.every((m) => m.winnerId !== null);

  // Game timer effect
  useEffect(() => {
    if (gameTimeLeft === null || gameTimeLeft < 0) return;

    // Play sounds at specific times
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

  // Reset game state when round changes
  useEffect(() => {
    setGamesStarted(false);
    setGameTimeLeft(null);
    hasPlayedOneMinWarning.current = false;
    hasPlayedTimerEnd.current = false;
  }, [round.roundNumber]);

  // Restore timer if betting is already closed (e.g., after page refresh)
  useEffect(() => {
    if (!round.bettingOpen && !gamesStarted && !allMatchesComplete) {
      setGamesStarted(true);
      setGameTimeLeft(7 * 60); // Reset to 7 minutes
    }
  }, [round.bettingOpen, gamesStarted, allMatchesComplete]);

  const handleStartGames = () => {
    setShowStartConfirm(false);
    onCloseBetting();
    setGamesStarted(true);
    setGameTimeLeft(7 * 60); // 7 minutes
  };

  const handleCompleteRound = () => {
    setShowEndConfirm(false);
    onCompleteRound();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Round Header */}
      <div className="text-center animate-slide-in">
        <div className="inline-block">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wider"
              style={{ fontFamily: "'Russo One', sans-serif" }}>
            <span className="text-white">Round</span>
            <span className="text-[#e60012] mx-3 text-5xl">{round.roundNumber}</span>
            <span className="text-gray-500">/ {totalRounds}</span>
          </h2>
          <div className="h-1 bg-gradient-to-r from-transparent via-[#e60012] to-transparent mt-2" />
        </div>
        {(round.bettingOpen || gamesStarted) && (
          <p className={`mt-3 text-lg font-semibold uppercase tracking-wide ${
            round.bettingOpen ? 'text-[#ffd700]' : 'text-green-400'
          }`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            {round.bettingOpen ? '💰 Betting is Open!' : 'Games in Progress'}
          </p>
        )}
      </div>

      {/* Betting Timer */}
      {round.bettingOpen && (
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
      )}

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
      {gamesStarted && gameTimeLeft === 0 && !allMatchesComplete && (
        <div className="smash-card border-[#ffd700] text-center pt-8 pb-6"
             style={{ animation: 'smash-shake 0.5s ease-in-out infinite' }}>
          <div className="text-4xl font-bold text-[#ffd700] uppercase tracking-wider mb-2"
               style={{ fontFamily: "'Russo One', sans-serif", textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>
            ⏰ TIME'S UP! ⏰
          </div>
          <div className="text-gray-300">Enter match results below</div>
        </div>
      )}

      {/* Betting Interface - Only show during betting phase */}
      {round.bettingOpen && onDeckPlayers.length > 0 && (
        <BettingInterface
          matches={round.matches}
          players={players}
          onDeckPlayers={onDeckPlayers}
          currentBets={round.bets}
          onPlaceBet={onPlaceBet}
          onRemoveBet={onRemoveBet}
          isLocked={!round.bettingOpen}
        />
      )}

      {/* Close Betting Button */}
      {round.bettingOpen && (
        <div className="text-center">
          <Button onClick={() => {
            setTimerExpired(false);
            setShowStartConfirm(true);
          }} variant="danger" size="lg">
            Close Betting & Start Games
          </Button>
        </div>
      )}

      {/* Match Cards - Show after betting closes for result entry */}
      {!round.bettingOpen && (
        <div className="grid gap-4 md:grid-cols-3">
          {[...round.matches].sort((a, b) => GAME_ORDER[a.gameType] - GAME_ORDER[b.gameType]).map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              player1={getPlayer(match.player1Id)}
              player2={getPlayer(match.player2Id)}
              onSelectWinner={setSelectedMatch}
              onSelectCharacters={setCharacterSelectMatch}
              showResult={true}
            />
          ))}
        </div>
      )}

      {/* Complete Round Button */}
      {!round.bettingOpen && !round.isComplete && allMatchesComplete && (
        <div className="text-center">
          <Button
            onClick={() => setShowEndConfirm(true)}
            variant="success"
            size="lg"
          >
            Complete Round & Continue
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

      {/* End Round Confirmation Modal */}
      <Modal
        isOpen={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        title="Complete Round?"
      >
        <div className="space-y-4">
          <p className="text-gray-300 text-center text-lg">
            All matches finished?
          </p>
          <p className="text-gray-400 text-center text-sm">
            Make sure all results have been entered correctly.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowEndConfirm(false)}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              variant="success"
              onClick={handleCompleteRound}
              className="flex-1"
            >
              Yes, Continue
            </Button>
          </div>
        </div>
      </Modal>

      {/* Result Entry Modal */}
      <ResultEntryModal
        isOpen={selectedMatch !== null}
        onClose={() => setSelectedMatch(null)}
        match={selectedMatch}
        player1={selectedMatch ? getPlayer(selectedMatch.player1Id) : undefined}
        player2={selectedMatch ? getPlayer(selectedMatch.player2Id) : undefined}
        onSubmit={(matchId, winnerId, isDominant) => {
          if (selectedMatch?.winnerId) {
            onEditResult(matchId, winnerId, isDominant);
          } else {
            onRecordResult(matchId, winnerId, isDominant);
          }
        }}
      />

      {/* Smash Character Select Modal */}
      <SmashCharacterSelectModal
        isOpen={characterSelectMatch !== null}
        onClose={() => setCharacterSelectMatch(null)}
        match={characterSelectMatch!}
        player1={characterSelectMatch ? getPlayer(characterSelectMatch.player1Id) : undefined}
        player2={characterSelectMatch ? getPlayer(characterSelectMatch.player2Id) : undefined}
        player1Standing={characterSelectMatch ? sortedStandings.findIndex(p => p.id === characterSelectMatch.player1Id) + 1 : 0}
        player2Standing={characterSelectMatch ? sortedStandings.findIndex(p => p.id === characterSelectMatch.player2Id) + 1 : 0}
        onConfirm={(matchId, player1Char, player2Char) => {
          onSetMatchCharacters(matchId, player1Char, player2Char);
          setCharacterSelectMatch(null);
        }}
      />
    </div>
  );
}
