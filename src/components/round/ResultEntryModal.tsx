import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Match, Player } from '../../types';
import { GAME_ICONS, GAME_NAMES } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';

interface ResultEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  player1: Player | undefined;
  player2: Player | undefined;
  onSubmit: (matchId: string, winnerId: string, isDominant: boolean) => void;
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
}: ResultEntryModalProps) {
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [isDominant, setIsDominant] = useState(false);

  // Pre-populate if editing existing result
  useEffect(() => {
    if (match && isOpen) {
      setWinnerId(match.winnerId);
      setIsDominant(match.isDominant);
    }
  }, [match, isOpen]);

  if (!match) return null;

  const isEditing = match.winnerId !== null;

  const handleSubmit = () => {
    if (!winnerId) return;
    onSubmit(match.id, winnerId, isDominant);
    setWinnerId(null);
    setIsDominant(false);
    onClose();
  };

  const handleClose = () => {
    setWinnerId(null);
    setIsDominant(false);
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

        <div className="text-center text-gray-400 mb-4">Select the winner:</div>

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
          </button>
        </div>

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
            disabled={!winnerId}
            className="flex-1"
          >
            {isEditing ? 'Update Result' : 'Confirm Result'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
