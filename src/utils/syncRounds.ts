import type { Player, GameType } from '../types';

export interface PlayerShortage {
  playerId: string;
  smashNeeded: number;
  chessNeeded: number;
  pingPongNeeded: number;
}

export function findUnderservedPlayers(players: Player[]): PlayerShortage[] {
  const underserved: PlayerShortage[] = [];

  for (const player of players) {
    if (player.matchesPlayed < 9) {
      underserved.push({
        playerId: player.id,
        smashNeeded: 3 - player.smashMatchesPlayed,
        chessNeeded: 3 - player.chessMatchesPlayed,
        pingPongNeeded: 3 - player.pingPongMatchesPlayed,
      });
    }
  }

  return underserved;
}

function getGameRecord(player: Player, gameType: GameType): { wins: number; losses: number } {
  switch (gameType) {
    case 'smash': return player.smashRecord;
    case 'chess': return player.chessRecord;
    case 'pingPong': return player.pingPongRecord;
  }
}

function getGameOpponents(player: Player, gameType: GameType): string[] {
  switch (gameType) {
    case 'smash': return player.smashOpponents;
    case 'chess': return player.chessOpponents;
    case 'pingPong': return player.pingPongOpponents;
  }
}

export interface VolunteerResult {
  volunteer: Player | null;
  isExhausted: boolean; // True if all eligible players have already played the underserved in this game
  isForced: boolean; // True if this is a forced random selection (all volunteers were excluded/declined)
  eligibleCount: number; // How many players were eligible (9+ matches, excluding underserved)
}

export function findVolunteer(
  players: Player[],
  underservedId: string,
  gameType: GameType,
  excludeIds: string[] = []
): VolunteerResult {
  const underserved = players.find((p) => p.id === underservedId);
  if (!underserved) return { volunteer: null, isExhausted: false, isForced: false, eligibleCount: 0 };

  const underservedRecord = getGameRecord(underserved, gameType);
  const underservedScore = underservedRecord.wins - underservedRecord.losses;
  const underservedOpponents = getGameOpponents(underserved, gameType);

  // All completed players (9+ matches) except the underserved player
  const allCompletedPlayers = players.filter(
    (p) => p.id !== underservedId && p.matchesPlayed >= 9
  );

  // Find completed players who haven't been excluded
  const eligiblePlayers = allCompletedPlayers.filter(
    (p) => !excludeIds.includes(p.id)
  );

  // Filter out players who have already played the underserved player in this game type
  const availableVolunteers = eligiblePlayers
    .filter((p) => !underservedOpponents.includes(p.id))
    .map((p) => {
      const record = getGameRecord(p, gameType);
      const score = record.wins - record.losses;
      return {
        player: p,
        recordDiff: Math.abs(score - underservedScore),
      };
    })
    .sort((a, b) => a.recordDiff - b.recordDiff);

  // Best case: volunteer who hasn't played underserved in this game
  if (availableVolunteers.length > 0) {
    return {
      volunteer: availableVolunteers[0].player,
      isExhausted: false,
      isForced: false,
      eligibleCount: eligiblePlayers.length,
    };
  }

  // Second best: volunteer who HAS played underserved but wasn't excluded
  const fallbackVolunteers = eligiblePlayers
    .map((p) => {
      const record = getGameRecord(p, gameType);
      const score = record.wins - record.losses;
      return {
        player: p,
        recordDiff: Math.abs(score - underservedScore),
      };
    })
    .sort((a, b) => a.recordDiff - b.recordDiff);

  if (fallbackVolunteers.length > 0) {
    return {
      volunteer: fallbackVolunteers[0].player,
      isExhausted: true,
      isForced: false,
      eligibleCount: eligiblePlayers.length,
    };
  }

  // Last resort: ALL eligible players were excluded (declined or assigned elsewhere)
  // Randomly select from all completed players (ignoring exclusions)
  if (allCompletedPlayers.length > 0) {
    const randomIndex = Math.floor(Math.random() * allCompletedPlayers.length);
    return {
      volunteer: allCompletedPlayers[randomIndex],
      isExhausted: true,
      isForced: true,
      eligibleCount: allCompletedPlayers.length,
    };
  }

  return {
    volunteer: null,
    isExhausted: true,
    isForced: false,
    eligibleCount: 0,
  };
}

export function getNeededGame(shortage: PlayerShortage): GameType | null {
  if (shortage.smashNeeded > 0) return 'smash';
  if (shortage.chessNeeded > 0) return 'chess';
  if (shortage.pingPongNeeded > 0) return 'pingPong';
  return null;
}
