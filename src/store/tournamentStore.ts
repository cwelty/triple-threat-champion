import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Player,
  Match,
  Bet,
  Round,
  TournamentState,
  TournamentPhase,
  GameType,
  PlayoffBracket,
} from '../types';
import { generateSwissPairings, type MatchmakingLog } from '../utils/swissPairing';
import { calculateAllBuchholz } from '../utils/buchholz';
import { findUnderservedPlayers, findVolunteer } from '../utils/syncRounds';
import { determineGameChampion, breakTie } from '../utils/tiebreakers';

// Calculate optimal number of rounds based on player count
// Each player should play ~9 matches (3 per game type), 6 players per round
function calculateTotalRounds(playerCount: number): number {
  const targetMatches = 9; // 3 per game type
  const playersPerRound = 6;
  return Math.ceil((playerCount * targetMatches) / playersPerRound);
}

function createEmptyPlayer(id: string, name: string, nickname: string, avatar: string): Player {
  return {
    id,
    name,
    nickname,
    avatar,
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
    betsReceived: 0,
    buchholzScore: 0,
    smashBuchholz: 0,
    chessBuchholz: 0,
    pingPongBuchholz: 0,
    isSmashChampion: false,
    isChessChampion: false,
    isPingPongChampion: false,
    isBestBettor: false,
    playoffSeed: null,
  };
}

function createEmptyPlayoffBracket(): PlayoffBracket {
  return {
    semifinal1: { player1Id: null, player2Id: null, winnerId: null, gameType: null },
    semifinal2: { player1Id: null, player2Id: null, winnerId: null, gameType: null },
    thirdPlace: { player1Id: null, player2Id: null, winnerId: null, gameType: null, skipped: false },
    finals: { player1Id: null, player2Id: null, player1Wins: 0, player2Wins: 0, games: [] },
  };
}

interface TournamentStore extends TournamentState {
  // Registration actions
  registerPlayer: (name: string, nickname: string, avatar: string) => void;
  removePlayer: (id: string) => void;
  startTournament: () => void;

  // Round actions
  startRound: () => void;
  closeBetting: () => void;
  placeBet: (bettorId: string, matchId: string, predictedWinnerId: string) => void;
  removeBet: (bettorId: string) => void;
  recordMatchResult: (matchId: string, winnerId: string, isDominant: boolean) => void;
  editMatchResult: (matchId: string, newWinnerId: string, newIsDominant: boolean) => void;
  completeRound: () => void;

  // Sync round actions
  startSyncRounds: () => void;
  acceptVolunteer: (syncMatchIndex: number) => void;
  declineVolunteer: (syncMatchIndex: number) => void;
  recordSyncResult: (matchId: string, winnerId: string, isDominant: boolean) => void;
  completeSyncRounds: () => void;

  // Champion/playoff actions
  revealChampions: () => void;
  setupPlayoffs: () => void;
  selectSemifinalGame: (semifinalNumber: 1 | 2, gameType: GameType) => void;
  recordSemifinalResult: (semifinalNumber: 1 | 2, winnerId: string) => void;
  setupThirdPlaceMatch: () => void;
  selectThirdPlaceGame: (gameType: GameType) => void;
  recordThirdPlaceResult: (winnerId: string) => void;
  skipThirdPlaceMatch: () => void;
  selectFinalsGame: (gameNumber: number, gameType: GameType) => void;
  recordFinalsResult: (winnerId: string, isDominant: boolean) => void;
  placePlayoffBet: (bettorId: string, matchKey: string, predictedWinnerId: string) => void;
  removePlayoffBet: (bettorId: string, matchKey: string) => void;
  awardBestBettor: () => void;
  completeTournament: () => void;

  // Playoff betting state
  playoffBets: Bet[];

  // Matchmaking logs
  matchmakingLogs: MatchmakingLog[];

  // Utility
  getPlayer: (id: string) => Player | undefined;
  getCurrentRound: () => Round | undefined;
  getOnDeckPlayers: () => Player[];
  getSortedStandings: () => Player[];
  getGameStandings: (gameType: GameType) => Player[];
  resetTournament: () => void;
}

export const useTournamentStore = create<TournamentStore>()(
  persist(
    (set, get) => ({
      // Initial state
      phase: 'registration' as TournamentPhase,
      currentRound: 0,
      totalRounds: 17, // Default for 11 players, recalculated on start
      players: [],
      rounds: [],
      playoffBracket: createEmptyPlayoffBracket(),
      playoffBets: [],
      matchmakingLogs: [],
      smashChampionId: null,
      chessChampionId: null,
      pingPongChampionId: null,
      bestBettorId: null,
      tripleThreatchampionId: null,

      // Registration actions
      registerPlayer: (name, nickname, avatar) => {
        const id = crypto.randomUUID();
        const newPlayer = createEmptyPlayer(id, name, nickname, avatar);
        set((state) => ({
          players: [...state.players, newPlayer],
        }));
      },

      removePlayer: (id) => {
        set((state) => ({
          players: state.players.filter((p) => p.id !== id),
        }));
      },

      startTournament: () => {
        const { players } = get();
        if (players.length < 8 || players.length > 11) return;

        // Calculate total rounds based on player count
        const totalRounds = calculateTotalRounds(players.length);

        // Generate first round pairings
        const { matches, log } = generateSwissPairings(players, [], 1);
        const round: Round = {
          roundNumber: 1,
          type: 'swiss',
          matches,
          bets: [],
          isComplete: false,
          bettingOpen: true,
        };

        set({
          phase: 'swiss',
          currentRound: 1,
          totalRounds,
          rounds: [round],
          matchmakingLogs: [log],
        });
      },

      // Round actions
      startRound: () => {
        const { players, rounds, currentRound, matchmakingLogs } = get();
        const allMatches = rounds.flatMap((r) => r.matches);
        const { matches, log } = generateSwissPairings(players, allMatches, currentRound + 1);

        const round: Round = {
          roundNumber: currentRound + 1,
          type: 'swiss',
          matches,
          bets: [],
          isComplete: false,
          bettingOpen: true,
        };

        set({
          currentRound: currentRound + 1,
          rounds: [...rounds, round],
          matchmakingLogs: [...matchmakingLogs, log],
        });
      },

      closeBetting: () => {
        set((state) => {
          const rounds = [...state.rounds];
          const currentRoundIndex = rounds.findIndex(
            (r) => r.roundNumber === state.currentRound
          );
          if (currentRoundIndex >= 0) {
            rounds[currentRoundIndex] = {
              ...rounds[currentRoundIndex],
              bettingOpen: false,
            };
          }
          return { rounds };
        });
      },

      placeBet: (bettorId, matchId, predictedWinnerId) => {
        const bet: Bet = {
          id: crypto.randomUUID(),
          matchId,
          bettorId,
          predictedWinnerId,
          isCorrect: null,
        };

        set((state) => {
          const rounds = [...state.rounds];
          const currentRoundIndex = rounds.findIndex(
            (r) => r.roundNumber === state.currentRound
          );
          if (currentRoundIndex >= 0 && rounds[currentRoundIndex].bettingOpen) {
            // Remove any existing bet from this bettor (allows changing bets)
            const existingBets = rounds[currentRoundIndex].bets.filter(
              (b) => b.bettorId !== bettorId
            );
            rounds[currentRoundIndex] = {
              ...rounds[currentRoundIndex],
              bets: [...existingBets, bet],
            };
          }
          return { rounds };
        });
      },

      removeBet: (bettorId) => {
        set((state) => {
          const rounds = [...state.rounds];
          const currentRoundIndex = rounds.findIndex(
            (r) => r.roundNumber === state.currentRound
          );
          if (currentRoundIndex >= 0 && rounds[currentRoundIndex].bettingOpen) {
            rounds[currentRoundIndex] = {
              ...rounds[currentRoundIndex],
              bets: rounds[currentRoundIndex].bets.filter(
                (b) => b.bettorId !== bettorId
              ),
            };
          }
          return { rounds };
        });
      },

      recordMatchResult: (matchId, winnerId, isDominant) => {
        set((state) => {
          const rounds = [...state.rounds];
          const players = [...state.players];

          const currentRoundIndex = rounds.findIndex(
            (r) => r.roundNumber === state.currentRound
          );
          if (currentRoundIndex < 0) return state;

          const round = rounds[currentRoundIndex];
          const matchIndex = round.matches.findIndex((m) => m.id === matchId);
          if (matchIndex < 0) return state;

          const match = round.matches[matchIndex];
          const loserId = match.player1Id === winnerId ? match.player2Id : match.player1Id;
          const points = isDominant ? 5 : 3;

          // Update match
          rounds[currentRoundIndex].matches[matchIndex] = {
            ...match,
            winnerId,
            isDominant,
          };

          // Update winner
          const winnerIndex = players.findIndex((p) => p.id === winnerId);
          if (winnerIndex >= 0) {
            const winner = players[winnerIndex];
            const gameRecord = match.gameType === 'smash' ? 'smashRecord' :
                              match.gameType === 'chess' ? 'chessRecord' : 'pingPongRecord';
            const gameMatches = match.gameType === 'smash' ? 'smashMatchesPlayed' :
                               match.gameType === 'chess' ? 'chessMatchesPlayed' : 'pingPongMatchesPlayed';
            const gameOpponents = match.gameType === 'smash' ? 'smashOpponents' :
                                 match.gameType === 'chess' ? 'chessOpponents' : 'pingPongOpponents';
            const gameDominantWins = match.gameType === 'smash' ? 'smashDominantWins' :
                                    match.gameType === 'chess' ? 'chessDominantWins' : 'pingPongDominantWins';

            players[winnerIndex] = {
              ...winner,
              totalPoints: winner.totalPoints + points,
              matchRecord: { ...winner.matchRecord, wins: winner.matchRecord.wins + 1 },
              [gameRecord]: { ...winner[gameRecord], wins: winner[gameRecord].wins + 1 },
              dominantWins: winner.dominantWins + (isDominant ? 1 : 0),
              [gameDominantWins]: winner[gameDominantWins] + (isDominant ? 1 : 0),
              matchesPlayed: winner.matchesPlayed + 1,
              [gameMatches]: winner[gameMatches] + 1,
              [gameOpponents]: [...winner[gameOpponents], loserId],
            };
          }

          // Update loser
          const loserIndex = players.findIndex((p) => p.id === loserId);
          if (loserIndex >= 0) {
            const loser = players[loserIndex];
            const gameRecord = match.gameType === 'smash' ? 'smashRecord' :
                              match.gameType === 'chess' ? 'chessRecord' : 'pingPongRecord';
            const gameMatches = match.gameType === 'smash' ? 'smashMatchesPlayed' :
                               match.gameType === 'chess' ? 'chessMatchesPlayed' : 'pingPongMatchesPlayed';
            const gameOpponents = match.gameType === 'smash' ? 'smashOpponents' :
                                 match.gameType === 'chess' ? 'chessOpponents' : 'pingPongOpponents';

            players[loserIndex] = {
              ...loser,
              matchRecord: { ...loser.matchRecord, losses: loser.matchRecord.losses + 1 },
              [gameRecord]: { ...loser[gameRecord], losses: loser[gameRecord].losses + 1 },
              matchesPlayed: loser.matchesPlayed + 1,
              [gameMatches]: loser[gameMatches] + 1,
              [gameOpponents]: [...loser[gameOpponents], winnerId],
            };
          }

          // Process bets for this match
          const bets = round.bets.filter((b) => b.matchId === matchId);
          for (const bet of bets) {
            const isCorrect = bet.predictedWinnerId === winnerId;
            const betIndex = rounds[currentRoundIndex].bets.findIndex((b) => b.id === bet.id);
            if (betIndex >= 0) {
              rounds[currentRoundIndex].bets[betIndex] = { ...bet, isCorrect };
            }

            const bettorIndex = players.findIndex((p) => p.id === bet.bettorId);
            if (bettorIndex >= 0) {
              const bettor = players[bettorIndex];
              players[bettorIndex] = {
                ...bettor,
                betsPlaced: bettor.betsPlaced + 1,
                betsWon: bettor.betsWon + (isCorrect ? 1 : 0),
                betsLost: bettor.betsLost + (isCorrect ? 0 : 1),
                bettingProfit: bettor.bettingProfit + (isCorrect ? 1 : -1),
                totalPoints: bettor.totalPoints + (isCorrect ? 1 : -1),
              };
            }

            // Track bets received (fan favorite)
            const predictedPlayerIndex = players.findIndex((p) => p.id === bet.predictedWinnerId);
            if (predictedPlayerIndex >= 0) {
              players[predictedPlayerIndex] = {
                ...players[predictedPlayerIndex],
                betsReceived: players[predictedPlayerIndex].betsReceived + 1,
              };
            }
          }

          return { rounds, players };
        });
      },

      editMatchResult: (matchId, newWinnerId, newIsDominant) => {
        set((state) => {
          const rounds = [...state.rounds];
          const players = [...state.players];

          // Find the match in any round
          let roundIndex = -1;
          let matchIndex = -1;
          for (let ri = 0; ri < rounds.length; ri++) {
            const mi = rounds[ri].matches.findIndex((m) => m.id === matchId);
            if (mi >= 0) {
              roundIndex = ri;
              matchIndex = mi;
              break;
            }
          }

          if (roundIndex < 0 || matchIndex < 0) return state;

          const match = rounds[roundIndex].matches[matchIndex];
          const oldWinnerId = match.winnerId;
          const oldIsDominant = match.isDominant;

          // If no previous result, just record normally
          if (!oldWinnerId) {
            // This shouldn't happen in edit flow, but handle it
            return state;
          }

          const oldLoserId = match.player1Id === oldWinnerId ? match.player2Id : match.player1Id;
          const newLoserId = match.player1Id === newWinnerId ? match.player2Id : match.player1Id;
          const oldPoints = oldIsDominant ? 5 : 3;
          const newPoints = newIsDominant ? 5 : 3;

          const gameRecord = match.gameType === 'smash' ? 'smashRecord' :
                            match.gameType === 'chess' ? 'chessRecord' : 'pingPongRecord';
          const gameDominantWins = match.gameType === 'smash' ? 'smashDominantWins' :
                                  match.gameType === 'chess' ? 'chessDominantWins' : 'pingPongDominantWins';

          // Reverse old winner's stats
          const oldWinnerIndex = players.findIndex((p) => p.id === oldWinnerId);
          if (oldWinnerIndex >= 0) {
            const oldWinner = players[oldWinnerIndex];
            players[oldWinnerIndex] = {
              ...oldWinner,
              totalPoints: oldWinner.totalPoints - oldPoints,
              matchRecord: { ...oldWinner.matchRecord, wins: oldWinner.matchRecord.wins - 1 },
              [gameRecord]: { ...oldWinner[gameRecord], wins: oldWinner[gameRecord].wins - 1 },
              dominantWins: oldWinner.dominantWins - (oldIsDominant ? 1 : 0),
              [gameDominantWins]: oldWinner[gameDominantWins] - (oldIsDominant ? 1 : 0),
            };
          }

          // Reverse old loser's stats
          const oldLoserIndex = players.findIndex((p) => p.id === oldLoserId);
          if (oldLoserIndex >= 0) {
            const oldLoser = players[oldLoserIndex];
            players[oldLoserIndex] = {
              ...oldLoser,
              matchRecord: { ...oldLoser.matchRecord, losses: oldLoser.matchRecord.losses - 1 },
              [gameRecord]: { ...oldLoser[gameRecord], losses: oldLoser[gameRecord].losses - 1 },
            };
          }

          // Reverse bet outcomes
          const bets = rounds[roundIndex].bets.filter((b) => b.matchId === matchId);
          for (const bet of bets) {
            if (bet.isCorrect !== null) {
              const wasCorrect = bet.isCorrect;
              const bettorIndex = players.findIndex((p) => p.id === bet.bettorId);
              if (bettorIndex >= 0) {
                const bettor = players[bettorIndex];
                players[bettorIndex] = {
                  ...bettor,
                  betsWon: bettor.betsWon - (wasCorrect ? 1 : 0),
                  betsLost: bettor.betsLost - (wasCorrect ? 0 : 1),
                  bettingProfit: bettor.bettingProfit - (wasCorrect ? 1 : -1),
                  totalPoints: bettor.totalPoints - (wasCorrect ? 1 : -1),
                };
              }
            }
          }

          // Apply new winner's stats
          const newWinnerIndex = players.findIndex((p) => p.id === newWinnerId);
          if (newWinnerIndex >= 0) {
            const newWinner = players[newWinnerIndex];
            players[newWinnerIndex] = {
              ...newWinner,
              totalPoints: newWinner.totalPoints + newPoints,
              matchRecord: { ...newWinner.matchRecord, wins: newWinner.matchRecord.wins + 1 },
              [gameRecord]: { ...newWinner[gameRecord], wins: newWinner[gameRecord].wins + 1 },
              dominantWins: newWinner.dominantWins + (newIsDominant ? 1 : 0),
              [gameDominantWins]: newWinner[gameDominantWins] + (newIsDominant ? 1 : 0),
            };
          }

          // Apply new loser's stats
          const newLoserIndex = players.findIndex((p) => p.id === newLoserId);
          if (newLoserIndex >= 0) {
            const newLoser = players[newLoserIndex];
            players[newLoserIndex] = {
              ...newLoser,
              matchRecord: { ...newLoser.matchRecord, losses: newLoser.matchRecord.losses + 1 },
              [gameRecord]: { ...newLoser[gameRecord], losses: newLoser[gameRecord].losses + 1 },
            };
          }

          // Apply new bet outcomes
          for (const bet of bets) {
            const isCorrect = bet.predictedWinnerId === newWinnerId;
            const betIndex = rounds[roundIndex].bets.findIndex((b) => b.id === bet.id);
            if (betIndex >= 0) {
              rounds[roundIndex].bets[betIndex] = { ...bet, isCorrect };
            }

            const bettorIndex = players.findIndex((p) => p.id === bet.bettorId);
            if (bettorIndex >= 0) {
              const bettor = players[bettorIndex];
              players[bettorIndex] = {
                ...bettor,
                betsWon: bettor.betsWon + (isCorrect ? 1 : 0),
                betsLost: bettor.betsLost + (isCorrect ? 0 : 1),
                bettingProfit: bettor.bettingProfit + (isCorrect ? 1 : -1),
                totalPoints: bettor.totalPoints + (isCorrect ? 1 : -1),
              };
            }
          }

          // Update match
          rounds[roundIndex].matches[matchIndex] = {
            ...match,
            winnerId: newWinnerId,
            isDominant: newIsDominant,
          };

          return { rounds, players };
        });
      },

      completeRound: () => {
        set((state) => {
          const rounds = [...state.rounds];
          const currentRoundIndex = rounds.findIndex(
            (r) => r.roundNumber === state.currentRound
          );
          if (currentRoundIndex >= 0) {
            rounds[currentRoundIndex] = {
              ...rounds[currentRoundIndex],
              isComplete: true,
            };
          }

          // Check if we should transition to sync rounds
          const nextPhase = state.currentRound >= state.totalRounds ? 'sync' : state.phase;

          return { rounds, phase: nextPhase };
        });
      },

      // Sync round actions
      startSyncRounds: () => {
        const { players, totalRounds } = get();
        const underserved = findUnderservedPlayers(players);
        const syncRoundNumber = totalRounds + 1;

        // Create sync round matches - track assigned volunteers to avoid duplicates
        const syncMatches: Match[] = [];
        const assignedVolunteerIds: string[] = [];

        for (const shortage of underserved) {
          const gameType = shortage.smashNeeded > 0 ? 'smash' :
                          shortage.chessNeeded > 0 ? 'chess' : 'pingPong';

          // Exclude volunteers already assigned to other sync matches
          const volunteerResult = findVolunteer(
            players,
            shortage.playerId,
            gameType,
            assignedVolunteerIds
          );

          // Track this volunteer so they can't be assigned again
          if (volunteerResult.volunteer) {
            assignedVolunteerIds.push(volunteerResult.volunteer.id);
          }

          syncMatches.push({
            id: crypto.randomUUID(),
            roundNumber: syncRoundNumber,
            gameType,
            player1Id: shortage.playerId,
            player2Id: volunteerResult.volunteer?.id ?? '',
            winnerId: null,
            isDominant: false,
            isSyncRound: true,
            isPlayoff: false,
            playoffRound: null,
            underservedPlayerId: shortage.playerId,
            volunteerId: volunteerResult.volunteer?.id ?? null,
            isVolunteerExhausted: volunteerResult.isExhausted,
            isVolunteerForced: volunteerResult.isForced,
          });
        }

        const round: Round = {
          roundNumber: syncRoundNumber,
          type: 'sync',
          matches: syncMatches,
          bets: [],
          isComplete: false,
          bettingOpen: true,
        };

        set((state) => ({
          currentRound: syncRoundNumber,
          rounds: [...state.rounds, round],
        }));
      },

      acceptVolunteer: (_syncMatchIndex) => {
        // Volunteer accepted - no action needed, match proceeds
      },

      declineVolunteer: (syncMatchIndex) => {
        set((state) => {
          const rounds = [...state.rounds];
          const syncRoundIndex = rounds.findIndex((r) => r.type === 'sync');
          if (syncRoundIndex < 0) return state;

          const match = rounds[syncRoundIndex].matches[syncMatchIndex];
          if (!match) return state;

          // Collect all previously declined volunteers for this match
          const currentVolunteerId = match.volunteerId;
          const underservedId = match.underservedPlayerId;
          const declinedIds = match.declinedVolunteerIds ?? [];

          // Also exclude volunteers already assigned to OTHER incomplete sync matches
          const otherAssignedVolunteers = rounds[syncRoundIndex].matches
            .filter((m, idx) => idx !== syncMatchIndex && !m.winnerId && m.volunteerId)
            .map((m) => m.volunteerId as string);

          const excludeIds = [
            ...declinedIds,
            currentVolunteerId,
            underservedId,
            ...otherAssignedVolunteers,
          ].filter(Boolean) as string[];

          const volunteerResult = findVolunteer(
            state.players,
            underservedId!,
            match.gameType,
            excludeIds
          );

          if (volunteerResult.volunteer) {
            rounds[syncRoundIndex].matches[syncMatchIndex] = {
              ...match,
              player2Id: volunteerResult.volunteer.id,
              volunteerId: volunteerResult.volunteer.id,
              declinedVolunteerIds: [...declinedIds, currentVolunteerId].filter(Boolean) as string[],
              isVolunteerExhausted: volunteerResult.isExhausted,
              isVolunteerForced: volunteerResult.isForced,
            };
          } else {
            // No more volunteers available (shouldn't happen with forced selection)
            rounds[syncRoundIndex].matches[syncMatchIndex] = {
              ...match,
              player2Id: '',
              volunteerId: null,
              declinedVolunteerIds: [...declinedIds, currentVolunteerId].filter(Boolean) as string[],
              isVolunteerExhausted: true,
              isVolunteerForced: false,
            };
          }

          return { rounds };
        });
      },

      recordSyncResult: (matchId, winnerId, isDominant) => {
        set((state) => {
          const rounds = [...state.rounds];
          const players = [...state.players];

          const syncRoundIndex = rounds.findIndex((r) => r.type === 'sync');
          if (syncRoundIndex < 0) return state;

          const matchIndex = rounds[syncRoundIndex].matches.findIndex((m) => m.id === matchId);
          if (matchIndex < 0) return state;

          const match = rounds[syncRoundIndex].matches[matchIndex];
          const underservedId = match.underservedPlayerId;
          const loserId = match.player1Id === winnerId ? match.player2Id : match.player1Id;

          // Update match
          rounds[syncRoundIndex].matches[matchIndex] = {
            ...match,
            winnerId,
            isDominant,
          };

          // Only underserved player's stats are affected
          if (underservedId) {
            const underservedIndex = players.findIndex((p) => p.id === underservedId);
            if (underservedIndex >= 0) {
              const underserved = players[underservedIndex];
              const didWin = underservedId === winnerId;
              const points = didWin ? (isDominant ? 5 : 3) : 0;
              const opponentId = underservedId === match.player1Id ? match.player2Id : match.player1Id;

              const gameRecord = match.gameType === 'smash' ? 'smashRecord' :
                                match.gameType === 'chess' ? 'chessRecord' : 'pingPongRecord';
              const gameMatches = match.gameType === 'smash' ? 'smashMatchesPlayed' :
                                 match.gameType === 'chess' ? 'chessMatchesPlayed' : 'pingPongMatchesPlayed';
              const gameOpponents = match.gameType === 'smash' ? 'smashOpponents' :
                                   match.gameType === 'chess' ? 'chessOpponents' : 'pingPongOpponents';
              const gameDominantWins = match.gameType === 'smash' ? 'smashDominantWins' :
                                      match.gameType === 'chess' ? 'chessDominantWins' : 'pingPongDominantWins';

              players[underservedIndex] = {
                ...underserved,
                totalPoints: underserved.totalPoints + points,
                matchRecord: {
                  wins: underserved.matchRecord.wins + (didWin ? 1 : 0),
                  losses: underserved.matchRecord.losses + (didWin ? 0 : 1),
                },
                [gameRecord]: {
                  wins: underserved[gameRecord].wins + (didWin ? 1 : 0),
                  losses: underserved[gameRecord].losses + (didWin ? 0 : 1),
                },
                dominantWins: underserved.dominantWins + (didWin && isDominant ? 1 : 0),
                [gameDominantWins]: underserved[gameDominantWins] + (didWin && isDominant ? 1 : 0),
                matchesPlayed: underserved.matchesPlayed + 1,
                [gameMatches]: underserved[gameMatches] + 1,
                [gameOpponents]: [...underserved[gameOpponents], opponentId],
              };
            }
          }

          // Process bets (only affect underserved player's outcome)
          const bets = rounds[syncRoundIndex].bets.filter((b) => b.matchId === matchId);
          for (const bet of bets) {
            // Bet is correct if predicted winner matches and underserved player was predicted
            const isCorrect = bet.predictedWinnerId === winnerId;
            const betIndex = rounds[syncRoundIndex].bets.findIndex((b) => b.id === bet.id);
            if (betIndex >= 0) {
              rounds[syncRoundIndex].bets[betIndex] = { ...bet, isCorrect };
            }

            const bettorIndex = players.findIndex((p) => p.id === bet.bettorId);
            if (bettorIndex >= 0) {
              const bettor = players[bettorIndex];
              players[bettorIndex] = {
                ...bettor,
                betsPlaced: bettor.betsPlaced + 1,
                betsWon: bettor.betsWon + (isCorrect ? 1 : 0),
                betsLost: bettor.betsLost + (isCorrect ? 0 : 1),
                bettingProfit: bettor.bettingProfit + (isCorrect ? 1 : -1),
                totalPoints: bettor.totalPoints + (isCorrect ? 1 : -1),
              };
            }

            // Track bets received (fan favorite)
            const predictedPlayerIndex = players.findIndex((p) => p.id === bet.predictedWinnerId);
            if (predictedPlayerIndex >= 0) {
              players[predictedPlayerIndex] = {
                ...players[predictedPlayerIndex],
                betsReceived: players[predictedPlayerIndex].betsReceived + 1,
              };
            }
          }

          return { rounds, players };
        });
      },

      completeSyncRounds: () => {
        set((state) => {
          const rounds = [...state.rounds];
          const syncRoundIndex = rounds.findIndex((r) => r.type === 'sync');
          if (syncRoundIndex >= 0) {
            rounds[syncRoundIndex] = {
              ...rounds[syncRoundIndex],
              isComplete: true,
            };
          }

          // Calculate Buchholz scores
          const players = calculateAllBuchholz(state.players);

          // Determine game champions (but don't apply bonuses yet - that happens during reveal)
          const smashChampion = determineGameChampion(players, 'smash');
          const chessChampion = determineGameChampion(players, 'chess');
          const pingPongChampion = determineGameChampion(players, 'pingPong');

          return {
            rounds,
            players,
            phase: 'championsReveal',
            smashChampionId: smashChampion?.id ?? null,
            chessChampionId: chessChampion?.id ?? null,
            pingPongChampionId: pingPongChampion?.id ?? null,
          };
        });
      },

      // Champion/playoff actions
      revealChampions: () => {
        // Apply champion bonuses and move to playoff seeding
        set((state) => {
          const players = [...state.players];

          // Apply bonuses to champions
          if (state.smashChampionId) {
            const idx = players.findIndex((p) => p.id === state.smashChampionId);
            if (idx >= 0) {
              players[idx] = { ...players[idx], isSmashChampion: true, totalPoints: players[idx].totalPoints + 5 };
            }
          }
          if (state.chessChampionId) {
            const idx = players.findIndex((p) => p.id === state.chessChampionId);
            if (idx >= 0) {
              players[idx] = { ...players[idx], isChessChampion: true, totalPoints: players[idx].totalPoints + 5 };
            }
          }
          if (state.pingPongChampionId) {
            const idx = players.findIndex((p) => p.id === state.pingPongChampionId);
            if (idx >= 0) {
              players[idx] = { ...players[idx], isPingPongChampion: true, totalPoints: players[idx].totalPoints + 5 };
            }
          }

          return {
            players,
            phase: 'playoffSeeding',
          };
        });
      },

      setupPlayoffs: () => {
        set((state) => {
          const players = [...state.players];

          // Sort by points, then Buchholz
          const sorted = [...players].sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
            return b.buchholzScore - a.buchholzScore;
          });

          // Assign seeds to top 4
          for (let i = 0; i < Math.min(4, sorted.length); i++) {
            const idx = players.findIndex((p) => p.id === sorted[i].id);
            if (idx >= 0) {
              players[idx] = { ...players[idx], playoffSeed: i + 1 };
            }
          }

          const playoffBracket: PlayoffBracket = {
            semifinal1: {
              player1Id: sorted[0]?.id ?? null,
              player2Id: sorted[3]?.id ?? null,
              winnerId: null,
              gameType: null,
            },
            semifinal2: {
              player1Id: sorted[1]?.id ?? null,
              player2Id: sorted[2]?.id ?? null,
              winnerId: null,
              gameType: null,
            },
            thirdPlace: {
              player1Id: null,
              player2Id: null,
              winnerId: null,
              gameType: null,
              skipped: false,
            },
            finals: {
              player1Id: null,
              player2Id: null,
              player1Wins: 0,
              player2Wins: 0,
              games: [],
            },
          };

          return { players, playoffBracket, phase: 'semifinals' };
        });
      },

      selectSemifinalGame: (semifinalNumber, gameType) => {
        set((state) => ({
          playoffBracket: {
            ...state.playoffBracket,
            [`semifinal${semifinalNumber}`]: {
              ...state.playoffBracket[`semifinal${semifinalNumber}`],
              gameType,
            },
          },
        }));
      },

      recordSemifinalResult: (semifinalNumber, winnerId) => {
        set((state) => {
          const playoffBracket = { ...state.playoffBracket };
          const semifinal = playoffBracket[`semifinal${semifinalNumber}`];
          playoffBracket[`semifinal${semifinalNumber}`] = { ...semifinal, winnerId };

          // Process playoff bets for this semifinal
          const matchKey = `sf${semifinalNumber}`;
          const players = [...state.players];
          const playoffBets = state.playoffBets.map((bet) => {
            if (bet.matchId === matchKey && bet.isCorrect === null) {
              const isCorrect = bet.predictedWinnerId === winnerId;
              // Update bettor stats
              const bettorIdx = players.findIndex((p) => p.id === bet.bettorId);
              if (bettorIdx >= 0) {
                players[bettorIdx] = {
                  ...players[bettorIdx],
                  betsWon: players[bettorIdx].betsWon + (isCorrect ? 1 : 0),
                  betsLost: players[bettorIdx].betsLost + (isCorrect ? 0 : 1),
                  bettingProfit: players[bettorIdx].bettingProfit + (isCorrect ? 1 : -1),
                };
              }
              return { ...bet, isCorrect };
            }
            return bet;
          });

          // Check if both semifinals are complete - go to 3rd place match phase
          if (playoffBracket.semifinal1.winnerId && playoffBracket.semifinal2.winnerId) {
            // Set up 3rd place match with the losers
            const sf1Loser = playoffBracket.semifinal1.player1Id === playoffBracket.semifinal1.winnerId
              ? playoffBracket.semifinal1.player2Id
              : playoffBracket.semifinal1.player1Id;
            const sf2Loser = playoffBracket.semifinal2.player1Id === playoffBracket.semifinal2.winnerId
              ? playoffBracket.semifinal2.player2Id
              : playoffBracket.semifinal2.player1Id;

            playoffBracket.thirdPlace = {
              player1Id: sf1Loser,
              player2Id: sf2Loser,
              winnerId: null,
              gameType: null,
              skipped: false,
            };

            // Set up finals with the winners
            playoffBracket.finals = {
              player1Id: playoffBracket.semifinal1.winnerId,
              player2Id: playoffBracket.semifinal2.winnerId,
              player1Wins: 0,
              player2Wins: 0,
              games: [],
            };
            return { playoffBracket, players, playoffBets, phase: 'thirdPlace' as TournamentPhase };
          }

          return { playoffBracket, players, playoffBets };
        });
      },

      setupThirdPlaceMatch: () => {
        // Already set up in recordSemifinalResult, this is just for explicit calls if needed
      },

      selectThirdPlaceGame: (gameType) => {
        set((state) => ({
          playoffBracket: {
            ...state.playoffBracket,
            thirdPlace: {
              ...state.playoffBracket.thirdPlace,
              gameType,
            },
          },
        }));
      },

      recordThirdPlaceResult: (winnerId) => {
        set((state) => {
          const playoffBracket = { ...state.playoffBracket };
          playoffBracket.thirdPlace = { ...playoffBracket.thirdPlace, winnerId };

          // Process playoff bets for 3rd place match
          const matchKey = '3rd';
          const players = [...state.players];
          const playoffBets = state.playoffBets.map((bet) => {
            if (bet.matchId === matchKey && bet.isCorrect === null) {
              const isCorrect = bet.predictedWinnerId === winnerId;
              const bettorIdx = players.findIndex((p) => p.id === bet.bettorId);
              if (bettorIdx >= 0) {
                players[bettorIdx] = {
                  ...players[bettorIdx],
                  betsWon: players[bettorIdx].betsWon + (isCorrect ? 1 : 0),
                  betsLost: players[bettorIdx].betsLost + (isCorrect ? 0 : 1),
                  bettingProfit: players[bettorIdx].bettingProfit + (isCorrect ? 1 : -1),
                };
              }
              return { ...bet, isCorrect };
            }
            return bet;
          });

          return { playoffBracket, players, playoffBets, phase: 'finals' as TournamentPhase };
        });
      },

      skipThirdPlaceMatch: () => {
        set((state) => ({
          playoffBracket: {
            ...state.playoffBracket,
            thirdPlace: {
              ...state.playoffBracket.thirdPlace,
              skipped: true,
            },
          },
          phase: 'finals' as TournamentPhase,
        }));
      },

      selectFinalsGame: (gameNumber, gameType) => {
        // Store game selection for current finals game
        set((state) => {
          const match: Match = {
            id: crypto.randomUUID(),
            roundNumber: 19 + gameNumber,
            gameType,
            player1Id: state.playoffBracket.finals.player1Id!,
            player2Id: state.playoffBracket.finals.player2Id!,
            winnerId: null,
            isDominant: false,
            isSyncRound: false,
            isPlayoff: true,
            playoffRound: 'final',
            underservedPlayerId: null,
            volunteerId: null,
          };

          return {
            playoffBracket: {
              ...state.playoffBracket,
              finals: {
                ...state.playoffBracket.finals,
                games: [...state.playoffBracket.finals.games, match],
              },
            },
          };
        });
      },

      recordFinalsResult: (winnerId, isDominant) => {
        set((state) => {
          const playoffBracket = { ...state.playoffBracket };
          const finals = { ...playoffBracket.finals };
          const games = [...finals.games];

          // Update the last game
          const lastGameIndex = games.length - 1;
          if (lastGameIndex >= 0) {
            games[lastGameIndex] = { ...games[lastGameIndex], winnerId, isDominant };
          }

          // Process playoff bets for this finals game
          const matchKey = `finals-${games.length}`;
          const players = [...state.players];
          const playoffBets = state.playoffBets.map((bet) => {
            if (bet.matchId === matchKey && bet.isCorrect === null) {
              const isCorrect = bet.predictedWinnerId === winnerId;
              // Update bettor stats
              const bettorIdx = players.findIndex((p) => p.id === bet.bettorId);
              if (bettorIdx >= 0) {
                players[bettorIdx] = {
                  ...players[bettorIdx],
                  betsWon: players[bettorIdx].betsWon + (isCorrect ? 1 : 0),
                  betsLost: players[bettorIdx].betsLost + (isCorrect ? 0 : 1),
                  bettingProfit: players[bettorIdx].bettingProfit + (isCorrect ? 1 : -1),
                };
              }
              return { ...bet, isCorrect };
            }
            return bet;
          });

          // Update wins
          if (winnerId === finals.player1Id) {
            finals.player1Wins++;
          } else {
            finals.player2Wins++;
          }

          finals.games = games;
          playoffBracket.finals = finals;

          // Check for winner (best of 3)
          let newPhase: TournamentPhase = state.phase;
          let tripleThreatchampionId = state.tripleThreatchampionId;

          if (finals.player1Wins >= 2) {
            tripleThreatchampionId = finals.player1Id;
            newPhase = 'complete';
          } else if (finals.player2Wins >= 2) {
            tripleThreatchampionId = finals.player2Id;
            newPhase = 'complete';
          }

          return { playoffBracket, players, playoffBets, tripleThreatchampionId, phase: newPhase };
        });
      },

      placePlayoffBet: (bettorId, matchKey, predictedWinnerId) => {
        set((state) => {
          // Remove any existing bet from this bettor for this match
          const filteredBets = state.playoffBets.filter(
            (b) => !(b.bettorId === bettorId && b.matchId === matchKey)
          );

          const newBet: Bet = {
            id: crypto.randomUUID(),
            matchId: matchKey, // e.g., "sf1", "sf2", "finals-1", "finals-2", "finals-3"
            bettorId,
            predictedWinnerId,
            isCorrect: null,
          };

          return { playoffBets: [...filteredBets, newBet] };
        });
      },

      removePlayoffBet: (bettorId, matchKey) => {
        set((state) => ({
          playoffBets: state.playoffBets.filter(
            (b) => !(b.bettorId === bettorId && b.matchId === matchKey)
          ),
        }));
      },

      awardBestBettor: () => {
        set((state) => {
          const players = [...state.players];

          // Find best bettor
          const sorted = [...players].sort((a, b) => {
            if (b.bettingProfit !== a.bettingProfit) return b.bettingProfit - a.bettingProfit;
            return b.betsPlaced - a.betsPlaced;
          });

          const bestBettor = sorted[0];
          if (bestBettor && bestBettor.bettingProfit > 0) {
            const idx = players.findIndex((p) => p.id === bestBettor.id);
            if (idx >= 0) {
              players[idx] = {
                ...players[idx],
                isBestBettor: true,
                totalPoints: players[idx].totalPoints + 3,
              };
            }
            return { players, bestBettorId: bestBettor.id };
          }

          return { players };
        });
      },

      completeTournament: () => {
        set({ phase: 'complete' });
      },

      // Utility
      getPlayer: (id) => {
        return get().players.find((p) => p.id === id);
      },

      getCurrentRound: () => {
        const { rounds, currentRound } = get();
        return rounds.find((r) => r.roundNumber === currentRound);
      },

      getOnDeckPlayers: () => {
        const { players } = get();
        const currentRound = get().getCurrentRound();
        if (!currentRound) return [];

        const playingIds = new Set(
          currentRound.matches.flatMap((m) => [m.player1Id, m.player2Id])
        );
        return players.filter((p) => !playingIds.has(p.id));
      },

      getSortedStandings: () => {
        const { players } = get();
        return [...players].sort((a, b) => {
          if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
          if (b.buchholzScore !== a.buchholzScore) return b.buchholzScore - a.buchholzScore;
          return b.dominantWins - a.dominantWins;
        });
      },

      getGameStandings: (gameType) => {
        const { players } = get();
        const recordKey = gameType === 'smash' ? 'smashRecord' :
                         gameType === 'chess' ? 'chessRecord' : 'pingPongRecord';
        const buchholzKey = gameType === 'smash' ? 'smashBuchholz' :
                           gameType === 'chess' ? 'chessBuchholz' : 'pingPongBuchholz';

        return [...players].sort((a, b) => {
          if (b[recordKey].wins !== a[recordKey].wins) {
            return b[recordKey].wins - a[recordKey].wins;
          }
          return b[buchholzKey] - a[buchholzKey];
        });
      },

      resetTournament: () => {
        set({
          phase: 'registration',
          currentRound: 0,
          totalRounds: 17,
          players: [],
          rounds: [],
          playoffBracket: createEmptyPlayoffBracket(),
          playoffBets: [],
          matchmakingLogs: [],
          smashChampionId: null,
          chessChampionId: null,
          pingPongChampionId: null,
          bestBettorId: null,
          tripleThreatchampionId: null,
        });
      },
    }),
    {
      name: 'triple-threat-tournament',
    }
  )
);
