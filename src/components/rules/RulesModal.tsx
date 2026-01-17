import React, { useState } from 'react';
import { Modal } from '../ui/Modal';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RulesSection = 'overview' | 'pingPong' | 'smash' | 'chess' | 'rounds' | 'betting' | 'scoring' | 'champions' | 'playoffs' | 'tiebreakers' | 'drinking';

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const [activeSection, setActiveSection] = useState<RulesSection>('overview');

  const sections: { id: RulesSection; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'pingPong', label: 'Ping Pong' },
    { id: 'smash', label: 'Smash' },
    { id: 'chess', label: 'Chess' },
    { id: 'rounds', label: 'Rounds' },
    { id: 'betting', label: 'Betting' },
    { id: 'scoring', label: 'Scoring' },
    { id: 'champions', label: 'Champions' },
    { id: 'playoffs', label: 'Playoffs' },
    { id: 'tiebreakers', label: 'Tiebreakers' },
    { id: 'drinking', label: 'Drinking' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tournament Rules" size="lg">
      <div className="flex flex-col h-[70vh]">
        {/* Section Tabs */}
        <div className="flex flex-wrap gap-1 mb-4 pb-3 border-b border-gray-700">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-gray-300">
          {activeSection === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Triple Threat Tournament</h3>
              <p>
                A multi-game tournament combining <span className="text-red-400">Smash Bros</span>,{' '}
                <span className="text-purple-400">Speed Chess</span>, and{' '}
                <span className="text-green-400">Ping-Pong</span> into one ultimate competition!
              </p>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Tournament Flow</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Registration (8-11 players)</li>
                  <li>Swiss Rounds (12-17 rounds based on player count)</li>
                  <li>Sync Matches (equalize match counts)</li>
                  <li>Champion Reveals (+5 bonus points each)</li>
                  <li>Playoffs (Top 4 compete)</li>
                  <li>Finals (Best of 3)</li>
                  <li>Triple Threat Champion crowned!</li>
                </ol>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">The Three Games</h4>
                <ul className="space-y-2 text-sm">
                  <li><span className="text-red-400">🎮 Smash Bros</span> - 3 stocks, 7 min time limit</li>
                  <li><span className="text-purple-400">♙ Speed Chess</span> - 3 min per player (blitz)</li>
                  <li><span className="text-green-400">🏓 Ping-Pong</span> - First to 11, win by 2</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'pingPong' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-green-400">Ping Pong Rules</h3>
              <p>
                Games follow official table tennis rules. Play to 11 points, win by 2.
              </p>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Scoring</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Games are played to <span className="text-yellow-400">11 points</span></li>
                  <li>Must win by <span className="text-yellow-400">2 points</span></li>
                  <li><span className="text-yellow-400">Dominant win:</span> Hold opponent to 4 or fewer points</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Serving Rules</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Each side alternates serving <span className="text-yellow-400">2 points</span> at a time</li>
                  <li><span className="text-red-400">Exception:</span> At 10-10 (deuce), service alternates every point</li>
                  <li>Hold ball in open palm behind your end of the table</li>
                  <li>Toss the ball at least <span className="text-yellow-400">6 inches</span> straight up</li>
                  <li>Strike the ball on the way down</li>
                  <li>Ball must bounce on your side first, then opponent's side</li>
                  <li>In singles, no restriction on where the ball lands</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Can You Lose on Your Serve?</h4>
                <p className="text-sm">
                  <span className="text-yellow-400">Yes!</span> There is no separate rule for serving on game point.
                  You can absolutely lose the game while serving.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Let Serves</h4>
                <p className="text-sm">
                  If a served ball hits the net on the way over but otherwise legally bounces in play,
                  it's a <span className="text-yellow-400">"let" serve</span> and is done over. There is no limit on let serves.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Rally Rules</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><span className="text-red-400">No volleys:</span> You cannot hit the ball before it bounces on your side</li>
                  <li>If you hit a ball that spins back over the net without opponent touching it, that's your point</li>
                  <li>Ball touching your paddle hand during a legal hit is allowed</li>
                  <li>Ball touching your non-paddle hand = opponent's point</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Table & Edge Balls</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>You may touch the table with your paddle hand or body</li>
                  <li><span className="text-red-400">Moving the table</span> during a rally = opponent's point</li>
                  <li>Ball hitting the <span className="text-green-400">top edge</span> of the table is valid</li>
                  <li>Ball hitting the <span className="text-red-400">vertical sides</span> does not count</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Disputes</h4>
                <p className="text-sm">
                  If players disagree on a call, use the <span className="text-yellow-400">honor system</span>.
                  Find a way to agree, or play the point over.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'smash' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-red-400">Super Smash Bros Ultimate Rules</h3>
              <p>
                Tournament-style rules with a pre-tournament character draft system.
              </p>

              <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
                <h4 className="font-semibold text-red-400 mb-2">Character Draft (Snake Format)</h4>
                <p className="text-sm mb-2">
                  Before the tournament begins, all players draft <span className="text-yellow-400">3 characters</span> each
                  from the full Smash Ultimate roster (including DLC).
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Draft order is determined randomly</li>
                  <li><span className="text-yellow-400">Snake format:</span> Order reverses each round (1-2-3...3-2-1...1-2-3...)</li>
                  <li>Once a character is drafted, no other player may select them</li>
                  <li>You may only play your drafted characters in tournament matches</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Match Format</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><span className="text-yellow-400">3 stocks</span> per player</li>
                  <li><span className="text-yellow-400">7 minute</span> time limit</li>
                  <li>If time runs out: <span className="text-red-400">Sudden Death</span> determines winner</li>
                  <li><span className="text-yellow-400">Dominant win:</span> Win with all 3 stocks remaining (3-stock victory)</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Character Selection Order</h4>
                <p className="text-sm mb-2">
                  Character selection uses <span className="text-yellow-400">leaderboard position</span>:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Player <span className="text-green-400">higher on the leaderboard</span> selects their character first</li>
                  <li>Player <span className="text-red-400">lower on the leaderboard</span> selects second (counterpick advantage)</li>
                  <li>Characters must be from your drafted pool of 3</li>
                </ol>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Stage Selection</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Players may <span className="text-green-400">mutually agree</span> on any tournament-legal stage</li>
                  <li>If no agreement: stage is selected <span className="text-yellow-400">randomly</span> from legal stages</li>
                </ul>
                <p className="text-sm mt-2 text-gray-400">
                  Tournament legal stages: Battlefield, Small Battlefield, Final Destination,
                  Smashville, Town & City, Pokémon Stadium 2, Kalos Pokémon League, Hollow Bastion
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Additional Rules</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Items: <span className="text-red-400">Off</span></li>
                  <li>Stage hazards: <span className="text-red-400">Off</span></li>
                  <li>Final Smash meter: <span className="text-red-400">Off</span></li>
                  <li>Team attack (if applicable): <span className="text-green-400">On</span></li>
                  <li>Pause: <span className="text-red-400">Off</span> (accidental pause = warning, then stock loss)</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'chess' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-purple-400">Speed Chess Rules</h3>
              <p>
                Fast-paced chess with strict time controls. Quick thinking is essential!
              </p>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Time Control</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><span className="text-yellow-400">3 minutes</span> per player (blitz format)</li>
                  <li>No increment (3|0)</li>
                  <li>Use a phone app with a chess clock (e.g., Chess Clock, Chess.com app)</li>
                  <li>Player must hit the clock with the <span className="text-yellow-400">same hand</span> that moved the piece</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Determining Colors</h4>
                <p className="text-sm mb-2">
                  Use the classic <span className="text-yellow-400">"pawn in hand"</span> method:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>One player hides a white pawn in one hand and black pawn in the other</li>
                  <li>Opponent picks a hand</li>
                  <li>Color revealed determines who plays that color</li>
                </ol>
                <p className="text-sm mt-2 text-gray-400">
                  Alternative: Coin flip - winner chooses color
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Ways to Win</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><span className="text-green-400">Checkmate</span> - King is in check with no legal escape</li>
                  <li><span className="text-green-400">Timeout</span> - Opponent's clock runs to zero</li>
                  <li><span className="text-green-400">Resignation</span> - Opponent resigns</li>
                </ul>
                <p className="text-sm mt-2">
                  <span className="text-yellow-400">Dominant win:</span> Victory by checkmate (not timeout or resignation)
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Draw Conditions</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><span className="text-blue-400">Stalemate</span> - No legal moves but not in check</li>
                  <li><span className="text-blue-400">Insufficient material</span> - Neither player can checkmate (K vs K, K vs K+B, K vs K+N)</li>
                  <li><span className="text-blue-400">Threefold repetition</span> - Same position occurs 3 times</li>
                  <li><span className="text-blue-400">50-move rule</span> - 50 moves without pawn move or capture</li>
                  <li><span className="text-blue-400">Mutual agreement</span> - Both players agree to draw</li>
                  <li><span className="text-blue-400">Timeout vs insufficient material</span> - If your opponent runs out of time but you can't possibly checkmate (e.g., you only have a king), it's a draw</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Touch-Move Rule</h4>
                <p className="text-sm">
                  <span className="text-yellow-400">Touch a piece, move that piece.</span> If you touch one of your pieces,
                  you must move it if legal. If you touch an opponent's piece, you must capture it if legal.
                  Adjust pieces only by saying "adjust" or "j'adoube" first.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Illegal Moves</h4>
                <p className="text-sm">
                  In speed chess, if you make an illegal move (e.g., moving into check, illegal castle),
                  your opponent may claim a win or simply point out the error. Be vigilant!
                  If neither player notices until several moves later, play continues from the current position.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Handling Draws in Tournament</h4>
                <p className="text-sm mb-2">
                  If a game ends in a draw, count <span className="text-yellow-400">remaining material</span> to determine the winner:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Queen: <span className="text-yellow-400">9</span> points</li>
                  <li>Rook: <span className="text-yellow-400">5</span> points</li>
                  <li>Bishop: <span className="text-yellow-400">3</span> points</li>
                  <li>Knight: <span className="text-yellow-400">3</span> points</li>
                  <li>Pawn: <span className="text-yellow-400">1</span> point</li>
                </ul>
                <p className="text-sm mt-2">
                  Player with more material points wins. If material is equal, player with <span className="text-yellow-400">more time remaining</span> on their clock wins.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'rounds' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Swiss Rounds</h3>
              <p>
                Each round features 3 simultaneous matches (one of each game type).
                6 players compete while the rest are "on deck" for betting.
              </p>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Swiss Pairing System</h4>
                <p className="text-sm mb-2">
                  Players are paired using a smart matchmaking algorithm:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><span className="text-yellow-400">Skill matching:</span> Players with similar records face each other (avoids 2-0 vs 0-0)</li>
                  <li><span className="text-yellow-400">Station rotation:</span> Players don't stay at the same game multiple rounds in a row</li>
                  <li><span className="text-yellow-400">No rematches:</span> Can't face same opponent twice in the same game</li>
                  <li><span className="text-yellow-400">Balance:</span> Each player targets 3 matches per game (~9 total)</li>
                  <li><span className="text-yellow-400">First meetings:</span> Prioritizes matchups between players who haven't faced each other</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Round Count by Players</h4>
                <ul className="space-y-1 text-sm">
                  <li><span className="text-white">8 players:</span> 12 rounds</li>
                  <li><span className="text-white">9 players:</span> 14 rounds</li>
                  <li><span className="text-white">10 players:</span> 15 rounds</li>
                  <li><span className="text-white">11 players:</span> 17 rounds</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Sync Matches</h4>
                <p className="text-sm">
                  After Swiss rounds, players who have fewer than 3 matches in any game type
                  play "sync" matches to equalize. A volunteer opponent is selected, but only
                  the underserved player's stats are affected.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'betting' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Betting System</h3>
              <p>
                Players who are "on deck" (not playing in the current round) can place bets
                on match outcomes.
              </p>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">How to Bet</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Drag your avatar to the player you think will win</li>
                  <li>Each player can place <span className="text-yellow-400">1 bet per round</span></li>
                  <li>Bets must be placed before the 90-second timer ends</li>
                  <li>Once games start, betting is locked</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Bet Payouts</h4>
                <ul className="space-y-1 text-sm">
                  <li><span className="text-green-400">Correct prediction:</span> +1 point</li>
                  <li><span className="text-red-400">Wrong prediction:</span> -1 point</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Best Gambler Award</h4>
                <p className="text-sm">
                  At tournament end, the player with the highest gambling profit receives
                  a <span className="text-yellow-400">+3 point bonus</span> (must have positive profit).
                </p>
              </div>
            </div>
          )}

          {activeSection === 'scoring' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Scoring System</h3>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Match Points</h4>
                <ul className="space-y-1 text-sm">
                  <li><span className="text-green-400">Regular Win:</span> +3 points</li>
                  <li><span className="text-yellow-400">Dominant Win:</span> +5 points</li>
                  <li><span className="text-red-400">Loss:</span> 0 points</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">What is a Dominant Win?</h4>
                <p className="text-sm mb-2">A dominant win (+5 pts instead of +3) is awarded when:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><span className="text-red-400">Smash:</span> 3-stock victory</li>
                  <li><span className="text-purple-400">Chess:</span> Win by checkmate</li>
                  <li><span className="text-green-400">Ping-Pong:</span> Hold opponent to 4 or fewer points</li>
                </ul>
              </div>

              <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
                <h4 className="font-semibold text-red-400 mb-2">Resignation / Refusal to Play</h4>
                <p className="text-sm text-red-200">
                  If a player resigns or refuses to play a match, their opponent automatically receives
                  a <span className="text-yellow-400">dominant win (+5 pts)</span> and the resigner must
                  take a <span className="text-yellow-400">penalty shot</span>.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Bonus Points</h4>
                <ul className="space-y-1 text-sm">
                  <li><span className="text-purple-400">Game Champion:</span> +5 points (each game)</li>
                  <li><span className="text-yellow-400">Best Gambler:</span> +5 points</li>
                  <li><span className="text-green-400">Correct Bet:</span> +1 point</li>
                  <li><span className="text-red-400">Wrong Bet:</span> -1 point</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'champions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Game Champions</h3>
              <p>
                After all Swiss rounds and Sync matches complete, champions are crowned for each
                individual game type.
              </p>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Champion Titles</h4>
                <ul className="space-y-2 text-sm">
                  <li><span className="text-red-400">🎮 Smash Champion</span> - Best Smash Bros record</li>
                  <li><span className="text-purple-400">♙ Chess Champion</span> - Best Speed Chess record</li>
                  <li><span className="text-green-400">🏓 Ping-Pong Champion</span> - Best Ping-Pong record</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Champion Selection</h4>
                <p className="text-sm mb-2">
                  Each game champion is determined by:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Most wins in that game type</li>
                  <li>Game-specific Buchholz score (tiebreaker)</li>
                  <li>Head-to-head record (if still tied)</li>
                  <li>Dominant wins in that game</li>
                </ol>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Champion Bonus</h4>
                <p className="text-sm">
                  Each game champion receives <span className="text-yellow-400">+5 points</span> added
                  to their total score before playoff seeding.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'playoffs' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Playoff Bracket</h3>
              <p>
                The top 4 players by total points advance to the playoff bracket.
              </p>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Seeding</h4>
                <p className="text-sm mb-2">Players are seeded 1-4 by total points:</p>
                <ul className="space-y-1 text-sm">
                  <li><span className="text-white">Semifinal 1:</span> #1 Seed vs #4 Seed</li>
                  <li><span className="text-white">Semifinal 2:</span> #2 Seed vs #3 Seed</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Semifinals</h4>
                <p className="text-sm">
                  Single elimination matches. The <span className="text-yellow-400">higher seed picks the game type</span> for
                  their semifinal match.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">3rd Place Match (Optional)</h4>
                <p className="text-sm mb-2">
                  The two semifinal losers can compete for 3rd place:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Players mutually agree on the game type</li>
                  <li>Winner takes 3rd place, loser gets 4th</li>
                  <li>Can be <span className="text-yellow-400">skipped</span> - 3rd/4th determined by total points instead</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Finals - Best of 3</h4>
                <p className="text-sm mb-2">
                  The two semifinal winners compete in a best-of-3 finals:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Higher seed picks Game 1</li>
                  <li>Lower seed picks Game 2</li>
                  <li>Higher seed picks Game 3 (if needed)</li>
                  <li>First to 2 wins becomes the Triple Threat Champion!</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Playoff Betting</h4>
                <p className="text-sm">
                  Spectators (players not competing in the current playoff match) can place bets
                  on match outcomes. Same rules apply: <span className="text-green-400">+1</span> for
                  correct, <span className="text-red-400">-1</span> for wrong.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'tiebreakers' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Tiebreaker Rules</h3>
              <p>
                When players are tied on points, the following tiebreakers are applied in order:
              </p>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Overall Standings Tiebreakers</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    <span className="text-yellow-400">Buchholz Score</span>
                    <p className="ml-5 text-gray-400">Sum of all opponents' win counts. Playing stronger opponents = higher Buchholz.</p>
                  </li>
                  <li>
                    <span className="text-yellow-400">Head-to-Head Record</span>
                    <p className="ml-5 text-gray-400">Direct match results between tied players.</p>
                  </li>
                  <li>
                    <span className="text-yellow-400">Dominant Wins</span>
                    <p className="ml-5 text-gray-400">Total number of dominant victories.</p>
                  </li>
                  <li>
                    <span className="text-yellow-400">Fan Favorite</span>
                    <p className="ml-5 text-gray-400">If still tied, whoever received the most bets (regardless of outcome). The fans choose!</p>
                  </li>
                </ol>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Game-Specific Tiebreakers</h4>
                <p className="text-sm mb-2">
                  For individual game championships:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Game-specific Buchholz score</li>
                  <li>Head-to-head in that specific game</li>
                  <li>Dominant wins in that game</li>
                </ol>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">What is Buchholz?</h4>
                <p className="text-sm">
                  The Buchholz score measures opponent strength. It's calculated by summing
                  the total wins of everyone you've played against. A higher Buchholz means
                  you faced tougher competition.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'drinking' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Drinking Rules</h3>
              <p>
                To keep things interesting (and level the playing field), periodic drinking
                announcements occur throughout the tournament.
              </p>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Shot Time Announcements</h4>
                <p className="text-sm mb-2">
                  At approximately <span className="text-yellow-400">30%</span>, <span className="text-yellow-400">60%</span>, and{' '}
                  <span className="text-yellow-400">90%</span> through the Swiss rounds:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>The screen displays a "SHOT TIME!" announcement</li>
                  <li>The <span className="text-red-400">top 3 players</span> on the leaderboard must take a shot</li>
                  <li>This helps equalize the odds as the tournament progresses!</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Drinking Round Timing</h4>
                <ul className="space-y-1 text-sm">
                  <li><span className="text-white">8 players (12 rounds):</span> Rounds 4, 7, 11</li>
                  <li><span className="text-white">9 players (14 rounds):</span> Rounds 4, 8, 13</li>
                  <li><span className="text-white">10 players (15 rounds):</span> Rounds 5, 9, 14</li>
                  <li><span className="text-white">11 players (17 rounds):</span> Rounds 5, 10, 15</li>
                </ul>
              </div>

              <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
                <h4 className="font-semibold text-purple-400 mb-2">The Foreshadower</h4>
                <p className="text-sm text-purple-200 mb-2">
                  When a player correctly predicts <span className="text-yellow-400">5 bets in a row</span>,
                  they become "The Foreshadower" and gain a special power:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-purple-200">
                  <li>Choose <span className="text-red-400">any player</span> to take a penalty shot</li>
                  <li>The streak resets after using this power</li>
                  <li>A wrong bet resets the streak</li>
                </ul>
              </div>

              <div className="bg-amber-900/30 border border-amber-600 rounded-lg p-4">
                <h4 className="font-semibold text-amber-400 mb-2">Drink Responsibly!</h4>
                <p className="text-sm text-amber-200">
                  This is meant to be fun! Non-alcoholic alternatives are always acceptable.
                  Know your limits and stay safe.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
