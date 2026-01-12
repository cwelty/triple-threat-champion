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

function hasPlayedInGame(player1: Player, player2: Player, gameType: GameType): boolean {
  const opponents = getGameOpponents(player1, gameType);
  return opponents.includes(player2.id);
}

function canMatch(player1: Player, player2: Player, gameType: GameType): boolean {
  if (player1.id === player2.id) return false;
  // Never allow rematches in the same game type
  return !hasPlayedInGame(player1, player2, gameType);
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

interface ScoredPair {
  p1: PairingCandidate;
  p2: PairingCandidate;
  crossGameEncounters: number;
  recordDiff: number;
  scarcity: number; // How few options the players have (higher = more urgent to match)
  isLastChance: boolean; // True if this is the last game type where these players can meet
  stationStickiness: number; // How many of the two players played this same game last round (0, 1, or 2)
}

// Count how many valid opponents a player has left in this game
function countRemainingOptions(
  player: PairingCandidate,
  allCandidates: PairingCandidate[],
  gameType: GameType
): number {
  if (!player || !allCandidates) return 0;
  return allCandidates.filter(c =>
    c?.player?.id !== player.player.id &&
    canMatch(player.player, c.player, gameType)
  ).length;
}

// Get the game type a player played in their most recent match
function getLastGamePlayed(player: Player, previousMatches: Match[]): GameType | null {
  // Find the most recent match this player was in
  const playerMatches = previousMatches
    .filter(m => m.player1Id === player.id || m.player2Id === player.id)
    .sort((a, b) => b.roundNumber - a.roundNumber);

  return playerMatches.length > 0 ? playerMatches[0].gameType : null;
}

// Check if this game type is the last opportunity for two players to meet
// (they haven't played each other, and one or both have completed 2/3 games in the other two types)
function isLastChanceToMeet(p1: Player, p2: Player, currentGame: GameType): boolean {
  if (!p1 || !p2) return false;

  // If they've already played in any game, not a "last chance" situation
  if (getCrossGameEncounters(p1, p2) > 0) return false;

  // Check other game types
  const otherGames: GameType[] = (['smash', 'chess', 'pingPong'] as GameType[])
    .filter(g => g !== currentGame);

  let canMeetInOtherGames = 0;
  for (const game of otherGames) {
    const p1Played = getGameMatchesPlayed(p1, game);
    const p2Played = getGameMatchesPlayed(p2, game);
    const p1Opponents = getGameOpponents(p1, game) || [];

    // Can they still meet in this other game?
    // Both must have <3 matches AND not have played each other
    if (p1Played < 3 && p2Played < 3 && !p1Opponents.includes(p2.id)) {
      canMeetInOtherGames++;
    }
  }

  // If they can't meet in any other game, this is their last chance
  return canMeetInOtherGames === 0;
}

function findPairForGame(
  candidates: PairingCandidate[],
  gameType: GameType,
  previousMatches: Match[]
): PairingResult | null {
  if (!candidates || candidates.length < 2) return null;

  const sorted = sortCandidates(candidates);
  const details: string[] = [];

  details.push(`${candidates.length} eligible players for this game`);

  // Collect all valid pairs with their scores
  const validPairs: ScoredPair[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (canMatch(sorted[i].player, sorted[j].player, gameType)) {
        const crossGameEncounters = getCrossGameEncounters(sorted[i].player, sorted[j].player);
        const record1 = sorted[i].gameRecord.wins - sorted[i].gameRecord.losses;
        const record2 = sorted[j].gameRecord.wins - sorted[j].gameRecord.losses;
        const recordDiff = Math.abs(record1 - record2);

        // Calculate scarcity: how few options do these players have?
        // Lower options = higher scarcity = should be prioritized
        const options1 = countRemainingOptions(sorted[i], sorted, gameType);
        const options2 = countRemainingOptions(sorted[j], sorted, gameType);
        const minOptions = Math.min(options1, options2);
        // Invert so fewer options = higher scarcity score
        const scarcity = 10 - minOptions;

        // Check if this is the last chance for these players to meet
        const isLastChance = isLastChanceToMeet(sorted[i].player, sorted[j].player, gameType);

        // Calculate station stickiness: how many of these players played this same game last round?
        const p1LastGame = getLastGamePlayed(sorted[i].player, previousMatches);
        const p2LastGame = getLastGamePlayed(sorted[j].player, previousMatches);
        let stationStickiness = 0;
        if (p1LastGame === gameType) stationStickiness++;
        if (p2LastGame === gameType) stationStickiness++;

        validPairs.push({
          p1: sorted[i],
          p2: sorted[j],
          crossGameEncounters,
          recordDiff,
          scarcity,
          isLastChance,
          stationStickiness,
        });
      }
    }
  }

  if (validPairs.length === 0) {
    details.push('No valid pairs available (all eligible players have already faced each other in this game)');
    return null;
  }

  // Sort pairs with multiple priorities:
  // 1. Last chance pairings (players who haven't met and this is their only remaining opportunity)
  // 2. Critical scarcity (≤2 options left)
  // 3. Avoid large skill mismatches (recordDiff >= 2 is heavily penalized)
  // 4. Station stickiness (prefer players who weren't at this station last round)
  // 5. First-time matchups with similar skill (crossGameEncounters === 0 AND recordDiff <= 1)
  // 6. Fewer cross-game encounters
  // 7. Higher scarcity (as tiebreaker)
  // 8. Skill level difference (fine-tuning)
  validPairs.sort((a, b) => {
    // Primary: Last chance pairings - MUST happen or players will never meet
    if (a.isLastChance !== b.isLastChance) {
      return a.isLastChance ? -1 : 1;
    }

    // Secondary: Critical scarcity (player has ≤2 options left)
    const aCritical = a.scarcity >= 8;
    const bCritical = b.scarcity >= 8;
    if (aCritical !== bCritical) {
      return aCritical ? -1 : 1;
    }

    // Tertiary: Avoid large skill mismatches - recordDiff >= 2 is a significant penalty
    // A 2-0 player should not face a 0-0 player in the same game
    const aLargeMismatch = a.recordDiff >= 2;
    const bLargeMismatch = b.recordDiff >= 2;
    if (aLargeMismatch !== bLargeMismatch) {
      return aLargeMismatch ? 1 : -1; // Prefer the one WITHOUT large mismatch
    }

    // Quaternary: Station stickiness - prefer pairs where neither player was here last round
    // This prevents players from getting "stuck" at the same game station
    if (a.stationStickiness !== b.stationStickiness) {
      return a.stationStickiness - b.stationStickiness; // Lower stickiness is better
    }

    // Quinary: First-time matchups with reasonable skill gap
    const aGoodFirstTime = a.crossGameEncounters === 0 && a.recordDiff <= 1;
    const bGoodFirstTime = b.crossGameEncounters === 0 && b.recordDiff <= 1;
    if (aGoodFirstTime !== bGoodFirstTime) {
      return aGoodFirstTime ? -1 : 1;
    }

    // Senary: Fewer cross-game encounters
    if (a.crossGameEncounters !== b.crossGameEncounters) {
      return a.crossGameEncounters - b.crossGameEncounters;
    }

    // Septenary: Higher scarcity as tiebreaker
    if (a.scarcity !== b.scarcity) {
      return b.scarcity - a.scarcity;
    }

    // Octonary: Closest skill level
    return a.recordDiff - b.recordDiff;
  });

  const bestPair = validPairs[0];
  const record1 = bestPair.p1.gameRecord.wins - bestPair.p1.gameRecord.losses;
  const record2 = bestPair.p2.gameRecord.wins - bestPair.p2.gameRecord.losses;

  let reason: string;
  if (bestPair.crossGameEncounters === 0 && bestPair.recordDiff <= 1) {
    reason = 'First-time matchup (similar skill)';
    details.push(`Players have never faced each other in any game`);
  } else if (bestPair.crossGameEncounters === 0) {
    reason = 'First-time matchup';
    details.push(`Players have never faced each other in any game`);
  } else if (bestPair.crossGameEncounters < 3) {
    reason = `Cross-game encounters: ${bestPair.crossGameEncounters}/3`;
    details.push(`Players have faced each other in ${bestPair.crossGameEncounters} other game(s)`);
  } else {
    reason = 'All opponents faced in other games';
    details.push(`Players have already played in all 3 games, but not in ${gameType}`);
  }

  if (bestPair.recordDiff === 0) {
    details.push(`Same record group (${record1 >= 0 ? '+' : ''}${record1})`);
  } else {
    details.push(`Record difference: ${record1 >= 0 ? '+' : ''}${record1} vs ${record2 >= 0 ? '+' : ''}${record2}`);
  }

  if (bestPair.stationStickiness > 0) {
    details.push(`Station stickiness: ${bestPair.stationStickiness} player(s) were here last round`);
  }

  return { pair: [bestPair.p1, bestPair.p2], reason, details };
}

export interface SwissPairingResult {
  matches: Match[];
  log: MatchmakingLog;
}

// Calculate how "needed" a game type is based on underserved players
function calculateGameNeed(
  players: Player[],
  gameType: GameType,
  assignedPlayerIds: Set<string>
): number {
  let totalNeed = 0;
  for (const player of players) {
    if (assignedPlayerIds.has(player.id)) continue;
    const matchesPlayed = getGameMatchesPlayed(player, gameType);
    if (matchesPlayed < 3) {
      // Higher weight for players who have played fewer matches in this game
      // Also factor in total matches played (prioritize globally underserved players)
      totalNeed += (3 - matchesPlayed) * 10 + (9 - player.matchesPlayed);
    }
  }
  return totalNeed;
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

  // Shuffle game order to avoid bias, but use smart pairing within each game
  const shuffledGames = [...gameTypes].sort(() => Math.random() - 0.5);

  for (const gameType of shuffledGames) {
    const candidates = getEligiblePlayers(players, gameType, assignedPlayerIds);
    const result = findPairForGame(candidates, gameType, previousMatches);

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
    }
  }

  // Log skipped games (games where no match was created)
  for (const gameType of gameTypes) {
    if (matches.some(m => m.gameType === gameType)) continue;

    const candidates = getEligiblePlayers(players, gameType, assignedPlayerIds);
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

  return {
    matches,
    log: {
      roundNumber,
      entries: logEntries,
      skippedGames,
    },
  };
}
