import React, { useState, useEffect, useRef } from 'react';
import type { Player, GameType } from '../../types';
import { GAME_ICONS, GAME_NAMES } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';
import { Button } from '../ui/Button';

interface ChampionRevealProps {
  smashChampion: Player | undefined;
  chessChampion: Player | undefined;
  pingPongChampion: Player | undefined;
  onContinue: () => void;
}

type GameStage = 'smash' | 'chess' | 'pingPong';
type RevealStage = 'intro' | 'countdown' | 'reveal' | 'complete';

export function ChampionReveal({
  smashChampion,
  chessChampion,
  pingPongChampion,
  onContinue,
}: ChampionRevealProps) {
  const [stage, setStage] = useState<RevealStage>('intro');
  const [currentGame, setCurrentGame] = useState<GameStage>('smash');
  const [countdown, setCountdown] = useState(3);
  const [showCard, setShowCard] = useState(false);
  const countdownCompleteRef = useRef(false);

  const champions: { game: GameType; player: Player | undefined }[] = [
    { game: 'smash', player: smashChampion },
    { game: 'chess', player: chessChampion },
    { game: 'pingPong', player: pingPongChampion },
  ];

  const currentChampion = champions.find((c) => c.game === currentGame);

  const startCountdown = (game: GameStage) => {
    setCurrentGame(game);
    setCountdown(3);
    countdownCompleteRef.current = false;
    setShowCard(false);
    setStage('countdown');
  };

  const advanceToNext = () => {
    if (currentGame === 'smash') {
      startCountdown('chess');
    } else if (currentGame === 'chess') {
      startCountdown('pingPong');
    } else {
      setStage('complete');
    }
  };

  // Countdown effect
  useEffect(() => {
    if (stage === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (stage === 'countdown' && countdown === 0 && !countdownCompleteRef.current) {
      countdownCompleteRef.current = true;
      setStage('reveal');
      setTimeout(() => setShowCard(true), 100);
    }
  }, [stage, countdown]);

  // Intro screen
  if (stage === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="text-center">
          <div className="text-8xl mb-6">🏆</div>
          <h2 className="text-4xl font-bold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: "'Russo One', sans-serif" }}>
            Champion Reveals
          </h2>
          <p className="text-xl text-gray-400 mb-2">Who dominated each game?</p>
          <p className="text-lg text-[#ffd700]">+5 bonus points for each champion!</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => startCountdown('smash')}>
          Begin Reveal
        </Button>
      </div>
    );
  }

  // Countdown screen
  if (stage === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="text-center">
          <div className="text-8xl mb-4">{GAME_ICONS[currentGame]}</div>
          <h2 className="text-3xl font-bold text-yellow-400 uppercase tracking-wider mb-8"
              style={{ fontFamily: "'Russo One', sans-serif" }}>
            {GAME_NAMES[currentGame]} Champion
          </h2>
          <div className="text-8xl mb-8" style={{ animation: 'smash-shake 0.1s ease-in-out infinite' }}>
            🥁
          </div>
          <div className="text-9xl font-bold text-white"
               style={{ fontFamily: "'Russo One', sans-serif", textShadow: '0 0 50px rgba(255,215,0,0.5)' }}>
            {countdown}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-3 mt-8">
          {(['smash', 'chess', 'pingPong'] as GameStage[]).map((game) => (
            <div
              key={game}
              className={`w-3 h-3 rounded-full transition-all ${
                game === currentGame
                  ? 'bg-yellow-500 scale-125 animate-pulse'
                  : champions.findIndex((c) => c.game === game) < champions.findIndex((c) => c.game === currentGame)
                  ? 'bg-green-500'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Reveal screen
  if (stage === 'reveal') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        {/* Game title */}
        <div className="text-center">
          <div className="text-6xl mb-4">{GAME_ICONS[currentGame]}</div>
          <h2 className="text-3xl font-bold text-yellow-400 uppercase tracking-wider mb-2"
              style={{ fontFamily: "'Russo One', sans-serif" }}>
            {GAME_NAMES[currentGame]} Champion
          </h2>
        </div>

        {/* Champion card with reveal animation */}
        <div
          className={`
            transform transition-all duration-500 ease-out
            ${showCard ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
          `}
        >
          {currentChampion?.player ? (
            <div className="bg-gradient-to-b from-yellow-900/40 to-gray-800 rounded-2xl p-8 text-center border-2 border-yellow-500 shadow-[0_0_50px_rgba(255,215,0,0.4)]"
                 style={{ animation: showCard ? 'smash-pulse 2s ease-in-out infinite' : 'none' }}>
              <div className="text-8xl mb-4 animate-bounce-in">{getAvatarEmoji(currentChampion.player.avatar)}</div>
              <div className="text-3xl font-bold text-white mb-2 tracking-wider"
                   style={{ fontFamily: "'Russo One', sans-serif" }}>
                {currentChampion.player.nickname}
              </div>
              <div className="text-gray-400 mb-4">{currentChampion.player.name}</div>
              <div className="text-lg text-gray-300 mb-4">
                Record: <span className="text-yellow-400 font-bold">
                  {currentChampion.player[`${currentGame}Record`].wins}-{currentChampion.player[`${currentGame}Record`].losses}
                </span>
              </div>
              <div className="inline-block px-6 py-2 bg-yellow-500 text-black font-bold rounded-full text-xl"
                   style={{ fontFamily: "'Russo One', sans-serif", animation: 'smash-pulse 1s ease-in-out infinite' }}>
                +5 POINTS
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-2xl p-8 text-center border-2 border-gray-600">
              <div className="text-6xl mb-4 opacity-50">❓</div>
              <div className="text-xl text-gray-500">No champion determined</div>
            </div>
          )}
        </div>

        {/* Next button */}
        <Button variant="primary" size="lg" onClick={advanceToNext}>
          {currentGame === 'pingPong' ? 'See All Champions' : 'Next Champion'}
        </Button>

        {/* Progress dots */}
        <div className="flex gap-3">
          {(['smash', 'chess', 'pingPong'] as GameStage[]).map((game) => (
            <div
              key={game}
              className={`w-3 h-3 rounded-full transition-all ${
                game === currentGame
                  ? 'bg-yellow-500 scale-125'
                  : champions.findIndex((c) => c.game === game) < champions.findIndex((c) => c.game === currentGame)
                  ? 'bg-green-500'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Complete screen - all champions shown
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-wider"
            style={{ fontFamily: "'Russo One', sans-serif" }}>
          Your Champions!
        </h2>
        <p className="text-gray-400">Each champion receives +5 bonus points</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {champions.map(({ game, player }) => (
          <div
            key={game}
            className="bg-gradient-to-b from-yellow-900/40 to-gray-800 rounded-xl p-6 text-center border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(255,215,0,0.2)] animate-slide-in"
          >
            <div className="text-4xl mb-2">{GAME_ICONS[game]}</div>
            <h3 className="text-lg font-bold text-yellow-400 mb-4 uppercase tracking-wider"
                style={{ fontFamily: "'Russo One', sans-serif" }}>
              {GAME_NAMES[game]} Champion
            </h3>

            {player ? (
              <>
                <div className="text-6xl mb-3">{getAvatarEmoji(player.avatar)}</div>
                <div className="text-xl font-bold text-white">{player.nickname}</div>
                <div className="mt-3 text-sm text-gray-400">
                  Record: {player[`${game}Record`].wins}-{player[`${game}Record`].losses}
                </div>
                <div className="mt-2 inline-block px-3 py-1 bg-yellow-500 text-black font-bold rounded-full text-sm">
                  +5 POINTS
                </div>
              </>
            ) : (
              <div className="text-gray-500 py-8">No champion</div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <Button variant="success" size="lg" onClick={onContinue}>
          Continue to Playoff Seeding
        </Button>
      </div>
    </div>
  );
}
