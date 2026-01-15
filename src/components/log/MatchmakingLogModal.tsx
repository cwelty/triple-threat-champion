import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { GAME_ICONS, GAME_NAMES } from '../../types';
import type { MatchmakingLog } from '../../utils/swissPairing';

interface MatchmakingLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: MatchmakingLog[];
}

export function MatchmakingLogModal({ isOpen, onClose, logs }: MatchmakingLogModalProps) {
  const [selectedRound, setSelectedRound] = useState<number | null>(
    logs.length > 0 ? logs[logs.length - 1].roundNumber : null
  );
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);

  const currentLog = logs.find((l) => l.roundNumber === selectedRound);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Matchmaking Log" size="lg">
      <div className="space-y-4">
        {/* Round Selector */}
        <div className="flex flex-wrap gap-2">
          {logs.map((log) => (
            <button
              key={log.roundNumber}
              onClick={() => {
                setSelectedRound(log.roundNumber);
                setExpandedEntry(null);
              }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                selectedRound === log.roundNumber
                  ? 'bg-[#e60012] text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Round {log.roundNumber}
            </button>
          ))}
        </div>

        {logs.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No matchmaking logs yet. Start a round to see how matches are created.
          </div>
        )}

        {currentLog && (
          <div className="space-y-4">
            {/* Match Entries */}
            {currentLog.entries.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide"
                    style={{ fontFamily: "'Russo One', sans-serif" }}>
                  Matches Created
                </h3>
                {currentLog.entries.map((entry, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedEntry(expandedEntry === idx ? null : idx)}
                      className="w-full p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-700/50 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <span className="text-xl md:text-2xl">{GAME_ICONS[entry.gameType]}</span>
                        <div className="text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm md:text-base">{entry.player1Name}</span>
                            <span className="text-gray-500 text-sm">vs</span>
                            <span className="font-bold text-white text-sm md:text-base">{entry.player2Name}</span>
                          </div>
                          <div className="text-xs md:text-sm text-gray-400">
                            {GAME_NAMES[entry.gameType]}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 justify-between md:justify-end">
                        <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs md:text-sm flex-1 md:flex-none text-center">
                          {entry.reason}
                        </span>
                        <span className={`text-lg transition-transform ${expandedEntry === idx ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </button>

                    {expandedEntry === idx && (
                      <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-3 border-t border-gray-700 pt-3">
                        {/* Player Records */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                          <div className="bg-gray-900 rounded-lg p-2 md:p-3">
                            <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wide mb-1">
                              {entry.player1Name}
                            </div>
                            <div className="text-white font-mono text-sm md:text-base">{entry.player1Record}</div>
                          </div>
                          <div className="bg-gray-900 rounded-lg p-2 md:p-3">
                            <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wide mb-1">
                              {entry.player2Name}
                            </div>
                            <div className="text-white font-mono text-sm md:text-base">{entry.player2Record}</div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="bg-gray-900 rounded-lg p-2 md:p-3">
                          <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wide mb-2">
                            Decision Process
                          </div>
                          <ul className="space-y-1">
                            {entry.details.map((detail, i) => (
                              <li key={i} className="text-xs md:text-sm text-gray-300 flex items-start gap-2">
                                <span className="text-[#e60012] mt-0.5">•</span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Skipped Games */}
            {currentLog.skippedGames.length > 0 && (
              <div className="space-y-2 md:space-y-3">
                <h3 className="text-base md:text-lg font-bold text-purple-400 uppercase tracking-wide"
                    style={{ fontFamily: "'Russo One', sans-serif" }}>
                  Skipped Games
                </h3>
                {currentLog.skippedGames.map((skip, idx) => (
                  <div key={idx} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 md:p-4 flex items-center gap-3 md:gap-4">
                    <span className="text-xl md:text-2xl opacity-50">{GAME_ICONS[skip.gameType]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-purple-400 text-sm md:text-base">{GAME_NAMES[skip.gameType]}</div>
                      <div className="text-xs md:text-sm text-purple-300/70">{skip.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentLog.entries.length === 0 && currentLog.skippedGames.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                No matchmaking data for this round.
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">
            Matchmaking Priority Order
          </h4>
          <div className="text-xs text-gray-500 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-[#ffd700] font-bold min-w-[20px]">1.</span>
              <p><span className="text-[#ffd700]">Both need game:</span> If two players each have 2/3 matches in a game, they're paired regardless of record difference</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#e60012] font-bold min-w-[20px]">2.</span>
              <p><span className="text-[#e60012]">Last chance:</span> Players who haven't met and this is their only remaining opportunity to face each other</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-400 font-bold min-w-[20px]">3.</span>
              <p><span className="text-orange-400">Critical scarcity:</span> Players with very few valid opponents remaining get priority</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 font-bold min-w-[20px]">4.</span>
              <p><span className="text-purple-400">Skill matching:</span> Avoid large record mismatches (e.g., 2-0 vs 0-0) unless both players urgently need the game</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold min-w-[20px]">5.</span>
              <p><span className="text-blue-400">Station rotation:</span> Players who played this game last round are less likely to stay there</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold min-w-[20px]">6.</span>
              <p><span className="text-green-400">First-time matchups:</span> Prioritize players who haven't faced each other in any game (with similar skill)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-400 font-bold min-w-[20px]">7.</span>
              <p><span className="text-gray-400">Cross-game variety:</span> Prefer pairing players who have faced each other in fewer games overall</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3 italic">
            No rematches are allowed within the same game type. Each player targets 3 matches per game (~9 total).
          </p>
        </div>
      </div>
    </Modal>
  );
}
