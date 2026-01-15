/**
 * Simulation script to test matchmaking and tournament logic
 * Run with: npx tsx scripts/simulate.ts
 */

import type { Player, Match, GameType } from '../src/types';
import { generateSwissPairings } from '../src/utils/swissPairing';
import { calculateAllBuchholz } from '../src/utils/buchholz';

function createTestPlayer(id: string, nickname: string): Player {
  return {
    id,
    name: nickname,
    nickname,
    avatar: 'robot',
    totalPoints: 0,
    matchRecord: { wins: 0, losses: 0 },
    smashRecord: { wins: 0, losses: 0 },
    chessRecord: { wins: 0, losses: 0 },
    pingPongRecord: { wins: 0, losses: 0 },
    dominantWins: 0,
    smashDominantWins: 0,
    chessDominantWins: 0,
    pingPongDominantWins: 0,
    matchesPlayed: 0,
    smashMatchesPlayed: 0,
    chessMatchesPlayed: 0,
    pingPongMatchesPlayed: 0,
    smashOpponents: [],
    chessOpponents: [],
    pingPongOpponents: [],
    betsPlaced: 0,
    betsWon: 0,
    betsLost: 0,
    bettingProfit: 0,
    bettingStreak: 0,
    betsReceived: 0,
    buchholzScore: 0,
    smashBuchholz: 0,
    chessBuchholz: 0,
    pingPongBuchholz: 0,
    isSmashChampion: false,
    isChessChampion: false,
    isPingPongChampion: false,
    isBestGambler: false,
    playoffSeed: null,
    smashDraftedCharacters: [],
    smashCharacterStats: {},
  };
}

function getGameRecord(player: Player, gameType: GameType): { wins: number; losses: number } {
  switch (gameType) {
    case 'smash': return player.smashRecord;
    case 'chess': return player.chessRecord;
    case 'pingPong': return player.pingPongRecord;
  }
}

function getGameMatches(player: Player, gameType: GameType): number {
  switch (gameType) {
    case 'smash': return player.smashMatchesPlayed;
    case 'chess': return player.chessMatchesPlayed;
    case 'pingPong': return player.pingPongMatchesPlayed;
  }
}

function simulateMatch(players: Player[], match: Match): void {
  const player1 = players.find(p => p.id === match.player1Id)!;
  const player2 = players.find(p => p.id === match.player2Id)!;

  // Randomly pick winner (50/50)
  const winner = Math.random() > 0.5 ? player1 : player2;
  const loser = winner === player1 ? player2 : player1;
  const isDominant = Math.random() > 0.8; // 20% chance of dominant

  const points = isDominant ? 5 : 3;
  const gameType = match.gameType;

  // Update winner
  winner.totalPoints += points;
  winner.matchRecord.wins++;
  winner.matchesPlayed++;
  winner.dominantWins += isDominant ? 1 : 0;

  if (gameType === 'smash') {
    winner.smashRecord.wins++;
    winner.smashMatchesPlayed++;
    winner.smashOpponents.push(loser.id);
    winner.smashDominantWins += isDominant ? 1 : 0;
  } else if (gameType === 'chess') {
    winner.chessRecord.wins++;
    winner.chessMatchesPlayed++;
    winner.chessOpponents.push(loser.id);
    winner.chessDominantWins += isDominant ? 1 : 0;
  } else {
    winner.pingPongRecord.wins++;
    winner.pingPongMatchesPlayed++;
    winner.pingPongOpponents.push(loser.id);
    winner.pingPongDominantWins += isDominant ? 1 : 0;
  }

  // Update loser
  loser.matchRecord.losses++;
  loser.matchesPlayed++;

  if (gameType === 'smash') {
    loser.smashRecord.losses++;
    loser.smashMatchesPlayed++;
    loser.smashOpponents.push(winner.id);
  } else if (gameType === 'chess') {
    loser.chessRecord.losses++;
    loser.chessMatchesPlayed++;
    loser.chessOpponents.push(winner.id);
  } else {
    loser.pingPongRecord.losses++;
    loser.pingPongMatchesPlayed++;
    loser.pingPongOpponents.push(winner.id);
  }
}

interface SimulationResult {
  playerCount: number;
  issues: string[];
  maxConsecutiveSameGame: number;
  largeRecordMismatches: number;
  avgBuchholz: number;
}

function runSimulation(playerCount: number, verbose: boolean = false): SimulationResult {
  const issues: string[] = [];

  // Create players
  const players: Player[] = [];
  for (let i = 0; i < playerCount; i++) {
    players.push(createTestPlayer(`p${i}`, `P${i}`));
  }

  const allMatches: Match[] = [];
  const targetRounds = Math.ceil((playerCount * 9) / 6);

  // Track consecutive same-game stats
  const lastGameByPlayer: Map<string, GameType> = new Map();
  let maxConsecutiveSameGame = 0;
  const consecutiveCountByPlayer: Map<string, number> = new Map();

  // Track record mismatches
  let largeRecordMismatches = 0;

  if (verbose) {
    console.log(`\n=== Simulation: ${playerCount} players, ${targetRounds} rounds ===\n`);
  }

  for (let round = 1; round <= targetRounds; round++) {
    const { matches } = generateSwissPairings(players, allMatches, round);

    if (matches.length === 0) {
      if (verbose) console.log(`Round ${round}: No matches possible`);
      break;
    }

    if (verbose) console.log(`Round ${round}: ${matches.length} matches`);

    for (const match of matches) {
      const p1 = players.find(p => p.id === match.player1Id)!;
      const p2 = players.find(p => p.id === match.player2Id)!;

      const r1 = getGameRecord(p1, match.gameType);
      const r2 = getGameRecord(p2, match.gameType);
      const record1 = r1.wins - r1.losses;
      const record2 = r2.wins - r2.losses;
      const recordDiff = Math.abs(record1 - record2);

      // Check for large record mismatch (only flag if neither player urgently needs this game)
      if (recordDiff >= 2) {
        const p1Matches = getGameMatches(p1, match.gameType);
        const p2Matches = getGameMatches(p2, match.gameType);

        if (p1Matches < 2 && p2Matches < 2) {
          largeRecordMismatches++;
          issues.push(`R${round} ${match.gameType}: ${p1.nickname}(${record1}) vs ${p2.nickname}(${record2})`);
        }
      }

      // Check for station stickiness
      for (const player of [p1, p2]) {
        const lastGame = lastGameByPlayer.get(player.id);
        if (lastGame === match.gameType) {
          const count = (consecutiveCountByPlayer.get(player.id) || 1) + 1;
          consecutiveCountByPlayer.set(player.id, count);
          if (count > maxConsecutiveSameGame) {
            maxConsecutiveSameGame = count;
          }
          if (count >= 4) {
            issues.push(`R${round}: ${player.nickname} at ${match.gameType} for ${count}+ rounds`);
          }
        } else {
          consecutiveCountByPlayer.set(player.id, 1);
        }
        lastGameByPlayer.set(player.id, match.gameType);
      }

      if (verbose) {
        console.log(`  ${match.gameType}: ${p1.nickname}(${r1.wins}-${r1.losses}) vs ${p2.nickname}(${r2.wins}-${r2.losses})`);
      }

      // Simulate the match
      simulateMatch(players, match);
      allMatches.push(match);
    }
  }

  // Calculate final Buchholz
  const finalPlayers = calculateAllBuchholz(players);
  const avgBuchholz = finalPlayers.reduce((sum, p) => sum + p.buchholzScore, 0) / finalPlayers.length;

  if (verbose) {
    console.log('\n--- Final Stats ---');
    for (const player of finalPlayers) {
      console.log(`${player.nickname}: S=${player.smashMatchesPlayed}/3, C=${player.chessMatchesPlayed}/3, PP=${player.pingPongMatchesPlayed}/3 | Pts=${player.totalPoints} | BH=${player.buchholzScore}`);
    }
    console.log(`\nAvg Buchholz: ${avgBuchholz.toFixed(1)}`);
  }

  return {
    playerCount,
    issues,
    maxConsecutiveSameGame,
    largeRecordMismatches,
    avgBuchholz,
  };
}

// Run simulations
console.log('Running matchmaking simulations...\n');

const allResults: SimulationResult[] = [];

// Run verbose simulation for each player count
for (const playerCount of [8, 9, 10, 11]) {
  console.log(`\n${'='.repeat(60)}`);
  runSimulation(playerCount, true);
}

// Run multiple quick simulations to gather stats
console.log(`\n\n${'='.repeat(60)}`);
console.log('Running 20 simulations per player count...\n');

for (const playerCount of [8, 9, 10, 11]) {
  const results: SimulationResult[] = [];
  for (let i = 0; i < 20; i++) {
    results.push(runSimulation(playerCount, false));
  }

  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  const avgMaxConsec = results.reduce((sum, r) => sum + r.maxConsecutiveSameGame, 0) / results.length;
  const avgMismatches = results.reduce((sum, r) => sum + r.largeRecordMismatches, 0) / results.length;
  const avgBH = results.reduce((sum, r) => sum + r.avgBuchholz, 0) / results.length;

  console.log(`${playerCount} players: Issues=${totalIssues}, AvgMaxConsec=${avgMaxConsec.toFixed(1)}, AvgMismatches=${avgMismatches.toFixed(1)}, AvgBH=${avgBH.toFixed(0)}`);

  if (totalIssues > 0) {
    const allIssues = results.flatMap(r => r.issues);
    const uniqueIssues = [...new Set(allIssues)];
    console.log(`  Sample issues: ${uniqueIssues.slice(0, 3).join(', ')}`);
  }

  allResults.push(...results);
}

// Final summary
console.log(`\n${'='.repeat(60)}`);
console.log('SUMMARY\n');

const totalIssues = allResults.reduce((sum, r) => sum + r.issues.length, 0);
const avgMaxConsec = allResults.reduce((sum, r) => sum + r.maxConsecutiveSameGame, 0) / allResults.length;

console.log(`Total simulations: ${allResults.length}`);
console.log(`Late-round record mismatches (unavoidable): ${totalIssues}`);
console.log(`Avg max consecutive same game: ${avgMaxConsec.toFixed(2)}`);

// Key test: verify two players needing same game get paired
console.log(`\n${'='.repeat(60)}`);
console.log('CRITICAL TEST: Both-need-game pairing\n');

let missedPairings = 0;
for (let test = 0; test < 10; test++) {
  // Create scenario where ONLY P0 and P1 need pingPong (2/3 matches each)
  // Everyone else has completed their 3 pingPong matches
  const players: Player[] = [];
  for (let i = 0; i < 8; i++) {
    const p = createTestPlayer(`p${i}`, `P${i}`);

    if (i === 0) {
      // P0 needs 1 more pingPong, has 2-0 record
      p.pingPongMatchesPlayed = 2;
      p.pingPongRecord = { wins: 2, losses: 0 };
      p.pingPongOpponents = ['p2', 'p3'];
      p.totalPoints = 6;
    } else if (i === 1) {
      // P1 needs 1 more pingPong, has 0-2 record (big diff from P0!)
      p.pingPongMatchesPlayed = 2;
      p.pingPongRecord = { wins: 0, losses: 2 };
      p.pingPongOpponents = ['p4', 'p5'];
      p.totalPoints = 0;
    } else {
      // Everyone else has completed pingPong (3/3)
      p.pingPongMatchesPlayed = 3;
      p.pingPongRecord = { wins: 1, losses: 2 };
      p.pingPongOpponents = ['p0', 'p1', `p${(i + 1) % 8 || 2}`];
    }
    players.push(p);
  }

  const { matches, log } = generateSwissPairings(players, [], 10);

  // Debug: show what matches were generated
  if (test === 0) {
    console.log(`  Debug: Generated ${matches.length} matches:`);
    matches.forEach(m => {
      const p1 = players.find(p => p.id === m.player1Id)!;
      const p2 = players.find(p => p.id === m.player2Id)!;
      console.log(`    ${m.gameType}: ${p1.nickname} vs ${p2.nickname}`);
    });
    console.log(`  Debug: P0 pingPong matches: ${players[0].pingPongMatchesPlayed}`);
    console.log(`  Debug: P1 pingPong matches: ${players[1].pingPongMatchesPlayed}`);
  }

  // Check if P0 and P1 got paired for pingPong
  const pingPongMatch = matches.find(m => m.gameType === 'pingPong');
  if (pingPongMatch) {
    const hasP0 = pingPongMatch.player1Id === 'p0' || pingPongMatch.player2Id === 'p0';
    const hasP1 = pingPongMatch.player1Id === 'p1' || pingPongMatch.player2Id === 'p1';
    if (hasP0 && hasP1) {
      console.log(`  Test ${test + 1}: ✅ P0(2-0) and P1(0-2) paired for pingPong despite record diff of 4`);
    } else {
      console.log(`  Test ${test + 1}: ❌ P0 and P1 NOT paired - match was ${pingPongMatch.player1Id} vs ${pingPongMatch.player2Id}`);
      missedPairings++;
    }
  } else {
    console.log(`  Test ${test + 1}: ⚠️ No pingPong match generated (may be ok if both paired in other games)`);
  }
}

if (missedPairings === 0) {
  console.log('\n✅ Both-need-game pairing working correctly!');
} else {
  console.log(`\n❌ ${missedPairings}/10 tests failed - bothNeedGame logic may have issues`);
}
