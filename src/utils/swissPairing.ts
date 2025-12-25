import type { Player, Match, GameType } from '../types';

interface PairingCandidate {
  player: Player;
  gameRecord: { wins: number; losses: number };
  matchesInGame: number;
}

export interface MatchmakingLogEntry {
  roundNumber: number;
  gameType: GameType;
  player1Name: string;
  player2Name: string;
  player1Record: string;
  player2Record: string;
  reason: string;
  details: string[];
}

export interface MatchmakingLog {
  roundNumber: number;
  entries: MatchmakingLogEntry[];
  skippedGames: { gameType: GameType; reason: string }[];
}

function getGameRecord(player: Player, gameType: GameType): { wins: number; losses: number } {
  switch (gameType) {
    case 'smash': return player.smashRecord;
    case 'chess': return player.chessRecord;
    case 'pingPong': return player.pingPongRecord;
  }
}

function getGameMatchesPlayed(player: Player, gameType: GameType): number {
  switch (gameType) {
    case 'smash': return player.smashMatchesPlayed;
    case 'chess': return player.chessMatchesPlayed;
    case 'pingPong': return player.pingPongMatchesPlayed;
  }
}

function getGameOpponents(player: Player, gameType: GameType): string[] {
  switch (gameType) {
    case 'smash': return player.smashOpponents;
    case 'chess': return player.chessOpponents;
    case 'pingPong': return player.pingPongOpponents;
  }
}

function canMatch(player1: Player, player2: Player, gameType: GameType, allowRematches: boolean): boolean {
  if (player1.id === player2.id) return false;
  if (allowRematches) return true;

  const opponents = getGameOpponents(player1, gameType);
  return !opponents.includes(player2.id);
}

function getEligiblePlayers(
  players: Player[],
  gameType: GameType,
  assignedPlayerIds: Set<string>
): PairingCandidate[] {
  return players
    .filter((p) => {
      // Not already assigned to another game this round
      if (assignedPlayerIds.has(p.id)) return false;
      // Has played fewer than 3 matches in this game
      return getGameMatchesPlayed(p, gameType) < 3;
    })
    .map((p) => ({
      player: p,
      gameRecord: getGameRecord(p, gameType),
      matchesInGame: getGameMatchesPlayed(p, gameType),
    }));
}

function sortCandidates(candidates: PairingCandidate[]): PairingCandidate[] {
  return [...candidates].sort((a, b) => {
    // Primary: Fewest total matches (prioritize underserved)
    if (a.player.matchesPlayed !== b.player.matchesPlayed) {
      return a.player.matchesPlayed - b.player.matchesPlayed;
    }
    // Secondary: Game-specific wins (match similar skill levels)
    return b.gameRecord.wins - a.gameRecord.wins;
  });
}

interface PairingResult {
  pair: [PairingCandidate, PairingCandidate];
  reason: string;
  details: string[];
}

function findPairForGame(
  candidates: PairingCandidate[],
  gameType: GameType,
  allowRematches: boolean
): PairingResult | null {
  if (candidates.length < 2) return null;

  const sorted = sortCandidates(candidates);
  const details: string[] = [];

  details.push(`${candidates.length} eligible players for this game`);

  // Group by record (wins - losses)
  const recordGroups = new Map<number, PairingCandidate[]>();
  for (const c of sorted) {
    const score = c.gameRecord.wins - c.gameRecord.losses;
    if (!recordGroups.has(score)) {
      recordGroups.set(score, []);
    }
    recordGroups.get(score)!.push(c);
  }

  // Try to pair within same record group first
  const sortedScores = [...recordGroups.keys()].sort((a, b) => b - a);

  details.push(`Record groups: ${sortedScores.map(s => `${s >= 0 ? '+' : ''}${s} (${recordGroups.get(s)!.length})`).join(', ')}`);

  for (const score of sortedScores) {
    const group = recordGroups.get(score)!;
    if (group.length >= 2) {
      // Try all pairs within this group
      for (let i = 0; i < group.length - 1; i++) {
        for (let j = i + 1; j < group.length; j++) {
          if (canMatch(group[i].player, group[j].player, gameType, allowRematches)) {
            const reason = `Same record group (${score >= 0 ? '+' : ''}${score})`;
            details.push(`Matched players with identical ${score >= 0 ? '+' : ''}${score} record`);
            return { pair: [group[i], group[j]], reason, details };
          }
        }
      }
    }
  }

  // If no same-record pair found, pair adjacent groups
  for (let i = 0; i < sortedScores.length - 1; i++) {
    const higherGroup = recordGroups.get(sortedScores[i])!;
    const lowerGroup = recordGroups.get(sortedScores[i + 1])!;

    for (const higher of higherGroup) {
      for (const lower of lowerGroup) {
        if (canMatch(higher.player, lower.player, gameType, allowRematches)) {
          const reason = `Adjacent record groups (${sortedScores[i] >= 0 ? '+' : ''}${sortedScores[i]} vs ${sortedScores[i + 1] >= 0 ? '+' : ''}${sortedScores[i + 1]})`;
          details.push(`No same-record pairs available, matched adjacent groups`);
          return { pair: [higher, lower], reason, details };
        }
      }
    }
  }

  // Fallback: try any pair
  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (canMatch(sorted[i].player, sorted[j].player, gameType, allowRematches)) {
        const reason = 'Best available pairing';
        details.push(`No adjacent-group pairs available, matched best available`);
        return { pair: [sorted[i], sorted[j]], reason, details };
      }
    }
  }

  // Last resort: allow rematches
  if (!allowRematches && sorted.length >= 2) {
    details.push(`No valid pairs without rematches, allowing rematches`);
    const result = findPairForGame(candidates, gameType, true);
    if (result) {
      result.reason = `Rematch allowed - ${result.reason}`;
      result.details = [...details, ...result.details];
    }
    return result;
  }

  return null;
}

export interface SwissPairingResult {
  matches: Match[];
  log: MatchmakingLog;
}

export function generateSwissPairings(
  players: Player[],
  previousMatches: Match[],
  roundNumber: number
): SwissPairingResult {
  const matches: Match[] = [];
  const logEntries: MatchmakingLogEntry[] = [];
  const skippedGames: { gameType: GameType; reason: string }[] = [];
  const assignedPlayerIds = new Set<string>();
  const gameTypes: GameType[] = ['smash', 'chess', 'pingPong'];

  // Shuffle game order to avoid bias
  const shuffledGames = [...gameTypes].sort(() => Math.random() - 0.5);

  for (const gameType of shuffledGames) {
    const candidates = getEligiblePlayers(players, gameType, assignedPlayerIds);
    const result = findPairForGame(candidates, gameType, false);

    if (result) {
      const { pair, reason, details } = result;
      const [p1, p2] = pair;
      assignedPlayerIds.add(p1.player.id);
      assignedPlayerIds.add(p2.player.id);

      matches.push({
        id: crypto.randomUUID(),
        roundNumber,
        gameType,
        player1Id: p1.player.id,
        player2Id: p2.player.id,
        winnerId: null,
        isDominant: false,
        isSyncRound: false,
        isPlayoff: false,
        playoffRound: null,
        underservedPlayerId: null,
        volunteerId: null,
      });

      logEntries.push({
        roundNumber,
        gameType,
        player1Name: p1.player.nickname,
        player2Name: p2.player.nickname,
        player1Record: `${p1.gameRecord.wins}W-${p1.gameRecord.losses}L (${p1.matchesInGame}/3 played)`,
        player2Record: `${p2.gameRecord.wins}W-${p2.gameRecord.losses}L (${p2.matchesInGame}/3 played)`,
        reason,
        details,
      });
    } else {
      // Log why we couldn't create a match
      if (candidates.length < 2) {
        const eligibleNames = candidates.map(c => c.player.nickname).join(', ') || 'none';
        skippedGames.push({
          gameType,
          reason: candidates.length === 0
            ? 'No eligible players (all assigned or completed 3 matches)'
            : `Only 1 eligible player: ${eligibleNames}`,
        });
      } else {
        skippedGames.push({
          gameType,
          reason: 'No valid pairings possible (all players have faced each other)',
        });
      }
    }
  }

  return {
    matches,
    log: {
      roundNumber,
      entries: logEntries,
      skippedGames,
    },
  };
}
