# Triple Threat Tournament — Complete Specification

## Overview

A simultaneous three-game tournament combining Super Smash Bros Ultimate, Speed Chess, and Ping Pong. Designed for maximum chaos, engagement, and competitive drama at a bachelor party.

### Core Concept

- 11 players compete across 3 games simultaneously
- Swiss-style pairing within each game
- Point accumulation determines standings
- Betting system for non-participating players
- Individual game champions + overall Triple Threat Champion
- Estimated duration: ~3.5 hours

---

## Player Registration

### Required Fields

| Field | Description |
|-------|-------------|
| `name` | Real name (for internal reference) |
| `nickname` | Display name / gamertag (shown in app) |
| `avatar` | Selected from preset animal options |

### Avatar Options (15-20 choices)

Players can either:
- Manually select an avatar during registration
- Have the system randomly assign one

Suggested avatar set:
- 🦈 Shark
- 🦁 Lion
- 🦅 Eagle
- 🐺 Wolf
- 🐻 Bear
- 🦉 Owl
- 🐍 Cobra
- 🦊 Fox
- 🐯 Tiger
- 🦝 Raccoon
- 🐲 Dragon
- 🦍 Gorilla
- 🦬 Bison
- 🦎 Lizard
- 🐊 Crocodile
- 🦂 Scorpion

### Registration Flow

1. Pre-tournament: Send Google Form to collect name + nickname
2. Day-of: Players select avatars in the app (first-come-first-served or random assignment)
3. App displays player cards with avatar + nickname

---

## Tournament Structure

### Games

| Game | Station | Match Duration | Dominant Win Condition |
|------|---------|----------------|------------------------|
| 🎮 Super Smash Bros Ultimate | TV/Console | Variable (max 7 min) | 3-stock victory |
| ♟️ Speed Chess | Chess board + clock | 3 min per player | Checkmate in under 1 minute |
| 🏓 Ping Pong | Ping pong table | First to 11, win by 2 | Skunk (11-0) |

### Match Distribution

- Each player plays exactly **9 matches total**
- Exactly **3 matches per game** per player
- Total matches in tournament: **49.5 → rounded to 51** (includes Sync Rounds)

### Station Allocation Per Round

| Station | Players |
|---------|---------|
| Smash | 2 |
| Chess | 2 |
| Ping Pong | 2 |
| On Deck | 5 |

---

## Point System

### Match Points

| Outcome | Points |
|---------|--------|
| Win | +3 |
| Dominant Win | +5 |
| Loss | +0 |

### Dominant Win Definitions

| Game | Dominant Win Condition |
|------|------------------------|
| Smash | 3-stock (opponent never takes a stock) |
| Chess | Checkmate in under 1 minute |
| Ping Pong | Skunk — 11-0 shutout |

### Betting Points

| Outcome | Points |
|---------|--------|
| Correct prediction | +1 |
| Wrong prediction | -1 |

### Bonus Points (Awarded After Swiss + Sync Rounds)

| Award | Bonus Points |
|-------|--------------|
| Smash Champion | +5 |
| Chess Champion | +5 |
| Ping Pong Champion | +5 |
| Best Bettor | +5 (awarded after Finals) |

---

## Swiss Pairing System

### How Swiss Works

Swiss pairing matches players with similar records within each game. Unlike traditional Swiss where everyone plays simultaneously, our format runs 3 games in parallel with rotation.

### Per-Round Scheduling Logic

Each round, the app must:

1. **Identify eligible players** for each game:
   - Players who have played fewer than 3 matches in that game
   - Players not currently assigned to another game this round

2. **Pair by game-specific record**:
   - Within each game, pair players with similar win-loss records in THAT game
   - First round: random pairing (no records yet)
   - Subsequent rounds: match 2-0 vs 2-0, 1-1 vs 1-1, etc.

3. **Prioritize underserved players**:
   - Players with fewer total matches get scheduling priority
   - Ensures everyone stays close to the same match count

4. **Handle odd situations**:
   - If only 1 eligible player for a game, skip that game this round
   - If 3+ eligible players with same record, random selection among them

### Pairing Constraints

- No rematches within the same game (if possible)
- If rematch is unavoidable late in tournament, allow it

---

## Sync Rounds

### Purpose

Due to 11 being odd and 3 simultaneous games, some players will end Round 17 with only 8 matches. Sync Rounds bring everyone to exactly 9 matches.

### When

After Round 17 (final Swiss round), before Individual Champion Awards.

### Number of Sync Matches

Exactly 3 matches (one at a time, not simultaneous).

### Participant Selection

**Underserved Player (8 matches):**
- The app identifies which game they're short in
- They MUST play this match

**Volunteer Player (already has 9 matches):**
- App selects a player with a similar game-specific record
- Selected volunteer may opt out (choose to rest)
- If opt-out, next-closest record is selected
- Process repeats until a volunteer accepts

### Point Stakes

| Player Type | Win | Loss |
|-------------|-----|------|
| Underserved | +3 (or +5 if dominant) | +0 |
| Volunteer | +0 | +0 |

The volunteer's record is completely unaffected. This ensures:
- All players' final scores based on exactly 9 meaningful matches
- Volunteers have no disincentive to participate
- No unfair advantage from extra match

### Betting During Sync Rounds

- All non-participating players may bet
- Same rules: +1 if correct, -1 if wrong
- Bets apply to the underserved player's outcome (since only their result "counts")

---

## Betting System

### Who Can Bet

| Phase | Who Can Bet |
|-------|-------------|
| Swiss Rounds | On-deck players only (5 per round) |
| Sync Rounds | All non-participating players |
| Playoffs | All non-playoff players (seeds 5-11) |

### Betting Rules

1. **Timing**: Betting window opens when matchups are announced, closes before games begin
2. **Wager**: Always exactly 1 point per bet
3. **Scope**: One bet per match (can bet on multiple simultaneous matches)
4. **Outcome**: +1 point if correct, -1 point if wrong
5. **Restrictions**:
   - Cannot bet on your own match
   - Playoff participants (seeds 1-4) cannot bet during playoffs

### Betting Window Duration

- Recommended: 90 seconds
- Display countdown timer in app
- Lock all bets when timer expires

### Best Bettor Tracking

Track each player's cumulative betting profit/loss:
- Calculate: (correct bets) - (incorrect bets)
- Track throughout entire tournament including playoffs
- Award Best Bettor (+5 bonus) after Finals conclude

---

## Buchholz Tiebreaker System

### What Is Buchholz

Buchholz score measures opponent strength. Your Buchholz = sum of your opponents' final tournament points.

### Calculation

```
Player A's Buchholz = 
  (Opponent 1's final points) + 
  (Opponent 2's final points) + 
  ... + 
  (Opponent N's final points)
```

### Important Clarifications

1. **Based on overall tournament points**, not game-specific records
2. **Calculated AFTER all Swiss + Sync Rounds complete** (so opponent points are final)
3. **Applies to**:
   - Individual game champion tiebreakers (using only opponents faced in that game)
   - Overall standings tiebreakers (using all opponents faced)

### Example

```
CtrlAltDefeat played these Smash opponents:
- LoadingSkills (final total: 11 pts)
- 404SkillNotFound (final total: 0 pts)
- GoodLuckHaveFun (final total: 23 pts)

CtrlAltDefeat's Smash Buchholz = 11 + 0 + 23 = 34
```

### Tiebreaker Application Order

If players are tied on points:
1. **Buchholz score** (higher = better)
2. **Head-to-head** (if they played each other, winner ranks higher)
3. **Total dominant wins** (more = better)
4. **Coin flip / random** (last resort)

---

## Individual Champion Awards

### When Awarded

After Swiss + Sync Rounds, BEFORE playoff seeding.

### Champions Determined

| Award | Criteria |
|-------|----------|
| 🎮 Smash Champion | Best record in Smash (3 matches) |
| ♟️ Chess Champion | Best record in Chess (3 matches) |
| 🏓 Ping Pong Champion | Best record in Ping Pong (3 matches) |

### Determining Best Record

1. Most wins in that game
2. If tied on wins: game-specific Buchholz (opponent strength within that game)
3. If still tied: head-to-head in that game
4. If still tied: dominant wins in that game
5. If still tied: co-champions (both get +5)

### Bonus Points

Each champion receives **+5 points** added to their total.

**Important**: These bonus points count toward playoff seeding! A player could jump into the top 4 by winning an individual championship.

---

## Playoffs

### Qualification

Top 4 players by total points (after champion bonuses applied) qualify for playoffs.

Seeding determined by:
1. Total points
2. Buchholz tiebreaker if tied

### Bracket Structure

```
┌─────────────────────────────────────┐
│           SEMIFINALS                │
│                                     │
│   #1 Seed ──────┐                   │
│                 ├──────┐            │
│   #4 Seed ──────┘      │            │
│                        ├──► CHAMPION│
│   #2 Seed ──────┐      │            │
│                 ├──────┘            │
│   #3 Seed ──────┘                   │
│                                     │
└─────────────────────────────────────┘
```

### Semifinal Format

- **Single game** per semifinal
- **Higher seed picks the game**
- Standard points (but playoffs don't affect point totals — winner advances, loser eliminated)

### Finals Format — Best of 3

| Game | Who Picks |
|------|-----------|
| Game 1 | Higher seed |
| Game 2 | Lower seed |
| Game 3 (if needed) | Random draw |

First to win 2 matches = **Triple Threat Champion**

### Playoff Betting

- Seeds 5-11 may bet on all playoff matches
- Same rules: +1 correct, -1 wrong
- These bets affect their final point totals and Best Bettor calculation
- Seeds 1-4 (playoff participants) may NOT bet during playoffs

---

## Best Bettor Award

### Calculation

```
Net Betting Profit = (Total Correct Bets) - (Total Incorrect Bets)
```

Tracked across:
- All Swiss rounds
- All Sync rounds
- All playoff matches (semifinals + finals)

### Tiebreaker

If multiple players tied for best net profit:
1. Total number of bets placed (more = better, rewarding engagement)
2. Co-Best Bettors (both get +5)

### When Awarded

After Finals conclude, before final standings announced.

### Bonus

+5 points added to winner's final total.

---

## Complete Timeline

### Per-Round Flow (Swiss Rounds)

```
0:00 — Round announced
       • All 3 matchups displayed
       • Players assigned to stations
       
0:00 — Betting window opens (90 sec)
       • On-deck players place bets
       • Countdown timer visible
       
1:30 — Betting window closes
       • Players settle into stations
       • Bets locked
       
1:30 — Games commence
       • 7-minute maximum clock starts
       • Games may finish earlier
       
8:30 — Games end
       • Or when all 3 finish, whichever first
       
8:30 — Results entered
       • Match outcomes recorded
       • Dominant wins flagged
       • Betting results auto-calculated
       
9:00 — Next round calculated
       • Swiss pairings generated
       • New matchups announced
       
~10 min per round
```

### Full Tournament Timeline

| Phase | Rounds/Matches | Estimated Duration |
|-------|----------------|-------------------|
| Swiss Rounds | 17 rounds | ~2 hrs 50 min |
| Sync Rounds | 3 matches | ~15 min |
| Individual Champion Awards | — | ~5 min |
| Playoff Seeding Reveal | — | ~5 min |
| Semifinal 1 | 1 match | ~10 min |
| Semifinal 2 | 1 match | ~10 min |
| Finals (Best of 3) | 2-3 matches | ~20-25 min |
| Best Bettor + Final Awards | — | ~5 min |
| **TOTAL** | | **~3.5 hours** |

---

## App Features — Core Requirements

### 1. Player Registration Screen

- Input fields: Name, Nickname
- Avatar selection grid (or "Random" button)
- Player preview card
- "Register" button
- Display registered players list
- "Start Tournament" button (requires 11 players)

### 2. Round Management Screen

**Display:**
- Current round number (e.g., "Round 7 of 17")
- Three match cards showing:
  - Game type icon (🎮 ♟️ 🏓)
  - Player 1 avatar + nickname vs Player 2 avatar + nickname
- On-deck player list with betting interface
- Betting countdown timer
- "Start Games" button (locks betting)
- "Enter Results" button (after games)

**Result Entry Modal:**
- Select winner
- Toggle "Dominant win?" checkbox
- Confirm button

### 3. Betting Interface

**For on-deck players:**
- See all 3 active matches
- Tap to select predicted winner for each
- Visual confirmation of placed bets
- Locked state after betting window closes

**Display:**
- Each player's current bet profit/loss
- Best Bettor leaderboard

### 4. Live Leaderboard

**Columns:**
- Rank
- Avatar + Nickname
- Total Points
- Match Record (W-L)
- Per-game records (Smash, Chess, PP)
- Buchholz score
- Betting profit

**Sorting:**
- Primary: Total points (desc)
- Secondary: Buchholz (desc)

**Filters/Views:**
- Overall standings
- Smash standings
- Chess standings
- Ping Pong standings

### 5. Sync Rounds Screen

- Display underserved players (who needs a match)
- Show which game they need
- Display suggested volunteer with similar record
- "Accept" / "Opt Out" buttons for volunteer
- Same betting interface for non-participants
- Single match display (not 3 simultaneous)

### 6. Individual Champion Reveal Screen

- Dramatic reveal animation for each champion
- Display: Avatar, Nickname, Game icon, Record in that game
- "+5 POINTS" animation
- Updated standings preview

### 7. Playoff Bracket Screen

- Visual bracket (4 players)
- Seeds clearly labeled
- Game selection interface for higher seed
- Match result display
- Advancement animations

### 8. Finals Screen

- Best of 3 tracker
- Series score (e.g., "1 - 1")
- Game picker (seed-based or random for Game 3)
- Dramatic "CHAMPION" reveal at conclusion

### 9. Final Results Screen

- Triple Threat Champion spotlight
- Full final standings
- All awards summary:
  - 🏆 Triple Threat Champion
  - 🎮 Smash Champion
  - ♟️ Chess Champion
  - 🏓 Ping Pong Champion
  - 🎰 Best Bettor
  - 💀 Last Place

---

## App Features — Animations & Polish

### Match Outcome Animations

| Event | Animation |
|-------|-----------|
| Regular win | Confetti burst on winner |
| Dominant win | Screen shake + extra confetti + "DOMINANT" text |
| Upset (lower rank beats higher) | Air horn sound + "UPSET" banner |
| Win streak (3+) | Fire/flame effect on player card |
| Elimination (playoffs) | "ELIMINATED" stamp |

### Betting Animations

| Event | Animation |
|-------|-----------|
| Bet placed | Chip/coin drop animation |
| Bet won | Green +1 floating up |
| Bet lost | Red -1 floating down |
| Best Bettor crowned | Slot machine / jackpot animation |

### Leaderboard Animations

| Event | Animation |
|-------|-----------|
| Rank change up | Green arrow, smooth slide up |
| Rank change down | Red arrow, smooth slide down |
| Enter top 4 | Golden glow border |
| Drop out of top 4 | Border fades away |

### Champion Reveals

- Drumroll sound
- Card flip or curtain reveal
- Spotlight effect
- Crown/trophy icon appears
- "+5" points counter animation

### Finals

- Epic intro sequence for finalists
- Round announcements with flair
- "MATCH POINT" indicator
- Champion coronation sequence

### Sound Effects (Optional)

- Air horn (upsets)
- Ding (bet placed)
- Cash register (bet won)
- Sad trombone (bet lost / elimination)
- Crowd cheering (champion reveals)
- Final countdown beeps (betting window closing)

---

## Data Structures

### Player Object

```typescript
interface Player {
  id: string;
  name: string;
  nickname: string;
  avatar: string; // emoji or image path
  
  // Match records
  totalPoints: number;
  matchRecord: { wins: number; losses: number };
  smashRecord: { wins: number; losses: number };
  chessRecord: { wins: number; losses: number };
  pingPongRecord: { wins: number; losses: number };
  
  // Detailed tracking
  dominantWins: number;
  matchesPlayed: number;
  smashMatchesPlayed: number;
  chessMatchesPlayed: number;
  pingPongMatchesPlayed: number;
  
  // Opponents faced (for Buchholz)
  smashOpponents: string[]; // player IDs
  chessOpponents: string[];
  pingPongOpponents: string[];
  
  // Betting
  betsPlaced: number;
  betsWon: number;
  betsLost: number;
  bettingProfit: number; // betsWon - betsLost
  
  // Calculated fields
  buchholzScore: number; // calculated at end
  smashBuchholz: number;
  chessBuchholz: number;
  pingPongBuchholz: number;
  
  // Awards
  isSmashChampion: boolean;
  isChessChampion: boolean;
  isPingPongChampion: boolean;
  isBestBettor: boolean;
  playoffSeed: number | null; // 1-4 or null
}
```

### Match Object

```typescript
interface Match {
  id: string;
  roundNumber: number;
  gameType: 'smash' | 'chess' | 'pingPong';
  player1Id: string;
  player2Id: string;
  winnerId: string | null;
  isDominant: boolean;
  isSyncRound: boolean;
  isPlayoff: boolean;
  playoffRound: 'semifinal' | 'final' | null;
  
  // For sync rounds
  underservedPlayerId: string | null;
  volunteerId: string | null;
}
```

### Bet Object

```typescript
interface Bet {
  id: string;
  matchId: string;
  bettorId: string;
  predictedWinnerId: string;
  isCorrect: boolean | null; // null until match complete
  pointsAwarded: number; // +1, -1, or 0
}
```

### Round Object

```typescript
interface Round {
  roundNumber: number;
  type: 'swiss' | 'sync' | 'semifinal' | 'final';
  matches: Match[];
  bets: Bet[];
  isComplete: boolean;
}
```

### Tournament State

```typescript
interface TournamentState {
  phase: 'registration' | 'swiss' | 'sync' | 'championsReveal' | 
         'playoffSeeding' | 'semifinals' | 'finals' | 'complete';
  currentRound: number;
  players: Player[];
  rounds: Round[];
  
  // Playoff specific
  playoffBracket: {
    semifinal1: { player1Id: string; player2Id: string; winnerId: string | null };
    semifinal2: { player1Id: string; player2Id: string; winnerId: string | null };
    finals: { 
      player1Id: string; 
      player2Id: string; 
      player1Wins: number;
      player2Wins: number;
      games: Match[];
    };
  };
  
  // Champions
  smashChampionId: string | null;
  chessChampionId: string | null;
  pingPongChampionId: string | null;
  bestBettorId: string | null;
  tripleThreatchampionId: string | null;
}
```

---

## Swiss Pairing Algorithm

### Input
- List of players
- Each player's game-specific records
- Each player's match count per game
- History of who played whom (to avoid rematches)

### Per-Round Algorithm

```
FOR each game (Smash, Chess, PingPong):
  
  1. Get eligible players:
     - Has played < 3 matches in this game
     - Not already assigned to a different game this round
  
  2. Sort eligible players by:
     - Primary: Fewest total matches played (prioritize underserved)
     - Secondary: Game-specific win count
  
  3. Pair players:
     - Group by game-specific record (3-0, 2-1, 2-0, 1-1, 1-0, 0-1, 0-2, etc.)
     - Within each group, pair randomly
     - Avoid rematches if possible
     - If odd number in a group, float one player to adjacent group
  
  4. Select top pair:
     - Take the first valid pair
     - Mark both players as assigned for this round
  
  5. If no valid pair possible:
     - Skip this game for this round
     - (Rare edge case)

RETURN: Three matches (or fewer if games skipped)
```

### Rematch Avoidance

```
canMatch(player1, player2, gameType):
  - Check if player2.id is in player1.[gameType]Opponents
  - If yes and other options exist, skip this pairing
  - If no other options, allow rematch
```

---

## Buchholz Calculation Algorithm

### When to Calculate

After all Swiss + Sync rounds complete, before champion bonuses applied.

### Algorithm

```
FOR each player:
  
  totalBuchholz = 0
  smashBuchholz = 0
  chessBuchholz = 0
  pingPongBuchholz = 0
  
  FOR each opponent in player.smashOpponents:
    smashBuchholz += opponent.totalPoints
    totalBuchholz += opponent.totalPoints
  
  FOR each opponent in player.chessOpponents:
    chessBuchholz += opponent.totalPoints
    totalBuchholz += opponent.totalPoints
  
  FOR each opponent in player.pingPongOpponents:
    pingPongBuchholz += opponent.totalPoints
    totalBuchholz += opponent.totalPoints
  
  player.buchholzScore = totalBuchholz
  player.smashBuchholz = smashBuchholz
  player.chessBuchholz = chessBuchholz
  player.pingPongBuchholz = pingPongBuchholz
```

---

## Sync Round Selection Algorithm

### Finding Underserved Players

```
underservedPlayers = []

FOR each player:
  IF player.matchesPlayed < 9:
    shortage = {
      playerId: player.id,
      smashNeeded: 3 - player.smashMatchesPlayed,
      chessNeeded: 3 - player.chessMatchesPlayed,
      pingPongNeeded: 3 - player.pingPongMatchesPlayed
    }
    underservedPlayers.push(shortage)

RETURN underservedPlayers (should be exactly 3)
```

### Finding Volunteer

```
findVolunteer(underservedPlayer, gameType):
  
  underservedRecord = underservedPlayer.[gameType]Record
  
  candidates = players
    .filter(p => p.id !== underservedPlayer.id)
    .filter(p => p.matchesPlayed >= 9) // Already complete
    .sort by closeness to underservedRecord
  
  FOR each candidate in candidates:
    offer volunteer spot to candidate
    IF candidate accepts:
      RETURN candidate
    ELSE:
      continue to next
  
  // Fallback: force assign last candidate
  RETURN candidates[candidates.length - 1]
```

---

## Playoff Seeding Algorithm

### After Champion Bonuses

```
1. Apply champion bonuses:
   - smashChampion.totalPoints += 5
   - chessChampion.totalPoints += 5
   - pingPongChampion.totalPoints += 5

2. Sort all players by:
   - Primary: totalPoints (desc)
   - Secondary: buchholzScore (desc)
   - Tertiary: dominantWins (desc)

3. Top 4 = playoff qualifiers
   - Rank 1 = Seed #1
   - Rank 2 = Seed #2
   - Rank 3 = Seed #3
   - Rank 4 = Seed #4

4. Create bracket:
   - Semifinal 1: #1 vs #4
   - Semifinal 2: #2 vs #3
```

---

## Edge Cases & Rules Clarifications

### What if a player disconnects/leaves?

- If during Swiss: Mark remaining matches as forfeits (opponent gets +3)
- If during playoffs: Opponent advances automatically
- Consider adding a "substitute" feature if this is a real concern

### What if there's a tie in a playoff match?

- Smash: Sudden death is built into the game
- Chess: If time runs out for both, faster checkmate wins; if draw, replay
- Ping Pong: Must win by 2, no ties possible

### What if Best Bettor is also a champion?

- They receive both bonuses (+5 for game champion, +5 for Best Bettor)
- No conflict

### What if someone wants to bet on all 3 matches?

- Allowed! On-deck players can place one bet per active match
- Maximum 3 bets per round during Swiss

### What if a volunteer refuses Sync Round and no one else has a similar record?

- Expand to next-closest record
- If all refuse, randomly assign a volunteer (social pressure should prevent this)

### What about bathroom breaks?

- Swiss rounds are flexible; can pause between rounds
- Playoffs should be continuous if possible
- Consider adding a halftime break after Round 9 or so

### What if someone is dominant at all 3 games?

- They'll likely be Triple Threat Champion!
- Champion bonuses stack (could get +15 if they win all 3 games)
- This is by design — rewards versatility

---

## Drinking Game Rules (Optional Module)

### Universal Rules

| Event | Drink |
|-------|-------|
| Lose a match | 1 drink |
| Dominant loss | Finish drink |
| Win 3 in a row (any game) | Assign 1 drink |

### Smash-Specific

| Event | Drink |
|-------|-------|
| SD (self-destruct) | 1 drink |
| Get hit by Final Smash | 1 drink |
| Lose a stock at 0% | 1 drink |

### Chess-Specific

| Event | Drink |
|-------|-------|
| Lose piece to obvious blunder | 1 drink |
| Get forked | 1 drink |
| Lose on time | 2 drinks |

### Ping Pong-Specific

| Event | Drink |
|-------|-------|
| Miss serve | 1 drink |
| Get aced | 1 drink |
| Hit net and lose point | 1 drink |

### On-Deck Players

- Can bet drinks on matches (loser of bet drinks)
- Heckling encouraged

### App Integration (Optional)

- Drink counter per player
- "Drink assigned" button
- Leaderboard of drinks consumed

---

## Tech Stack Recommendations

### Frontend
- **React** + **Vite** (fast, modern)
- **TypeScript** (type safety for complex state)
- **Tailwind CSS** (rapid styling)
- **Framer Motion** (animations)
- **Zustand** (state management)

### Persistence
- **Local Storage** (browser persistence)
- Alternatively: simple JSON file export/import
- No backend needed for single-session tournament

### Optional Enhancements
- **Howler.js** (sound effects)
- **Canvas Confetti** (celebration animations)
- **QR code** for players to view standings on their phones

---

## File Structure Recommendation

```
/src
  /components
    /registration
      PlayerRegistrationForm.tsx
      AvatarPicker.tsx
      PlayerCard.tsx
      RegisteredPlayersList.tsx
    /round
      RoundDisplay.tsx
      MatchCard.tsx
      BettingInterface.tsx
      BettingTimer.tsx
      ResultEntryModal.tsx
    /leaderboard
      Leaderboard.tsx
      LeaderboardRow.tsx
      GameSpecificStandings.tsx
    /sync
      SyncRoundDisplay.tsx
      VolunteerSelection.tsx
    /playoffs
      PlayoffBracket.tsx
      SemifinalMatch.tsx
      FinalsDisplay.tsx
      GamePicker.tsx
    /awards
      ChampionReveal.tsx
      BestBettorReveal.tsx
      FinalResults.tsx
    /ui
      Button.tsx
      Modal.tsx
      Timer.tsx
      ConfettiEffect.tsx
  /hooks
    useSwissPairing.ts
    useBuchholz.ts
    useBetting.ts
    usePlayoffs.ts
  /store
    tournamentStore.ts
  /utils
    pairingAlgorithm.ts
    buchholzCalculation.ts
    tiebreakers.ts
  /types
    index.ts
  /data
    avatars.ts
  App.tsx
  main.tsx
```

---

## Testing Checklist

### Registration
- [ ] Can register 11 players with unique nicknames
- [ ] Avatar selection works (manual and random)
- [ ] Cannot start tournament with fewer than 11 players

### Swiss Rounds
- [ ] Correct number of matches per round (3)
- [ ] No player assigned to 2 games same round
- [ ] Swiss pairing respects game-specific records
- [ ] No rematches within same game (when avoidable)
- [ ] All players reach 8-9 matches after Round 17

### Betting
- [ ] Only on-deck players can bet during Swiss
- [ ] Betting locks when timer expires
- [ ] Points correctly awarded (+1/-1)
- [ ] Betting profit tracked accurately

### Sync Rounds
- [ ] Correctly identifies underserved players
- [ ] Volunteer selection offers similar-record players
- [ ] Opt-out moves to next candidate
- [ ] Only underserved player's points affected by outcome

### Scoring
- [ ] Regular wins = +3
- [ ] Dominant wins = +5
- [ ] Buchholz calculated correctly
- [ ] Champion bonuses applied (+5 each)

### Individual Champions
- [ ] Correctly determined by game record
- [ ] Buchholz tiebreaker works
- [ ] Bonus points affect playoff seeding

### Playoffs
- [ ] Top 4 correctly identified
- [ ] Seeding respects points + Buchholz
- [ ] Higher seed picks game (semis, finals G1)
- [ ] Lower seed picks finals G2
- [ ] Finals G3 is random
- [ ] Non-playoff players can bet on all matches

### Best Bettor
- [ ] Includes all bets (Swiss + Sync + Playoffs)
- [ ] Correctly identifies highest profit
- [ ] +5 bonus applied after finals

### Final Results
- [ ] All awards displayed
- [ ] Final standings accurate
- [ ] Champion highlighted

---

## Quick Reference Card (Print for Day-Of)

```
╔═══════════════════════════════════════════════════════════════╗
║              TRIPLE THREAT TOURNAMENT QUICK REF               ║
╠═══════════════════════════════════════════════════════════════╣
║  POINTS                                                       ║
║  • Win = +3  • Dominant Win = +5  • Loss = +0                ║
║  • Bet correct = +1  • Bet wrong = -1                        ║
║  • Game Champion bonus = +5  • Best Bettor bonus = +5        ║
╠═══════════════════════════════════════════════════════════════╣
║  DOMINANT WINS                                                ║
║  • Smash: 3-stock  • Chess: <1 min checkmate  • PP: 11-0     ║
╠═══════════════════════════════════════════════════════════════╣
║  BETTING                                                      ║
║  • Swiss: On-deck only  • Playoffs: Non-qualifiers only      ║
║  • 90 sec window  • 1 pt per bet  • Lock before games        ║
╠═══════════════════════════════════════════════════════════════╣
║  SYNC ROUNDS                                                  ║
║  • 3 matches to equalize  • Volunteer unaffected             ║
╠═══════════════════════════════════════════════════════════════╣
║  PLAYOFFS                                                     ║
║  • Top 4 qualify  • Semis: single game, high seed picks      ║
║  • Finals: Best of 3 (high/low/random)                       ║
╠═══════════════════════════════════════════════════════════════╣
║  TIEBREAKER: Buchholz (opponent strength)                    ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Complete spec created |

---

## Contact / Questions

Created for [Brother's Name]'s Bachelor Party

Tournament Commissioner: Carson

Questions? Find Carson or consult this document.

---

*May the best triple threat win.* 🏆🎮♟️🏓
