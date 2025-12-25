# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev      # Start Vite dev server (hot reload)
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview production build locally
```

No test framework is configured.

## Architecture Overview

This is a React tournament management app for a multi-game competition (Smash Bros, Speed Chess, Ping Pong). Uses Zustand for state management with localStorage persistence, styled with Tailwind CSS 4.

### State Management

All tournament state lives in a single Zustand store (`src/store/tournamentStore.ts`). The store is persisted to localStorage under key `triple-threat-tournament`.

**Tournament phases flow sequentially:**
`registration` → `swiss` → `sync` → `championsReveal` → `playoffSeeding` → `semifinals` → `finals` → `complete`

### Core Tournament Logic

- **Swiss Pairing** (`src/utils/swissPairing.ts`): Matches players by game-specific win-loss records while avoiding rematches. Prioritizes underserved players (fewer total matches).

- **Buchholz Tiebreaker** (`src/utils/buchholz.ts`): Calculates opponent strength scores after all swiss rounds and sync matches complete. Sum of all opponents' final point totals.

- **Sync Matches** (`src/utils/syncRounds.ts`): After swiss rounds, players who haven't played 9 matches get catch-up games. Only the "underserved" player's result counts; volunteers are unaffected.

### Key Types

From `src/types/index.ts`:
- `GameType`: `'smash' | 'chess' | 'pingPong'`
- `TournamentPhase`: Controls which UI phase is active
- `Player`: Tracks per-game records, opponents faced, betting stats, champion flags
- `Match`: Includes `isSyncRound`, `isPlayoff`, `underservedPlayerId` for special match types
- `Round`: Contains matches and bets, tracks `bettingOpen` state

### Points System

- Regular win: +3 pts
- Dominant win: +5 pts (3-stock in Smash, checkmate <1min in Chess, 11-0 in Ping Pong)
- Betting: +1/-1 per correct/incorrect prediction
- Game champion bonus: +5 pts each
- Best bettor bonus: +3 pts

### Component Organization

- `src/components/round/`: Swiss round UI (betting interface, match cards, result entry)
- `src/components/sync/`: Sync match volunteer selection and display
- `src/components/playoffs/`: Bracket display and game picker
- `src/components/leaderboard/`: Standings with per-game filtering
- `src/components/awards/`: Champion reveal and final results

### Betting System

During betting phase, on-deck players (not currently playing) can drag their avatar to predict match winners. Bets are processed when match results are recorded via `recordMatchResult()`.

### Match Display Order

Matches are consistently ordered: Ping Pong (left), Smash (middle), Chess (right). This is enforced by `GAME_ORDER` constant in both `RoundDisplay.tsx` and `BettingInterface.tsx`.

### Animations

Custom CSS animations defined in `src/index.css`:
- `smash-slide-in` / `smash-slide-out`: Entry/exit animations for panels
- `smash-pulse`, `smash-shake`: Visual effects for timers and alerts
- `electric-border`: Animated betting status border
