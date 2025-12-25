import type { Player } from '../types';

export function calculateBuchholz(
  player: Player,
  allPlayers: Player[]
): { total: number; smash: number; chess: number; pingPong: number } {
  const playerMap = new Map(allPlayers.map((p) => [p.id, p]));

  let total = 0;
  let smash = 0;
  let chess = 0;
  let pingPong = 0;

  // Smash opponents
  for (const opponentId of player.smashOpponents) {
    const opponent = playerMap.get(opponentId);
    if (opponent) {
      smash += opponent.totalPoints;
      total += opponent.totalPoints;
    }
  }

  // Chess opponents
  for (const opponentId of player.chessOpponents) {
    const opponent = playerMap.get(opponentId);
    if (opponent) {
      chess += opponent.totalPoints;
      total += opponent.totalPoints;
    }
  }

  // Ping Pong opponents
  for (const opponentId of player.pingPongOpponents) {
    const opponent = playerMap.get(opponentId);
    if (opponent) {
      pingPong += opponent.totalPoints;
      total += opponent.totalPoints;
    }
  }

  return { total, smash, chess, pingPong };
}

export function calculateAllBuchholz(players: Player[]): Player[] {
  return players.map((player) => {
    const buchholz = calculateBuchholz(player, players);
    return {
      ...player,
      buchholzScore: buchholz.total,
      smashBuchholz: buchholz.smash,
      chessBuchholz: buchholz.chess,
      pingPongBuchholz: buchholz.pingPong,
    };
  });
}
