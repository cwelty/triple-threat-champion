import type { Player, GameType, Round } from '../types';

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

// Returns head-to-head record: positive if player1 won more, negative if player2 won more, 0 if tied or no matches
function getHeadToHead(player1Id: string, player2Id: string, gameType: GameType, rounds: Round[]): number {
  let player1Wins = 0;
  let player2Wins = 0;

  for (const round of rounds) {
    for (const match of round.matches) {
      if (match.gameType !== gameType) continue;
      if (!match.winnerId) continue;

      const isMatchBetweenPlayers =
        (match.player1Id === player1Id && match.player2Id === player2Id) ||
        (match.player1Id === player2Id && match.player2Id === player1Id);

      if (isMatchBetweenPlayers) {
        if (match.winnerId === player1Id) {
          player1Wins++;
        } else if (match.winnerId === player2Id) {
          player2Wins++;
        }
      }
    }
  }

  return player1Wins - player2Wins;
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

export function determineGameChampion(players: Player[], gameType: GameType, rounds?: Round[]): Player | null {
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

  // Check for 2-way tie at the top and apply head-to-head tiebreaker
  if (sorted.length >= 2 && rounds) {
    const first = sorted[0];
    const second = sorted[1];
    const firstRecord = getGameRecord(first, gameType);
    const secondRecord = getGameRecord(second, gameType);

    // Only apply head-to-head if exactly 2 players are tied at the top (same wins)
    if (firstRecord.wins === secondRecord.wins) {
      // Check if there's a third player also tied
      const third = sorted[2];
      const thirdIsTied = third && getGameRecord(third, gameType).wins === firstRecord.wins;

      // Only use head-to-head for exactly 2-way ties
      if (!thirdIsTied) {
        const aOpponents = getGameOpponents(first, gameType);
        // Only use head-to-head if they've played each other
        if (aOpponents.includes(second.id)) {
          const h2h = getHeadToHead(first.id, second.id, gameType, rounds);
          if (h2h < 0) {
            // Second player won head-to-head, swap them
            return second;
          }
          // h2h > 0 means first player won, h2h === 0 means tied - keep original order
        }
      }
    }
  }

  return sorted[0] ?? null;
}

export function sortByStandings(players: Player[]): Player[] {
  return [...players].sort((a, b) => breakTie(a, b));
}
