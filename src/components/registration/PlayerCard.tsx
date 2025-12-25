import React from 'react';
import type { Player } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';

interface PlayerCardProps {
  player: Player;
  onRemove?: () => void;
  showStats?: boolean;
}

export function PlayerCard({ player, onRemove, showStats = false }: PlayerCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 flex items-center gap-3">
      <div className="text-3xl">{getAvatarEmoji(player.avatar)}</div>
      <div className="flex-1">
        <div className="font-semibold text-white">{player.nickname}</div>
        <div className="text-sm text-gray-400">{player.name}</div>
        {showStats && (
          <div className="text-xs text-gray-500 mt-1">
            {player.totalPoints} pts | {player.matchRecord.wins}-{player.matchRecord.losses}
          </div>
        )}
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 p-1"
          title="Remove player"
        >
          &times;
        </button>
      )}
    </div>
  );
}
