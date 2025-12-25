# Triple Threat Tournament

A React-based tournament management app for running a multi-game competition featuring Super Smash Bros, Speed Chess, and Ping Pong.

## Features

- **Swiss-style tournament system** with intelligent matchmaking
- **Three game types**: Smash Bros, Speed Chess, and Ping Pong
- **Betting system** for spectators during matches
- **Sync matches** to equalize player match counts
- **Playoff bracket** with semifinals, optional 3rd place match, and finals
- **Champion reveals** with dramatic countdowns
- **Drinking game integration** with announcements at key rounds
- **Comprehensive leaderboard** with overall and game-specific views
- **Buchholz tiebreaker** scoring system

## Installation

```bash
# Clone the repository
git clone https://github.com/cwelty/triple-threat-champion.git
cd triple-threat-champion

# Install dependencies
npm install
```

## Running the App

```bash
# Start development server with hot reload
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## Tech Stack

- React 18
- TypeScript
- Vite
- Zustand (state management with localStorage persistence)
- Tailwind CSS 4

## Tournament Flow

1. **Registration** - Players register with name, gamertag, and avatar
2. **Swiss Rounds** - Players compete in 3 simultaneous matches per round
3. **Sync Matches** - Catch-up games for players with fewer matches
4. **Champion Reveals** - Game-specific champions announced
5. **Playoffs** - Top 4 players compete in bracket format
6. **Finals** - Grand finals to determine the Triple Threat Champion
