import React, { useState, useEffect, useRef } from 'react';
import { useTournamentStore } from './store/tournamentStore';
import { playDrumHit, playChampionFanfare } from './utils/sounds';
import { getAvatarEmoji } from './data/avatars';

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
import { BestGamblerReveal } from './components/awards/BestGamblerReveal';
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
  const [showBestGamblerReveal, setShowBestGamblerReveal] = useState(true);
  const [bestGamblerRevealed, setBestGamblerRevealed] = useState(false);
  const [showMatchmakingLog, setShowMatchmakingLog] = useState(false);

  // Champion reveal flow states
  const [championRevealStage, setChampionRevealStage] = useState<'none' | 'intro' | 'countdown' | 'reveal' | 'fadeOut' | 'done'>('none');
  const [championCountdown, setChampionCountdown] = useState(10);
  const prevTripleThreatchampionIdRef = useRef<string | null>(null);

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
    bestGamblerId,
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
    awardBestGambler,
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

  // Detect when Triple Threat Champion is crowned and trigger reveal
  useEffect(() => {
    if (tripleThreatchampionId && tripleThreatchampionId !== prevTripleThreatchampionIdRef.current) {
      prevTripleThreatchampionIdRef.current = tripleThreatchampionId;
      setChampionRevealStage('intro');
      setChampionCountdown(10);
    }
  }, [tripleThreatchampionId]);

  // Champion reveal countdown with drum hits
  useEffect(() => {
    if (championRevealStage !== 'countdown') return;

    if (championCountdown > 0) {
      // Play drum hit with increasing intensity
      const intensity = 11 - championCountdown;
      playDrumHit(intensity);

      const timer = setTimeout(() => {
        setChampionCountdown(championCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      playChampionFanfare();
      setChampionRevealStage('reveal');
    }
  }, [championRevealStage, championCountdown]);

  const usedAvatars = players.map((p) => p.avatar);
  const usedGamertags = players.map((p) => p.nickname);
  const currentRoundData = getCurrentRound();
  const onDeckPlayers = getOnDeckPlayers();

  const smashChampion = smashChampionId ? getPlayer(smashChampionId) : undefined;
  const chessChampion = chessChampionId ? getPlayer(chessChampionId) : undefined;
  const pingPongChampion = pingPongChampionId ? getPlayer(pingPongChampionId) : undefined;
  const bestGambler = bestGamblerId ? getPlayer(bestGamblerId) : undefined;
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
      <DynamicBackground gamesActive={gamesActive} phase={phase} />

      {/* Triple Threat Champion Reveal Overlay */}
      {championRevealStage !== 'none' && championRevealStage !== 'done' && tripleThreatchampion && (
        <>
          {/* Stage 1: Intro */}
          {championRevealStage === 'intro' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255,215,0,0.1) 0%, transparent 70%)',
                }}
              />
              <div className="relative z-10 text-center space-y-8 px-4">
                <div className="text-6xl mb-4">🏆</div>
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl text-gray-400 uppercase tracking-widest"
                      style={{ fontFamily: "'Russo One', sans-serif" }}>
                    And now...
                  </h2>
                  <h1 className="text-3xl md:text-5xl text-white uppercase tracking-wider"
                      style={{ fontFamily: "'Russo One', sans-serif" }}>
                    What you've all been waiting for
                  </h1>
                </div>
                <div className="pt-8">
                  <p className="text-xl text-[#ffd700] uppercase tracking-widest mb-8"
                     style={{ fontFamily: "'Russo One', sans-serif" }}>
                    The moment of truth
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setChampionRevealStage('countdown')}
                    className="text-xl px-10 py-4 animate-pulse"
                  >
                    Reveal Champion
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stage 2: Epic Countdown */}
          {championRevealStage === 'countdown' && (() => {
            const intensity = (10 - championCountdown) / 10;
            const glowIntensity = 0.3 + intensity * 0.7;
            const shakeSpeed = Math.max(0.05, 0.15 - intensity * 0.1);
            const pulseSpeed = Math.max(0.2, 0.5 - intensity * 0.3);
            const bgPulse = intensity * 0.3;

            const getHypeText = () => {
              if (championCountdown >= 8) return 'Get ready...';
              if (championCountdown >= 6) return 'Here it comes...';
              if (championCountdown >= 4) return 'Almost there...';
              if (championCountdown >= 2) return 'THE MOMENT OF TRUTH!';
              return 'YOUR CHAMPION IS...';
            };

            return (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at center, rgba(255,215,0,${bgPulse}) 0%, rgba(230,0,18,${bgPulse * 0.5}) 50%, transparent 70%)`,
                    animation: `smash-pulse ${pulseSpeed}s ease-in-out infinite`,
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,215,0,0.1) 5deg, transparent 10deg, rgba(255,215,0,0.05) 15deg, transparent 20deg)',
                    animation: `spin ${Math.max(2, 8 - intensity * 6)}s linear infinite`,
                  }}
                />
                <div className="relative z-10 text-center">
                  <div className="flex justify-center gap-4 mb-6">
                    {[...Array(Math.min(5, Math.ceil((11 - championCountdown) / 2)))].map((_, i) => (
                      <div
                        key={i}
                        className="text-6xl"
                        style={{
                          animation: `smash-shake ${shakeSpeed}s ease-in-out infinite`,
                          animationDelay: `${i * 0.05}s`,
                        }}
                      >
                        🥁
                      </div>
                    ))}
                  </div>
                  <div
                    className={`text-2xl md:text-3xl uppercase tracking-widest mb-6 transition-all duration-300 ${
                      championCountdown <= 2 ? 'text-[#ffd700]' : 'text-gray-400'
                    }`}
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      textShadow: championCountdown <= 2 ? '0 0 20px rgba(255,215,0,0.8)' : 'none',
                    }}
                  >
                    {getHypeText()}
                  </div>
                  <div
                    className="text-[180px] md:text-[250px] font-bold leading-none"
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      color: championCountdown <= 3 ? '#e60012' : '#ffd700',
                      textShadow: `0 0 ${50 + intensity * 100}px rgba(255,215,0,${glowIntensity}), 0 0 ${100 + intensity * 150}px rgba(255,215,0,${glowIntensity * 0.7})`,
                      animation: `smash-pulse ${pulseSpeed}s ease-in-out infinite`,
                      transform: `scale(${1 + intensity * 0.1})`,
                      transition: 'color 0.3s, transform 0.3s',
                    }}
                  >
                    {championCountdown}
                  </div>
                  {championCountdown <= 3 && (
                    <div
                      className="mt-8 text-4xl md:text-5xl text-white uppercase tracking-wider animate-pulse"
                      style={{
                        fontFamily: "'Russo One', sans-serif",
                        textShadow: '0 0 30px rgba(255,255,255,0.5)',
                      }}
                    >
                      {championCountdown === 3 && '🔥 THREE 🔥'}
                      {championCountdown === 2 && '⚡ TWO ⚡'}
                      {championCountdown === 1 && '💥 ONE 💥'}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Stage 3: Champion Reveal */}
          {championRevealStage === 'reveal' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,215,0,0.1) 10deg, transparent 20deg, rgba(255,215,0,0.15) 30deg, transparent 40deg)',
                  animation: 'spin 10s linear infinite',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255,215,0,0.2) 0%, transparent 50%)',
                }}
              />
              <div className="relative z-10 text-center animate-bounce-in">
                <div className="text-6xl mb-6" style={{ animation: 'crown-float 2s ease-in-out infinite' }}>👑</div>
                <div className="text-2xl text-gray-400 uppercase tracking-widest mb-6"
                     style={{ fontFamily: "'Russo One', sans-serif" }}>
                  Triple Threat Champion
                </div>
                <div
                  className="text-[150px] mb-4"
                  style={{
                    filter: 'drop-shadow(0 0 50px rgba(255,215,0,0.8))',
                  }}
                >
                  {getAvatarEmoji(tripleThreatchampion.avatar)}
                </div>
                <div
                  className="text-5xl md:text-7xl font-bold text-[#ffd700] uppercase tracking-wider mb-8"
                  style={{
                    fontFamily: "'Russo One', sans-serif",
                    textShadow: '0 0 30px rgba(255,215,0,0.8)',
                  }}
                >
                  {tripleThreatchampion.nickname}
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setChampionRevealStage('fadeOut')}
                  className="text-xl px-8 py-4"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Stage 4: Fade to Black Transition */}
          {championRevealStage === 'fadeOut' && (
            <div
              className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
              style={{
                animation: 'fadeInOut 3s ease-in-out forwards',
              }}
              onAnimationEnd={() => setChampionRevealStage('done')}
            >
              <div
                className="text-center"
                style={{
                  animation: 'fadeTextSequence 3s ease-in-out forwards',
                }}
              >
                <div className="text-4xl md:text-5xl text-gray-400 uppercase tracking-widest"
                     style={{ fontFamily: "'Russo One', sans-serif" }}>
                  But wait...
                </div>
                <div className="text-2xl text-gray-500 mt-4 uppercase tracking-wide"
                     style={{ fontFamily: "'Russo One', sans-serif" }}>
                  There's one more award
                </div>
              </div>
            </div>
          )}
        </>
      )}

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
              showMedals={phase === 'complete'}
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
            {showBestGamblerReveal && !bestGamblerRevealed ? (
              <BestGamblerReveal
                players={players}
                bestGamblerId={bestGamblerId}
                onReveal={() => {
                  awardBestGambler();
                }}
                onContinue={() => {
                  setBestGamblerRevealed(true);
                  setShowBestGamblerReveal(false);
                }}
              />
            ) : (
              <FinalResults
                players={players}
                tripleThreatchampion={tripleThreatchampion}
                smashChampion={smashChampion}
                chessChampion={chessChampion}
                pingPongChampion={pingPongChampion}
                bestGambler={bestGambler}
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
                setShowBestGamblerReveal(true);
                setBestGamblerRevealed(false);
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
