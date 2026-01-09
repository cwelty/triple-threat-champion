import React, { useState } from 'react';
import type { Match, Player } from '../../types';
import { getCharacterName } from '../../data/smashCharacters';
import { getAvatarEmoji } from '../../data/avatars';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface SmashCharacterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  player1: Player | undefined;
  player2: Player | undefined;
  player1Standing: number;
  player2Standing: number;
  onConfirm: (matchId: string, player1Character: string, player2Character: string) => void;
}

export function SmashCharacterSelectModal({
  isOpen,
  onClose,
  match,
  player1,
  player2,
  player1Standing,
  player2Standing,
  onConfirm,
}: SmashCharacterSelectModalProps) {
  const [selectedPlayer1Char, setSelectedPlayer1Char] = useState<string | null>(null);
  const [selectedPlayer2Char, setSelectedPlayer2Char] = useState<string | null>(null);

  // Higher standing (lower number) picks first
  const player1PicksFirst = player1Standing <= player2Standing;

  const handleConfirm = () => {
    if (selectedPlayer1Char && selectedPlayer2Char) {
      onConfirm(match.id, selectedPlayer1Char, selectedPlayer2Char);
      setSelectedPlayer1Char(null);
      setSelectedPlayer2Char(null);
    }
  };

  const bothSelected = selectedPlayer1Char && selectedPlayer2Char;

  // Check if first picker has selected
  const firstPickerSelected = player1PicksFirst ? selectedPlayer1Char : selectedPlayer2Char;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Characters">
      <div className="space-y-6">
        <p className="text-gray-400 text-center text-sm">
          Higher ranked player picks first
        </p>

        <div className="grid grid-cols-2 gap-6">
          {/* Player 1 Selection */}
          <div className={`space-y-3 ${!player1PicksFirst && !firstPickerSelected ? 'opacity-50' : ''}`}>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{player1 ? getAvatarEmoji(player1.avatar) : '?'}</span>
                <span className="font-bold text-white">{player1?.nickname ?? 'Player 1'}</span>
              </div>
              <span className={`text-xs font-semibold ${player1PicksFirst ? 'text-green-400' : 'text-yellow-400'}`}>
                {player1PicksFirst ? 'Picks 1st' : 'Picks 2nd'}
              </span>
            </div>
            <div className="space-y-2">
              {player1?.smashDraftedCharacters.map((charId) => (
                <button
                  key={charId}
                  onClick={() => setSelectedPlayer1Char(charId)}
                  disabled={!player1PicksFirst && !firstPickerSelected}
                  className={`
                    w-full px-4 py-3 rounded-lg font-medium transition-all
                    ${selectedPlayer1Char === charId
                      ? 'bg-red-600 text-white ring-2 ring-red-400 ring-offset-2 ring-offset-gray-800'
                      : !player1PicksFirst && !firstPickerSelected
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }
                  `}
                >
                  {getCharacterName(charId)}
                </button>
              ))}
              {(!player1?.smashDraftedCharacters || player1.smashDraftedCharacters.length === 0) && (
                <p className="text-gray-500 text-sm text-center">No characters drafted</p>
              )}
            </div>
          </div>

          {/* Player 2 Selection */}
          <div className={`space-y-3 ${player1PicksFirst && !firstPickerSelected ? 'opacity-50' : ''}`}>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{player2 ? getAvatarEmoji(player2.avatar) : '?'}</span>
                <span className="font-bold text-white">{player2?.nickname ?? 'Player 2'}</span>
              </div>
              <span className={`text-xs font-semibold ${!player1PicksFirst ? 'text-green-400' : 'text-yellow-400'}`}>
                {!player1PicksFirst ? 'Picks 1st' : 'Picks 2nd'}
              </span>
            </div>
            <div className="space-y-2">
              {player2?.smashDraftedCharacters.map((charId) => (
                <button
                  key={charId}
                  onClick={() => setSelectedPlayer2Char(charId)}
                  disabled={player1PicksFirst && !firstPickerSelected}
                  className={`
                    w-full px-4 py-3 rounded-lg font-medium transition-all
                    ${selectedPlayer2Char === charId
                      ? 'bg-red-600 text-white ring-2 ring-red-400 ring-offset-2 ring-offset-gray-800'
                      : player1PicksFirst && !firstPickerSelected
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }
                  `}
                >
                  {getCharacterName(charId)}
                </button>
              ))}
              {(!player2?.smashDraftedCharacters || player2.smashDraftedCharacters.length === 0) && (
                <p className="text-gray-500 text-sm text-center">No characters drafted</p>
              )}
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleConfirm}
            disabled={!bothSelected}
            className="flex-1"
          >
            Confirm Characters
          </Button>
        </div>
      </div>
    </Modal>
  );
}
