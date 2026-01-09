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

// Count how many times two players have faced each other across all games
function getCrossGameEncounters(player1: Player, player2: Player): number {
  if (!player1 || !player2) return 0;
  let encounters = 0;
  if (player1.smashOpponents?.includes(player2.id)) encounters++;
  if (player1.chessOpponents?.includes(player2.id)) encounters++;
  if (player1.pingPongOpponents?.includes(player2.id)) encounters++;
  return encounters;
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
  // Never allow same-game rematches
  const availableVolunteers = eligiblePlayers
    .filter((p) => !underservedOpponents.includes(p.id))
    .map((p) => {
      const record = getGameRecord(p, gameType);
      const score = record.wins - record.losses;
      const crossGameEncounters = getCrossGameEncounters(underserved, p);
      return {
        player: p,
        recordDiff: Math.abs(score - underservedScore),
        crossGameEncounters,
      };
    })
    // Sort: prioritize fewest cross-game encounters, then closest skill level
    .sort((a, b) => {
      if (a.crossGameEncounters !== b.crossGameEncounters) {
        return a.crossGameEncounters - b.crossGameEncounters;
      }
      return a.recordDiff - b.recordDiff;
    });

  if (availableVolunteers.length > 0) {
    return {
      volunteer: availableVolunteers[0].player,
      isExhausted: false,
      isForced: false,
      eligibleCount: eligiblePlayers.length,
    };
  }

  // No volunteer available without a same-game rematch
  // Return null - caller should try a different game type
  return {
    volunteer: null,
    isExhausted: true,
    isForced: false,
    eligibleCount: eligiblePlayers.length,
  };
}

export function getNeededGame(shortage: PlayerShortage): GameType | null {
  if (shortage.smashNeeded > 0) return 'smash';
  if (shortage.chessNeeded > 0) return 'chess';
  if (shortage.pingPongNeeded > 0) return 'pingPong';
  return null;
}

// Get all game types the player still needs, in priority order
export function getNeededGames(shortage: PlayerShortage): GameType[] {
  const games: GameType[] = [];
  if (shortage.smashNeeded > 0) games.push('smash');
  if (shortage.chessNeeded > 0) games.push('chess');
  if (shortage.pingPongNeeded > 0) games.push('pingPong');
  return games;
}

// Find a volunteer for an underserved player, trying each needed game type
// until one is found without requiring a rematch
export function findVolunteerForAnyGame(
  players: Player[],
  shortage: PlayerShortage,
  excludeIds: string[] = []
): { volunteer: Player | null; gameType: GameType | null; isExhausted: boolean } {
  const neededGames = getNeededGames(shortage);

  for (const gameType of neededGames) {
    const result = findVolunteer(players, shortage.playerId, gameType, excludeIds);
    if (result.volunteer) {
      return {
        volunteer: result.volunteer,
        gameType,
        isExhausted: result.isExhausted,
      };
    }
  }

  // No volunteer available for any needed game type without a rematch
  return {
    volunteer: null,
    gameType: null,
    isExhausted: true,
  };
}
