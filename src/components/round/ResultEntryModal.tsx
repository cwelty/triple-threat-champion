import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Match, Player } from '../../types';
import { GAME_ICONS, GAME_NAMES } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';
import { getCharacterName } from '../../data/smashCharacters';

interface ResultEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  player1: Player | undefined;
  player2: Player | undefined;
  onSubmit: (matchId: string, winnerId: string, isDominant: boolean, player1Character?: string, player2Character?: string) => void;
  // For determining who picks character first (higher on leaderboard)
  player1Standing?: number;
  player2Standing?: number;
}

const DOMINANT_DESCRIPTIONS = {
  smash: '3-stock victory',
  chess: 'Win by checkmate',
  pingPong: 'Opponent scored 5 or fewer points',
};

export function ResultEntryModal({
  isOpen,
  onClose,
  match,
  player1,
  player2,
  onSubmit,
  player1Standing = 0,
  player2Standing = 0,
}: ResultEntryModalProps) {
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [isDominant, setIsDominant] = useState(false);
  const [player1Character, setPlayer1Character] = useState<string>('');
  const [player2Character, setPlayer2Character] = useState<string>('');

  // Determine who picks first (higher standing = lower number = picks first)
  // If standings are equal (e.g., start of tournament), player1 picks first
  const player1PicksFirst = player1Standing <= player2Standing;
  const firstPicker = player1PicksFirst ? player1 : player2;
  const secondPicker = player1PicksFirst ? player2 : player1;

  // Pre-populate if editing existing result
  useEffect(() => {
    if (match && isOpen) {
      setWinnerId(match.winnerId);
      setIsDominant(match.isDominant);
      setPlayer1Character(match.player1Character || '');
      setPlayer2Character(match.player2Character || '');
    }
  }, [match, isOpen]);

  if (!match) return null;

  const isSmash = match.gameType === 'smash';
  const isEditing = match.winnerId !== null;

  // For Smash, both characters must be selected before choosing winner
  const charactersSelected = !isSmash || (player1Character && player2Character);

  const handleSubmit = () => {
    if (!winnerId) return;
    if (isSmash && (!player1Character || !player2Character)) return;
    onSubmit(
      match.id,
      winnerId,
      isDominant,
      isSmash ? player1Character : undefined,
      isSmash ? player2Character : undefined
    );
    setWinnerId(null);
    setIsDominant(false);
    setPlayer1Character('');
    setPlayer2Character('');
    onClose();
  };

  const handleClose = () => {
    setWinnerId(null);
    setIsDominant(false);
    setPlayer1Character('');
    setPlayer2Character('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? "Edit Match Result" : "Enter Match Result"}>
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 text-lg">
          <span>{GAME_ICONS[match.gameType]}</span>
          <span className="font-semibold">{GAME_NAMES[match.gameType]}</span>
        </div>

        {isEditing && (
          <div className="text-center text-yellow-400 text-sm bg-yellow-900/30 rounded-lg py-2">
            Editing will recalculate all affected stats and bets
          </div>
        )}

        {/* Smash Character Selection */}
        {isSmash && player1 && player2 && (
          <div className="bg-gray-800 rounded-lg p-4 space-y-4">
            <div className="text-center text-sm text-gray-400 mb-2">
              Character Selection Order (higher ranked picks first)
            </div>

            {/* First Picker */}
            <div className={`p-3 rounded-lg ${player1PicksFirst ? 'bg-gray-700' : 'bg-gray-700'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getAvatarEmoji(firstPicker!.avatar)}</span>
                <span className="font-medium text-white">{firstPicker!.nickname}</span>
                <span className="text-xs text-green-400 ml-auto">Picks 1st</span>
              </div>
              <select
                value={player1PicksFirst ? player1Character : player2Character}
                onChange={(e) => player1PicksFirst ? setPlayer1Character(e.target.value) : setPlayer2Character(e.target.value)}
                className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select character...</option>
                {firstPicker!.smashDraftedCharacters.map(charId => (
                  <option key={charId} value={charId}>{getCharacterName(charId)}</option>
                ))}
              </select>
            </div>

            {/* Second Picker */}
            <div className={`p-3 rounded-lg ${!player1PicksFirst ? 'bg-gray-700' : 'bg-gray-700'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getAvatarEmoji(secondPicker!.avatar)}</span>
                <span className="font-medium text-white">{secondPicker!.nickname}</span>
                <span className="text-xs text-yellow-400 ml-auto">Picks 2nd</span>
              </div>
              <select
                value={player1PicksFirst ? player2Character : player1Character}
                onChange={(e) => player1PicksFirst ? setPlayer2Character(e.target.value) : setPlayer1Character(e.target.value)}
                disabled={!(player1PicksFirst ? player1Character : player2Character)}
                className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {(player1PicksFirst ? player1Character : player2Character) ? 'Select character...' : 'Waiting for first pick...'}
                </option>
                {secondPicker!.smashDraftedCharacters.map(charId => (
                  <option key={charId} value={charId}>{getCharacterName(charId)}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Winner Selection */}
        {charactersSelected && (
          <>
            <div className="text-center text-gray-400">Select the winner:</div>

            <div className="flex gap-3">
              <button
                onClick={() => setWinnerId(match.player1Id)}
                className={`flex-1 p-4 rounded-lg text-center transition-all ${
                  winnerId === match.player1Id
                    ? 'bg-green-600 ring-2 ring-green-400'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="text-4xl mb-2">{player1 ? getAvatarEmoji(player1.avatar) : '?'}</div>
                <div className="font-semibold text-white">{player1?.nickname ?? '?'}</div>
                {isSmash && player1Character && (
                  <div className="text-xs text-red-300 mt-1">{getCharacterName(player1Character)}</div>
                )}
              </button>

              <button
                onClick={() => setWinnerId(match.player2Id)}
                className={`flex-1 p-4 rounded-lg text-center transition-all ${
                  winnerId === match.player2Id
                    ? 'bg-green-600 ring-2 ring-green-400'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="text-4xl mb-2">{player2 ? getAvatarEmoji(player2.avatar) : '?'}</div>
                <div className="font-semibold text-white">{player2?.nickname ?? '?'}</div>
                {isSmash && player2Character && (
                  <div className="text-xs text-red-300 mt-1">{getCharacterName(player2Character)}</div>
                )}
              </button>
            </div>
          </>
        )}

        {winnerId && !match.isPlayoff && (
          <div className="bg-gray-700 rounded-lg p-3">
            <label className="flex items-start gap-3 cursor-pointer" onClick={() => setIsDominant(!isDominant)}>
              <div
                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  isDominant
                    ? 'bg-yellow-500 border-yellow-500'
                    : 'bg-yellow-500/20 border-yellow-500'
                }`}
              >
                {isDominant && (
                  <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <div className="font-medium text-yellow-400">Dominant Win (+5 pts)</div>
                <div className="text-sm text-gray-400">
                  {DOMINANT_DESCRIPTIONS[match.gameType]}
                </div>
              </div>
            </label>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={!winnerId || (isSmash && (!player1Character || !player2Character))}
            className="flex-1"
          >
            {isEditing ? 'Update Result' : 'Confirm Result'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
