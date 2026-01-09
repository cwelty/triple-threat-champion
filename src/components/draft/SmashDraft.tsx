import React, { useState } from 'react';
import type { Player } from '../../types';
import { SMASH_CHARACTERS, getCharactersGroupedBySeries, getCharacterName } from '../../data/smashCharacters';
import { getAvatarEmoji } from '../../data/avatars';

interface SmashDraftProps {
  players: Player[];
  draftOrder: string[];
  currentDraftPick: number;
  draftedCharacters: string[];
  onDraftCharacter: (playerId: string, characterId: string) => void;
}

// Calculate which player should draft for a given pick number
function getCurrentDrafterIndex(pickNumber: number, playerCount: number): number {
  const round = Math.floor(pickNumber / playerCount);
  const positionInRound = pickNumber % playerCount;

  if (round % 2 === 0) {
    // Forward round (1, 2, 3, ..., N)
    return positionInRound;
  } else {
    // Reverse round (N, N-1, ..., 2, 1)
    return playerCount - 1 - positionInRound;
  }
}

export function SmashDraft({
  players,
  draftOrder,
  currentDraftPick,
  draftedCharacters,
  onDraftCharacter,
}: SmashDraftProps) {
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);

  const playerCount = players.length;
  const totalPicks = playerCount * 3;
  const currentRound = Math.floor(currentDraftPick / playerCount) + 1;
  const currentDrafterIndex = getCurrentDrafterIndex(currentDraftPick, playerCount);
  const currentDrafterId = draftOrder[currentDrafterIndex];
  const currentDrafter = players.find(p => p.id === currentDrafterId);

  const charactersBySeriesMap = getCharactersGroupedBySeries();
  // Sort series by character count (most to least), with "Other" always at the bottom
  const seriesList = Object.keys(charactersBySeriesMap).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return charactersBySeriesMap[b].length - charactersBySeriesMap[a].length;
  });

  const handleCharacterClick = (characterId: string) => {
    if (draftedCharacters.includes(characterId)) return;
    if (!currentDrafterId) return;
    onDraftCharacter(currentDrafterId, characterId);
  };

  // Get player by ID helper
  const getPlayer = (id: string) => players.find(p => p.id === id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-red-400 mb-2">Smash Character Draft</h2>
        <p className="text-gray-400">
          Round {currentRound} of 3 &bull; Pick {currentDraftPick + 1} of {totalPicks}
        </p>
      </div>

      {/* Current Drafter */}
      {currentDrafter && (
        <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-2 border-red-500 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">NOW DRAFTING</p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-5xl">{getAvatarEmoji(currentDrafter.avatar)}</span>
            <div className="text-left">
              <p className="text-2xl font-bold text-white">{currentDrafter.nickname}</p>
              <p className="text-gray-400">{currentDrafter.name}</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-3">
            {currentDrafter.smashDraftedCharacters.length}/3 characters drafted
          </p>
        </div>
      )}

      {/* Draft Order Visualization */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Draft Order (Snake)</h3>
        <div className="space-y-2">
          {[0, 1, 2].map(roundNum => {
            const isReverse = roundNum % 2 === 1;
            const orderForRound = isReverse ? [...draftOrder].reverse() : draftOrder;

            return (
              <div key={roundNum} className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-gray-500 w-16">Round {roundNum + 1}:</span>
                {orderForRound.map((playerId, idx) => {
                  const player = getPlayer(playerId);
                  const pickNum = roundNum * playerCount + (isReverse ? playerCount - 1 - idx : idx);
                  const isCurrentPick = pickNum === currentDraftPick;
                  const isPastPick = pickNum < currentDraftPick;

                  return (
                    <React.Fragment key={`${roundNum}-${playerId}`}>
                      <div
                        className={`
                          flex items-center gap-1 px-2 py-1 rounded text-sm
                          ${isCurrentPick ? 'bg-red-600 ring-2 ring-red-400 ring-offset-2 ring-offset-gray-800' : ''}
                          ${isPastPick ? 'bg-gray-700 opacity-50' : ''}
                          ${!isCurrentPick && !isPastPick ? 'bg-gray-700' : ''}
                        `}
                      >
                        <span>{player ? getAvatarEmoji(player.avatar) : '?'}</span>
                      </div>
                      {idx < orderForRound.length - 1 && (
                        <span className="text-gray-600">{isReverse ? '←' : '→'}</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Character Selection Grid */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Select a Character</h3>
        <div className="space-y-2">
          {seriesList.map(series => {
            const characters = charactersBySeriesMap[series];
            const isExpanded = expandedSeries === series;
            const availableCount = characters.filter(c => !draftedCharacters.includes(c.id)).length;

            return (
              <div key={series} className="border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedSeries(isExpanded ? null : series)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <span className="font-medium text-white">{series}</span>
                  <span className="text-sm text-gray-400">
                    {availableCount}/{characters.length} available
                    <span className="ml-2">{isExpanded ? '▲' : '▼'}</span>
                  </span>
                </button>
                {isExpanded && (
                  <div className="p-3 flex flex-wrap gap-2 bg-gray-800">
                    {characters.map(character => {
                      const isDrafted = draftedCharacters.includes(character.id);
                      return (
                        <button
                          key={character.id}
                          onClick={() => handleCharacterClick(character.id)}
                          disabled={isDrafted}
                          className={`
                            px-3 py-2 rounded-lg text-sm font-medium transition-all
                            ${isDrafted
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed line-through'
                              : 'bg-red-600 hover:bg-red-500 text-white hover:scale-105'
                            }
                          `}
                        >
                          {character.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Drafted Characters Summary */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Drafted So Far</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {draftOrder.map((playerId, idx) => {
            const player = getPlayer(playerId);
            if (!player) return null;

            return (
              <div key={playerId} className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{getAvatarEmoji(player.avatar)}</span>
                  <span className="font-medium text-white text-sm">{player.nickname}</span>
                  <span className="text-xs text-gray-500">#{idx + 1}</span>
                </div>
                <div className="space-y-1">
                  {[0, 1, 2].map(charIdx => {
                    const charId = player.smashDraftedCharacters[charIdx];
                    return (
                      <div
                        key={charIdx}
                        className={`text-xs px-2 py-1 rounded ${
                          charId
                            ? 'bg-red-900/50 text-red-300'
                            : 'bg-gray-600 text-gray-500'
                        }`}
                      >
                        {charId ? getCharacterName(charId) : '???'}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
