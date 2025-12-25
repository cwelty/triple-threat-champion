import React, { useState, useEffect } from 'react';
import { useTournamentStore } from './store/tournamentStore';

// Registration
import { PlayerRegistrationForm } from './components/registration/PlayerRegistrationForm';
import { RegisteredPlayersList } from './components/registration/RegisteredPlayersList';

// Round
import { RoundDisplay } from './components/round/RoundDisplay';

// Leaderboard
import { Leaderboard } from './components/leaderboard/Leaderboard';

// Sync
import { SyncRoundDisplay } from './components/sync/SyncRoundDisplay';
import { findUnderservedPlayers } from './utils/syncRounds';

// Playoffs
import { PlayoffBracket } from './components/playoffs/PlayoffBracket';
import { ThirdPlaceMatch } from './components/playoffs/ThirdPlaceMatch';

// Awards
import { ChampionReveal } from './components/awards/ChampionReveal';
import { BestBettorReveal } from './components/awards/BestBettorReveal';
import { FinalResults } from './components/awards/FinalResults';

// Drinking
import { DrinkingAnnouncement } from './components/drinking/DrinkingAnnouncement';

// Rules
import { RulesModal } from './components/rules/RulesModal';

// History
import { MatchHistoryModal } from './components/history/MatchHistoryModal';
import { HeadToHeadModal } from './components/history/HeadToHeadModal';

// Log
import { MatchmakingLogModal } from './components/log/MatchmakingLogModal';

import { Button } from './components/ui/Button';
import { Modal } from './components/ui/Modal';
import { DynamicBackground } from './components/ui/DynamicBackground';

function App() {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isLeaderboardClosing, setIsLeaderboardClosing] = useState(false);
  const [currentSyncMatch, setCurrentSyncMatch] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDrinkingAnnouncement, setShowDrinkingAnnouncement] = useState(false);
  const [drinkingRound, setDrinkingRound] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showHeadToHead, setShowHeadToHead] = useState(false);
  const [showBestBettorReveal, setShowBestBettorReveal] = useState(true);
  const [bestBettorRevealed, setBestBettorRevealed] = useState(false);
  const [showMatchmakingLog, setShowMatchmakingLog] = useState(false);

  const {
    phase,
    currentRound,
    totalRounds,
    players,
    rounds,
    playoffBracket,
    smashChampionId,
    chessChampionId,
    pingPongChampionId,
    bestBettorId,
    tripleThreatchampionId,
    registerPlayer,
    removePlayer,
    startTournament,
    startRound,
    closeBetting,
    placeBet,
    removeBet,
    recordMatchResult,
    editMatchResult,
    completeRound,
    startSyncRounds,
    acceptVolunteer,
    declineVolunteer,
    recordSyncResult,
    completeSyncRounds,
    revealChampions,
    setupPlayoffs,
    selectSemifinalGame,
    recordSemifinalResult,
    selectThirdPlaceGame,
    recordThirdPlaceResult,
    skipThirdPlaceMatch,
    selectFinalsGame,
    recordFinalsResult,
    awardBestBettor,
    getPlayer,
    getCurrentRound,
    getOnDeckPlayers,
    getSortedStandings,
    getGameStandings,
    resetTournament,
    playoffBets,
    placePlayoffBet,
    removePlayoffBet,
    matchmakingLogs,
  } = useTournamentStore();

  // Calculate drinking announcement rounds (roughly at 30%, 60%, 90% of total)
  const drinkingRounds = [
    Math.round(totalRounds * 0.3),
    Math.round(totalRounds * 0.6),
    Math.round(totalRounds * 0.9),
  ];

  // Warn before leaving during active tournament
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (phase !== 'registration' && phase !== 'complete') {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [phase]);

  const usedAvatars = players.map((p) => p.avatar);
  const usedGamertags = players.map((p) => p.nickname);
  const currentRoundData = getCurrentRound();
  const onDeckPlayers = getOnDeckPlayers();

  const smashChampion = smashChampionId ? getPlayer(smashChampionId) : undefined;
  const chessChampion = chessChampionId ? getPlayer(chessChampionId) : undefined;
  const pingPongChampion = pingPongChampionId ? getPlayer(pingPongChampionId) : undefined;
  const bestBettor = bestBettorId ? getPlayer(bestBettorId) : undefined;
  const tripleThreatchampion = tripleThreatchampionId ? getPlayer(tripleThreatchampionId) : undefined;

  // Games are active when betting is closed but round is not complete
  const gamesActive = phase === 'swiss' && currentRoundData !== undefined &&
    !currentRoundData.bettingOpen && !currentRoundData.isComplete;

  const handleToggleLeaderboard = () => {
    if (showLeaderboard) {
      // Start closing animation
      setIsLeaderboardClosing(true);
      // Wait for animation to complete, then hide
      setTimeout(() => {
        setShowLeaderboard(false);
        setIsLeaderboardClosing(false);
      }, 400); // Match the animation duration
    } else {
      setShowLeaderboard(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col smash-bg text-white bg-[#0d0d0d]">
      {/* Dynamic Background */}
      <DynamicBackground gamesActive={gamesActive} />

      {/* Header - solid background to cover dynamic bg */}
      <header className="relative z-10 bg-[#0d0d0d] border-b-2 border-[#e60012] overflow-hidden">
        {/* Animated diagonal stripes */}
        <div className="absolute inset-0 opacity-20"
             style={{
               background: `repeating-linear-gradient(
                 -45deg,
                 transparent,
                 transparent 20px,
                 rgba(230, 0, 18, 0.2) 20px,
                 rgba(230, 0, 18, 0.2) 40px
               )`
             }} />

        {/* Red glow at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#e60012] shadow-[0_0_20px_rgba(230,0,18,0.8)]" />

        <div className="relative max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo/Trophy icon */}
            <div className="text-4xl animate-bounce-in">🏆</div>

            {/* Title with Smash styling */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider"
                  style={{ fontFamily: "'Russo One', sans-serif" }}>
                <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Triple</span>
                <span className="text-[#e60012] mx-2 drop-shadow-[0_0_10px_rgba(230,0,18,0.5)]">Threat</span>
                <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Tournament</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {phase !== 'registration' && phase !== 'complete' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToggleLeaderboard}
                disabled={isLeaderboardClosing}
              >
                {showLeaderboard ? 'Hide Standings' : 'Standings'}
              </Button>
            )}
            {phase !== 'registration' && (
              <>
                <button
                  onClick={() => setShowHeadToHead(true)}
                  className="ml-2 px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-[#e60012] hover:text-white hover:bg-[#e60012] rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_15px_rgba(230,0,18,0.5)]"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  Head-to-Head
                </button>
                <button
                  onClick={() => setShowHistory(true)}
                  className="px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-[#e60012] hover:text-white hover:bg-[#e60012] rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_15px_rgba(230,0,18,0.5)]"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  History
                </button>
              </>
            )}
            <button
              onClick={() => setShowRules(true)}
              className="px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-[#e60012] hover:text-white hover:bg-[#e60012] rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_15px_rgba(230,0,18,0.5)]"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              Rules
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Leaderboard Overlay */}
        {showLeaderboard && phase !== 'registration' && (
          <div className="mb-6">
            <Leaderboard
              players={players}
              getSortedStandings={getSortedStandings}
              getGameStandings={getGameStandings}
              isClosing={isLeaderboardClosing}
            />
          </div>
        )}

        {/* Registration Phase */}
        {phase === 'registration' && (
          <div className="grid md:grid-cols-2 gap-6">
            <PlayerRegistrationForm
              usedAvatars={usedAvatars}
              usedGamertags={usedGamertags}
              onRegister={registerPlayer}
            />
            <RegisteredPlayersList
              players={players}
              onRemovePlayer={removePlayer}
              onStartTournament={startTournament}
            />
          </div>
        )}

        {/* Swiss Rounds Phase */}
        {phase === 'swiss' && currentRoundData && (
          <RoundDisplay
            round={currentRoundData}
            players={players}
            onDeckPlayers={onDeckPlayers}
            onCloseBetting={closeBetting}
            onPlaceBet={(bettorId, matchId, predictedWinnerId) => {
              placeBet(bettorId, matchId, predictedWinnerId);
            }}
            onRemoveBet={removeBet}
            onRecordResult={recordMatchResult}
            onEditResult={editMatchResult}
            onCompleteRound={() => {
              completeRound();
              // Show drinking announcement at ~30%, 60%, 90% of tournament
              if (drinkingRounds.includes(currentRound)) {
                setDrinkingRound(currentRound);
                setShowDrinkingAnnouncement(true);
                // Don't start next round yet - wait for announcement dismissal
              } else if (currentRound < totalRounds) {
                startRound();
              }
            }}
            totalRounds={totalRounds}
          />
        )}

        {/* Sync Matches Phase */}
        {phase === 'sync' && (
          <>
            {!rounds.find((r) => r.type === 'sync') ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Swiss Rounds Complete!</h2>
                {findUnderservedPlayers(players).length > 0 ? (
                  <>
                    <p className="text-gray-400 mb-6">
                      Time for sync matches to equalize match counts.
                    </p>
                    <Button variant="primary" size="lg" onClick={startSyncRounds}>
                      Start Sync Matches
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-green-400 mb-6">
                      All players have completed their matches. No sync matches needed!
                    </p>
                    <Button variant="primary" size="lg" onClick={completeSyncRounds}>
                      Continue to Champion Awards
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <SyncRoundDisplay
                round={rounds.find((r) => r.type === 'sync')!}
                players={players}
                onAcceptVolunteer={acceptVolunteer}
                onDeclineVolunteer={declineVolunteer}
                onRecordResult={recordSyncResult}
                onPlaceBet={placeBet}
                onRemoveBet={removeBet}
                onCloseBetting={closeBetting}
                onCompleteSyncRounds={completeSyncRounds}
              />
            )}
          </>
        )}

        {/* Champions Reveal Phase */}
        {phase === 'championsReveal' && (
          <ChampionReveal
            smashChampion={smashChampion}
            chessChampion={chessChampion}
            pingPongChampion={pingPongChampion}
            onContinue={() => {
              revealChampions();
            }}
          />
        )}

        {/* Playoff Seeding Phase */}
        {phase === 'playoffSeeding' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Playoff Seeding</h2>
            <p className="text-gray-400 mb-6">
              Top 4 players advance to the playoffs!
            </p>
            <div className="mb-6">
              <Leaderboard
                players={players}
                getSortedStandings={getSortedStandings}
                getGameStandings={getGameStandings}
              />
            </div>
            <Button variant="primary" size="lg" onClick={setupPlayoffs}>
              Start Playoffs
            </Button>
          </div>
        )}

        {/* Semifinals Phase */}
        {phase === 'semifinals' && (
          <PlayoffBracket
            bracket={playoffBracket}
            players={players}
            phase="semifinals"
            onSelectGame={selectSemifinalGame}
            onRecordSemifinalResult={recordSemifinalResult}
            onSelectFinalsGame={selectFinalsGame}
            onRecordFinalsResult={recordFinalsResult}
            playoffBets={playoffBets}
            onPlacePlayoffBet={placePlayoffBet}
            onRemovePlayoffBet={removePlayoffBet}
          />
        )}

        {/* Third Place Match Phase */}
        {phase === 'thirdPlace' && (
          <ThirdPlaceMatch
            bracket={playoffBracket}
            players={players}
            onSelectGame={selectThirdPlaceGame}
            onRecordResult={recordThirdPlaceResult}
            onSkip={skipThirdPlaceMatch}
            playoffBets={playoffBets}
            onPlacePlayoffBet={placePlayoffBet}
            onRemovePlayoffBet={removePlayoffBet}
          />
        )}

        {/* Finals Phase */}
        {phase === 'finals' && (
          <PlayoffBracket
            bracket={playoffBracket}
            players={players}
            phase="finals"
            onSelectGame={selectSemifinalGame}
            onRecordSemifinalResult={recordSemifinalResult}
            onSelectFinalsGame={selectFinalsGame}
            onRecordFinalsResult={(winnerId, isDominant) => {
              recordFinalsResult(winnerId, isDominant);
            }}
            playoffBets={playoffBets}
            onPlacePlayoffBet={placePlayoffBet}
            onRemovePlayoffBet={removePlayoffBet}
          />
        )}

        {/* Complete Phase */}
        {phase === 'complete' && (
          <>
            {showBestBettorReveal && !bestBettorRevealed ? (
              <BestBettorReveal
                players={players}
                bestBettorId={bestBettorId}
                onReveal={() => {
                  awardBestBettor();
                }}
                onContinue={() => {
                  setBestBettorRevealed(true);
                  setShowBestBettorReveal(false);
                }}
              />
            ) : (
              <FinalResults
                players={players}
                tripleThreatchampion={tripleThreatchampion}
                smashChampion={smashChampion}
                chessChampion={chessChampion}
                pingPongChampion={pingPongChampion}
                bestBettor={bestBettor}
                getSortedStandings={getSortedStandings}
                getGameStandings={getGameStandings}
                onReset={resetTournament}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Left Matchmaking Log Button */}
      {phase === 'swiss' && matchmakingLogs.length > 0 && (
        <div className="fixed bottom-4 left-4 z-40">
          <button
            onClick={() => setShowMatchmakingLog(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-900/80
                       border border-purple-500/50 rounded-lg text-purple-300 hover:text-white
                       hover:bg-purple-800/90 hover:border-purple-400 transition-all duration-200
                       backdrop-blur-sm text-sm"
          >
            <span>🔍</span>
            <span className="font-medium uppercase tracking-wide"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              Matchmaking Log
            </span>
          </button>
        </div>
      )}

      {/* Matchmaking Log Modal */}
      <MatchmakingLogModal
        isOpen={showMatchmakingLog}
        onClose={() => setShowMatchmakingLog(false)}
        logs={matchmakingLogs}
      />

      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* Match History Modal */}
      <MatchHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        rounds={rounds}
        players={players}
      />

      {/* Head-to-Head Modal */}
      <HeadToHeadModal
        isOpen={showHeadToHead}
        onClose={() => setShowHeadToHead(false)}
        rounds={rounds}
        players={players}
      />

      {/* Drinking Announcement */}
      {showDrinkingAnnouncement && (
        <DrinkingAnnouncement
          topPlayers={getSortedStandings().slice(0, 3)}
          roundNumber={drinkingRound}
          onDismiss={() => {
            setShowDrinkingAnnouncement(false);
            // Start the next round after dismissing the announcement
            if (currentRound < totalRounds) {
              startRound();
            }
          }}
        />
      )}

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="⚠️ Reset Tournament?"
      >
        <div className="space-y-4">
          <p className="text-red-400 text-center text-lg font-semibold">
            This will delete ALL tournament data!
          </p>
          <p className="text-gray-400 text-center text-sm">
            All players, scores, and progress will be permanently erased. This cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowResetConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetTournament();
                setShowResetConfirm(false);
                setCurrentSyncMatch(0);
                setShowBestBettorReveal(true);
                setBestBettorRevealed(false);
              }}
              className="flex-1"
            >
              ⚠️ Yes, Reset Everything
            </Button>
          </div>
        </div>
      </Modal>

      {/* Footer - solid background to cover dynamic bg */}
      <footer className="relative z-10 border-t-2 border-[#e60012] bg-[#0d0d0d] overflow-hidden">
        {/* Red glow at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-[#e60012] shadow-[0_0_20px_rgba(230,0,18,0.8)]" />

        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-2xl">🎮</span>
            <span className="text-2xl">♟️</span>
            <span className="text-2xl">🏓</span>
          </div>
          <p className="text-gray-500 text-sm uppercase tracking-wider"
             style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            May the best <span className="text-[#e60012] font-bold">triple threat</span> win!
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
