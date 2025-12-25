import React from 'react';
import type { GameType } from '../../types';
import { GAME_ICONS, GAME_NAMES } from '../../types';

interface GamePickerProps {
  onSelect: (gameType: GameType) => void;
  pickerName: string;
  disabledGames?: GameType[];
}

const gameColors = {
  smash: 'from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-red-400',
  chess: 'from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 border-purple-400',
  pingPong: 'from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 border-green-400',
};

export function GamePicker({ onSelect, pickerName, disabledGames = [] }: GamePickerProps) {
  const games: GameType[] = ['smash', 'chess', 'pingPong'];

  return (
    <div className="smash-card rounded-lg p-6 text-center animate-zoom-in">
      <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wider"
          style={{ fontFamily: "'Russo One', sans-serif" }}>
        <span className="text-[#ffd700]">{pickerName}</span>
        <span className="text-white"> Picks!</span>
      </h3>
      <p className="text-gray-400 mb-6 uppercase tracking-wide text-sm">Select which game to play</p>

      <div className="grid grid-cols-3 gap-4">
        {games.map((game) => {
          const isDisabled = disabledGames.includes(game);

          return (
            <button
              key={game}
              onClick={() => !isDisabled && onSelect(game)}
              disabled={isDisabled}
              className={`
                p-6 rounded-lg transition-all duration-300 relative border-2 transform
                ${isDisabled
                  ? 'bg-gray-800 border-gray-600 opacity-30 cursor-not-allowed'
                  : `bg-gradient-to-b ${gameColors[game]} hover:scale-110 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer`
                }
              `}
              title={isDisabled ? 'Already played in this series' : `Pick ${GAME_NAMES[game]}`}
            >
              <div className={`text-5xl mb-3 ${!isDisabled ? 'animate-bounce-in' : ''}`}>{GAME_ICONS[game]}</div>
              <div className="font-bold text-white uppercase tracking-wider text-sm"
                   style={{ fontFamily: "'Russo One', sans-serif" }}>
                {GAME_NAMES[game]}
              </div>
              {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <span className="text-red-500 text-4xl">✕</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
