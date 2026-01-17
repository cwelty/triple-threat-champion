export type GameType = 'smash' | 'chess' | 'pingPong';

export type TournamentPhase =
  | 'registration'
  | 'draft'
  | 'swiss'
  | 'sync'
  | 'championsReveal'
  | 'playoffSeeding'
  | 'semifinals'
  | 'thirdPlace'
  | 'finals'
  | 'complete';

export interface GameRecord {
  wins: number;
  losses: number;
}

export interface Player {
  id: string;
  name: string;
  nickname: string;
  avatar: string;
  totalPoints: number;
  matchRecord: GameRecord;
  smashRecord: GameRecord;
  chessRecord: GameRecord;
  pingPongRecord: GameRecord;
  dominantWins: number;
  smashDominantWins: number;
  chessDominantWins: number;
  pingPongDominantWins: number;
  matchesPlayed: number;
  smashMatchesPlayed: number;
  chessMatchesPlayed: number;
  pingPongMatchesPlayed: number;
  smashOpponents: string[];
  chessOpponents: string[];
  pingPongOpponents: string[];
  betsPlaced: number;
  betsWon: number;
  betsLost: number;
  bettingProfit: number;
  bettingStreak: number; // Current consecutive successful bets (resets on loss)
  betsReceived: number; // Fan favorite - how many bets placed ON this player
  buchholzScore: number;
  smashBuchholz: number;
  chessBuchholz: number;
  pingPongBuchholz: number;
  isSmashChampion: boolean;
  isChessChampion: boolean;
  isPingPongChampion: boolean;
  isBestGambler: boolean;
  playoffSeed: number | null;
  smashDraftedCharacters: string[];
  smashCharacterStats: Record<string, { wins: number; losses: number }>;
}

export interface Match {
  id: string;
  roundNumber: number;
  gameType: GameType;
  player1Id: string;
  player2Id: string;
  winnerId: string | null;
  isDominant: boolean;
  isSyncRound: boolean;
  isPlayoff: boolean;
  playoffRound: 'semifinal' | 'thirdPlace' | 'final' | null;
  underservedPlayerId: string | null;
  secondUnderservedPlayerId?: string | null; // When two underserved players are matched together
  volunteerId: string | null;
  // Sync round volunteer exhaustion tracking
  isVolunteerExhausted?: boolean; // True if all eligible players have already played underserved in this game
  isVolunteerForced?: boolean; // True if volunteer was randomly assigned (all options exhausted)
  declinedVolunteerIds?: string[]; // Track who has declined to volunteer
  // Smash character selection
  player1Character?: string;
  player2Character?: string;
}

export interface Bet {
  id: string;
  matchId: string;
  bettorId: string;
  predictedWinnerId: string;
  isCorrect: boolean | null;
}

export interface Round {
  roundNumber: number;
  type: 'swiss' | 'sync' | 'semifinal' | 'final';
  matches: Match[];
  bets: Bet[];
  isComplete: boolean;
  bettingOpen: boolean;
}

export interface PlayoffBracket {
  semifinal1: {
    player1Id: string | null;
    player2Id: string | null;
    winnerId: string | null;
    gameType: GameType | null;
    player1Character?: string;
    player2Character?: string;
  };
  semifinal2: {
    player1Id: string | null;
    player2Id: string | null;
    winnerId: string | null;
    gameType: GameType | null;
    player1Character?: string;
    player2Character?: string;
  };
  thirdPlace: {
    player1Id: string | null;
    player2Id: string | null;
    winnerId: string | null;
    gameType: GameType | null;
    skipped: boolean;
    player1Character?: string;
    player2Character?: string;
  };
  finals: {
    player1Id: string | null;
    player2Id: string | null;
    player1Wins: number;
    player2Wins: number;
    games: Match[];
  };
}

export interface TournamentState {
  phase: TournamentPhase;
  currentRound: number;
  totalRounds: number;
  players: Player[];
  rounds: Round[];
  playoffBracket: PlayoffBracket;
  smashChampionId: string | null;
  chessChampionId: string | null;
  pingPongChampionId: string | null;
  bestGamblerIds: string[];
  tripleThreatchampionId: string | null;
  // Draft state
  draftOrder: string[];
  currentDraftPick: number;
  draftedCharacters: string[];
}

export const GAME_ICONS: Record<GameType, string> = {
  smash: '🎮',
  chess: '♙',
  pingPong: '🏓',
};

export const GAME_NAMES: Record<GameType, string> = {
  smash: 'Smash Bros',
  chess: 'Speed Chess',
  pingPong: 'Ping-Pong',
};

// Foreshadower - player with 3+ consecutive successful bets
export interface Foreshadower {
  playerId: string;
  streakCount: number;
  targetPlayerId: string | null; // Who they chose to drink
}
