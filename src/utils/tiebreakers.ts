import type { Player, GameType } from '../types';

function getGameRecord(player: Player, gameType: GameType): { wins: number; losses: number } {
  switch (gameType) {
    case 'smash': return player.smashRecord;
    case 'chess': return player.chessRecord;
    case 'pingPong': return player.pingPongRecord;
  }
}

function getGameBuchholz(player: Player, gameType: GameType): number {
  switch (gameType) {
    case 'smash': return player.smashBuchholz;
    case 'chess': return player.chessBuchholz;
    case 'pingPong': return player.pingPongBuchholz;
  }
}

function getGameOpponents(player: Player, gameType: GameType): string[] {
  switch (gameType) {
    case 'smash': return player.smashOpponents;
    case 'chess': return player.chessOpponents;
    case 'pingPong': return player.pingPongOpponents;
  }
}

export function breakTie(a: Player, b: Player, gameType?: GameType): number {
  if (gameType) {
    // Game-specific tiebreaker
    const aRecord = getGameRecord(a, gameType);
    const bRecord = getGameRecord(b, gameType);

    // 1. Most wins in that game
    if (bRecord.wins !== aRecord.wins) {
      return bRecord.wins - aRecord.wins;
    }

    // 2. Game-specific Buchholz
    const aBuchholz = getGameBuchholz(a, gameType);
    const bBuchholz = getGameBuchholz(b, gameType);
    if (bBuchholz !== aBuchholz) {
      return bBuchholz - aBuchholz;
    }

    // 3. Head-to-head in that game
    const aOpponents = getGameOpponents(a, gameType);
    if (aOpponents.includes(b.id)) {
      // They played each other - check who won
      // (This is simplified - in reality we'd need to look at match results)
      // For now, use dominant wins as proxy
    }

    // 4. Dominant wins in that game (simplified - using total dominant wins)
    if (b.dominantWins !== a.dominantWins) {
      return b.dominantWins - a.dominantWins;
    }

    // 5. Fan favorite (most bets received)
    if (b.betsReceived !== a.betsReceived) {
      return b.betsReceived - a.betsReceived;
    }

    // 6. Final fallback - random (should rarely happen)
    return Math.random() - 0.5;
  }

  // Overall tiebreaker
  // 1. Total points
  if (b.totalPoints !== a.totalPoints) {
    return b.totalPoints - a.totalPoints;
  }

  // 2. Buchholz score
  if (b.buchholzScore !== a.buchholzScore) {
    return b.buchholzScore - a.buchholzScore;
  }

  // 3. Dominant wins
  if (b.dominantWins !== a.dominantWins) {
    return b.dominantWins - a.dominantWins;
  }

  // 4. Fan favorite (most bets received)
  if (b.betsReceived !== a.betsReceived) {
    return b.betsReceived - a.betsReceived;
  }

  // 5. Final fallback - random (should rarely happen)
  return Math.random() - 0.5;
}

export function determineGameChampion(players: Player[], gameType: GameType): Player | null {
  const sorted = [...players].sort((a, b) => {
    const aRecord = getGameRecord(a, gameType);
    const bRecord = getGameRecord(b, gameType);

    // Primary: Most wins
    if (bRecord.wins !== aRecord.wins) {
      return bRecord.wins - aRecord.wins;
    }

    // Use tiebreaker
    return breakTie(a, b, gameType);
  });

  return sorted[0] ?? null;
}

export function sortByStandings(players: Player[]): Player[] {
  return [...players].sort((a, b) => breakTie(a, b));
}
