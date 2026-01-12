import React, { useState, useEffect } from 'react';
import type { Player, Foreshadower } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';
import { Button } from '../ui/Button';

interface ForeshadowerAnnouncementProps {
  foreshadower: Foreshadower;
  foreshadowerPlayer: Player;
  players: Player[];
  onSelectTarget: (foreshadowerId: string, targetId: string) => void;
  onComplete: () => void;
}

export function ForeshadowerAnnouncement({
  foreshadower,
  foreshadowerPlayer,
  players,
  onSelectTarget,
  onComplete,
}: ForeshadowerAnnouncementProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showTargetSelection, setShowTargetSelection] = useState(false);
  const [flickerIntensity, setFlickerIntensity] = useState(1);

  // Spooky flicker effect
  useEffect(() => {
    const flickerInterval = setInterval(() => {
      setFlickerIntensity(0.7 + Math.random() * 0.3);
    }, 100);

    return () => clearInterval(flickerInterval);
  }, []);

  const handleConfirmTarget = () => {
    if (selectedTarget) {
      onSelectTarget(foreshadower.playerId, selectedTarget);
      onComplete();
    }
  };

  const targetPlayer = selectedTarget ? players.find(p => p.id === selectedTarget) : null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at center, rgba(75, 0, 130, 0.9) 0%, rgba(20, 0, 40, 0.98) 50%, rgba(0, 0, 0, 1) 100%)`,
      }}
    >
      {/* Subtle star field background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(1px 1px at 20px 30px, white, transparent),
                       radial-gradient(1px 1px at 40px 70px, rgba(138, 43, 226, 0.8), transparent),
                       radial-gradient(1px 1px at 50px 160px, white, transparent),
                       radial-gradient(1px 1px at 90px 40px, white, transparent),
                       radial-gradient(1px 1px at 130px 80px, rgba(138, 43, 226, 0.8), transparent),
                       radial-gradient(1px 1px at 160px 120px, white, transparent)`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Shooting stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="shooting-star absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${1.5 + Math.random()}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div
        className="relative z-10 text-center px-6 max-w-2xl"
        style={{ opacity: flickerIntensity }}
      >
        {!showTargetSelection ? (
          <>
            {/* Crystal ball icon */}
            <div
              className="text-8xl mb-6"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(138, 43, 226, 0.8))',
                animation: 'crystal-pulse 2s ease-in-out infinite',
              }}
            >
              🔮
            </div>

            {/* Spooky title */}
            <h1
              className="text-4xl md:text-5xl font-bold text-purple-300 uppercase tracking-widest mb-4"
              style={{
                fontFamily: "'Russo One', sans-serif",
                textShadow: '0 0 20px rgba(138, 43, 226, 0.8), 0 0 40px rgba(138, 43, 226, 0.4)',
                letterSpacing: '0.2em',
              }}
            >
              The Foreshadower
            </h1>

            {/* Subtitle */}
            <p
              className="text-xl text-purple-400 mb-8 italic"
              style={{
                textShadow: '0 0 10px rgba(138, 43, 226, 0.5)',
              }}
            >
              A vision has been fulfilled...
            </p>

            {/* Foreshadower reveal */}
            <div
              className="inline-block p-8 rounded-2xl mb-8"
              style={{
                background: 'linear-gradient(135deg, rgba(75, 0, 130, 0.4) 0%, rgba(138, 43, 226, 0.2) 100%)',
                border: '2px solid rgba(138, 43, 226, 0.6)',
                boxShadow: '0 0 40px rgba(138, 43, 226, 0.3), inset 0 0 30px rgba(138, 43, 226, 0.1)',
              }}
            >
              <div
                className="text-8xl mb-4"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))',
                }}
              >
                {getAvatarEmoji(foreshadowerPlayer.avatar)}
              </div>
              <div
                className="text-3xl font-bold text-white uppercase tracking-wider"
                style={{
                  fontFamily: "'Russo One', sans-serif",
                  textShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
                }}
              >
                {foreshadowerPlayer.nickname}
              </div>
              <div className="text-purple-300 mt-2 text-lg">
                {foreshadower.streakCount} predictions correct in a row!
              </div>
            </div>

            {/* Spooky message */}
            <div
              className="text-2xl text-purple-200 mb-8"
              style={{
                textShadow: '0 0 10px rgba(138, 43, 226, 0.5)',
              }}
            >
              <span className="text-4xl">👁️</span>
              <br />
              <span className="italic">"Your visions have come true...</span>
              <br />
              <span className="italic">Now choose who must drink!"</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowTargetSelection(true)}
              className="text-xl px-10 py-4"
              style={{
                background: 'linear-gradient(135deg, #6b21a8 0%, #4c1d95 100%)',
                boxShadow: '0 0 30px rgba(138, 43, 226, 0.5)',
              }}
            >
              Cast Your Curse
            </Button>
          </>
        ) : (
          <>
            {/* Target selection */}
            <h2
              className="text-3xl font-bold text-purple-300 uppercase tracking-wider mb-6"
              style={{
                fontFamily: "'Russo One', sans-serif",
                textShadow: '0 0 20px rgba(138, 43, 226, 0.8)',
              }}
            >
              Choose Your Victim
            </h2>

            <p className="text-purple-400 mb-6 text-lg italic">
              Who shall suffer the consequences of your foresight?
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedTarget(player.id)}
                  className={`victim-card p-4 rounded-xl transition-all duration-300 ${
                    selectedTarget === player.id
                      ? 'ring-2 ring-purple-400 scale-105 selected'
                      : ''
                  }`}
                  style={{
                    background: selectedTarget === player.id
                      ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.4) 0%, rgba(75, 0, 130, 0.4) 100%)'
                      : 'rgba(75, 0, 130, 0.2)',
                    border: '1px solid rgba(138, 43, 226, 0.3)',
                    boxShadow: selectedTarget === player.id
                      ? '0 0 20px rgba(138, 43, 226, 0.5)'
                      : 'none',
                  }}
                >
                  <div className="text-4xl mb-2 avatar-icon">{getAvatarEmoji(player.avatar)}</div>
                  <div className="text-white font-bold text-sm uppercase tracking-wide">
                    {player.nickname}
                  </div>
                </button>
              ))}
            </div>

            {selectedTarget && targetPlayer && (
              <div
                className="mb-6 p-4 rounded-xl"
                style={{
                  background: 'rgba(220, 38, 38, 0.2)',
                  border: '1px solid rgba(220, 38, 38, 0.5)',
                }}
              >
                <div className="text-xl text-red-400">
                  <span className="text-3xl mr-2">{getAvatarEmoji(targetPlayer.avatar)}</span>
                  <span className="font-bold">{targetPlayer.nickname}</span>
                  <span className="text-red-300"> must take a shot!</span>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowTargetSelection(false)}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleConfirmTarget}
                disabled={!selectedTarget}
                className="px-8"
                style={{
                  background: selectedTarget
                    ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
                    : undefined,
                  boxShadow: selectedTarget
                    ? '0 0 30px rgba(220, 38, 38, 0.5)'
                    : undefined,
                }}
              >
                Confirm Curse
              </Button>
            </div>
          </>
        )}
      </div>

      {/* CSS for animations */}
      <style>{`
        .shooting-star {
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          opacity: 0;
          animation: shooting-star-move 2s ease-in-out infinite;
        }
        .shooting-star::after {
          content: '';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 80px;
          height: 2px;
          background: linear-gradient(to left, rgba(255, 255, 255, 0.8), rgba(138, 43, 226, 0.5), transparent);
          right: 4px;
        }
        @keyframes shooting-star-move {
          0% {
            opacity: 0;
            transform: translateX(0) translateY(0) rotate(-35deg);
          }
          10% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(300px) translateY(200px) rotate(-35deg);
          }
        }
        @keyframes crystal-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 30px rgba(138, 43, 226, 0.8)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 50px rgba(138, 43, 226, 1)); }
        }
        @keyframes ghostly-shimmer {
          0%, 100% {
            box-shadow: 0 0 10px rgba(138, 43, 226, 0.3), 0 0 20px rgba(138, 43, 226, 0.1);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 25px rgba(138, 43, 226, 0.6), 0 0 40px rgba(138, 43, 226, 0.3), 0 0 60px rgba(138, 43, 226, 0.1);
            transform: scale(1.02);
          }
        }
        @keyframes ghost-wisp {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          50% { opacity: 0.6; }
          100% { opacity: 0; transform: translateY(-30px) scale(1.5); }
        }
        .victim-card {
          position: relative;
          overflow: hidden;
        }
        .victim-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(138, 43, 226, 0) 0%, rgba(138, 43, 226, 0) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .victim-card:hover::before {
          background: radial-gradient(circle at center, rgba(138, 43, 226, 0.3) 0%, rgba(138, 43, 226, 0) 70%);
          opacity: 1;
        }
        .victim-card:hover {
          animation: ghostly-shimmer 1.5s ease-in-out infinite;
          border-color: rgba(138, 43, 226, 0.6) !important;
        }
        .victim-card:hover .avatar-icon {
          filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 30px rgba(138, 43, 226, 0.8));
          transform: scale(1.1);
          transition: all 0.3s ease;
        }
        .victim-card::after {
          content: '👻';
          position: absolute;
          font-size: 1.5rem;
          opacity: 0;
          pointer-events: none;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .victim-card:hover::after {
          animation: ghost-wisp 1s ease-out infinite;
        }
        .victim-card.selected::after {
          display: none;
        }
      `}</style>
    </div>
  );
}
