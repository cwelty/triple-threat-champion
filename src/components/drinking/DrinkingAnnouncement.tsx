import React from 'react';
import type { Player } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';
import { Button } from '../ui/Button';

interface DrinkingAnnouncementProps {
  topPlayers: Player[];
  roundNumber: number;
  onDismiss: () => void;
}

export function DrinkingAnnouncement({
  topPlayers,
  roundNumber,
  onDismiss,
}: DrinkingAnnouncementProps) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      {/* Ominous Amon silhouette looming over everything */}
      <div className="absolute inset-0 flex items-start justify-center pointer-events-none overflow-hidden">
        <img
          src="/Amon.webp"
          alt=""
          className="w-[600px] h-auto opacity-70 -mt-10"
          style={{
            filter: 'brightness(0.4) contrast(1.2)',
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)',
          }}
        />
      </div>

      <div className="bg-gradient-to-b from-amber-900 to-amber-950 rounded-2xl p-8 max-w-lg w-full text-center border-2 border-amber-500 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-6xl mb-4">🍺</div>
        <h2 className="text-3xl font-bold text-amber-300 mb-2">
          SHOT TIME!
        </h2>
        <p className="text-amber-100 mb-6">
          Round {roundNumber} complete!
        </p>

        {/* Message */}
        <p className="text-white text-lg mb-6 leading-relaxed">
          It's time we make the odds a little more... <span className="text-amber-300 font-semibold">equal!</span>
          <br />
          <br />
          The 3 in the lead must increase their blood-alcohol-content by the likes of <span className="text-amber-300 font-bold">1 shot!</span>
        </p>

        {/* Top 3 Players */}
        <div className="bg-black/30 rounded-xl p-4 mb-6">
          <p className="text-amber-400 text-sm font-semibold mb-3 uppercase tracking-wide">
            Drink Up, Leaders!
          </p>
          <div className="grid grid-cols-3 gap-3">
            {topPlayers.map((player, index) => (
              <div
                key={player.id}
                className="flex flex-col items-center bg-amber-900/50 rounded-lg p-3"
              >
                <div className="text-xs text-amber-400 mb-1">#{index + 1}</div>
                <div className="text-4xl mb-1">{getAvatarEmoji(player.avatar)}</div>
                <div className="text-white font-medium text-sm text-center break-words px-1">
                  {player.nickname}
                </div>
                <div className="text-amber-300 text-xs">{player.totalPoints} pts</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dismiss Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={onDismiss}
          className="bg-amber-600 hover:bg-amber-500 text-white px-8"
        >
          Bottoms Up! 🍻
        </Button>
      </div>
    </div>
  );
}
