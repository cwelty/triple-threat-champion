import React from 'react';
import type { Player } from '../../types';
import { PlayerCard } from './PlayerCard';
import { Button } from '../ui/Button';

interface RegisteredPlayersListProps {
  players: Player[];
  onRemovePlayer: (id: string) => void;
  onStartTournament: () => void;
}

export function RegisteredPlayersList({
  players,
  onRemovePlayer,
  onStartTournament,
}: RegisteredPlayersListProps) {
  const minPlayers = 8;
  const maxPlayers = 11;
  const canStart = players.length >= minPlayers && players.length <= maxPlayers;
  const needMore = minPlayers - players.length;

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          Registered Players ({players.length})
        </h2>
        <span className="text-sm text-gray-400">{minPlayers}-{maxPlayers} players</span>
      </div>

      {players.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No players registered yet. Add players to begin!
        </p>
      ) : (
        <div className="space-y-2 mb-4">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onRemove={() => onRemovePlayer(player.id)}
            />
          ))}
        </div>
      )}

      {players.length > 0 && (
        <div className="border-t border-gray-700 pt-4">
          {canStart ? (
            <Button
              onClick={onStartTournament}
              variant="success"
              size="lg"
              className="w-full"
            >
              Start Tournament! ({players.length} players)
            </Button>
          ) : players.length > maxPlayers ? (
            <p className="text-center text-red-400">
              Too many players! Maximum is {maxPlayers}.
            </p>
          ) : (
            <p className="text-center text-gray-400">
              Need {needMore} more player{needMore !== 1 ? 's' : ''} to start (min {minPlayers})
            </p>
          )}
        </div>
      )}
    </div>
  );
}
