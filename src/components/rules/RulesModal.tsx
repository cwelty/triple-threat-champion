import React, { useState } from 'react';
import { Modal } from '../ui/Modal';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RulesSection = 'overview' | 'rounds' | 'betting' | 'scoring' | 'champions' | 'playoffs' | 'tiebreakers' | 'drinking';

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const [activeSection, setActiveSection] = useState<RulesSection>('overview');

  const sections: { id: RulesSection; label: string }[] = [
    { id: 'overview', label: 'Overview' },
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
                  <li><span className="text-red-400">🎮 Smash Bros</span> - 7 minute matches</li>
                  <li><span className="text-purple-400">♙ Speed Chess</span> - 7 minute matches</li>
                  <li><span className="text-green-400">🏓 Ping-Pong</span> - 7 minute matches</li>
                </ul>
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
                  Players are paired based on their game-specific records to ensure fair matchups:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Players with similar records face each other</li>
                  <li>No rematches in the same game type when possible</li>
                  <li>Each player targets 3 matches per game type (~9 total)</li>
                  <li>Players with fewer matches get priority</li>
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
                  <li><span className="text-green-400">Ping-Pong:</span> Hold opponent to 5 or fewer points</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Ping-Pong Rules</h4>
                <p className="text-sm">
                  Games are played to <span className="text-yellow-400">11 points</span>, win by 2.
                </p>
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
                  <li><span className="text-yellow-400">Best Gambler:</span> +3 points</li>
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
