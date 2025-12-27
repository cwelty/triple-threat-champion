import React, { useState, useMemo } from 'react';
import type { Match, Player, Bet, GameType } from '../../types';
import { GAME_NAMES } from '../../types';
import { getAvatarEmoji } from '../../data/avatars';

// Order: Ping Pong (left), Smash (middle), Chess (right)
const GAME_ORDER: Record<GameType, number> = {
  pingPong: 0,
  smash: 1,
  chess: 2,
};

interface BettingInterfaceProps {
  matches: Match[];
  players: Player[];
  onDeckPlayers: Player[];
  currentBets: Bet[];
  onPlaceBet: (bettorId: string, matchId: string, predictedWinnerId: string) => void;
  onRemoveBet: (bettorId: string) => void;
  isLocked: boolean;
}

export function BettingInterface({
  matches,
  players,
  onDeckPlayers,
  currentBets,
  onPlaceBet,
  onRemoveBet,
  isLocked,
}: BettingInterfaceProps) {
  const [draggedBettor, setDraggedBettor] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredDropZone, setHoveredDropZone] = useState<string | null>(null);
  // For mobile tap-to-bet
  const [selectedBettor, setSelectedBettor] = useState<string | null>(null);

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  // Check if a bettor has already placed a bet this round
  const hasBettorBet = (bettorId: string) => {
    return currentBets.some((b) => b.bettorId === bettorId);
  };

  // Get the bet for a specific player in a match
  const getBetsForPlayer = (matchId: string, playerId: string) => {
    return currentBets.filter(
      (b) => b.matchId === matchId && b.predictedWinnerId === playerId
    );
  };

  const handleDragStart = (e: React.DragEvent, bettorId: string) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    setDraggedBettor(bettorId);
    setIsDragging(true);
    e.dataTransfer.setData('bettorId', bettorId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setHoveredDropZone(zoneId);
  };

  const handleDragLeave = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if we're actually leaving this zone (not entering a child)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (hoveredDropZone === zoneId) {
        setHoveredDropZone(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, matchId: string, playerId: string) => {
    e.preventDefault();
    const bettorId = e.dataTransfer.getData('bettorId');
    if (bettorId && !isLocked) {
      // This will place a new bet or update an existing one
      onPlaceBet(bettorId, matchId, playerId);
    }
    setDraggedBettor(null);
    setIsDragging(false);
    setHoveredDropZone(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedBettor(null);
    setIsDragging(false);
    setHoveredDropZone(null);
  };

  // Mobile tap-to-bet handlers
  const handleTapBettor = (bettorId: string) => {
    if (isLocked) return;
    if (selectedBettor === bettorId) {
      setSelectedBettor(null); // Deselect if tapping same bettor
    } else {
      setSelectedBettor(bettorId);
    }
  };

  const handleTapTarget = (matchId: string, playerId: string) => {
    if (isLocked || !selectedBettor) return;
    onPlaceBet(selectedBettor, matchId, playerId);
    setSelectedBettor(null);
  };

  // Get bettors who haven't bet yet
  const availableBettors = onDeckPlayers.filter((p) => !hasBettorBet(p.id));
  const bettorsWhoBet = onDeckPlayers.filter((p) => hasBettorBet(p.id));

  return (
    <div className="space-y-4">
      {/* Betting Status Banner */}
      <div className={`smash-card rounded-lg p-4 flex items-center justify-between border-[#ffd700] ${
        availableBettors.length === 0 ? 'bg-gradient-to-r from-[#ffd700]/20 via-[#ffd700]/10 to-[#ffd700]/20' : ''
      }`} style={{ animation: 'electric-border 2s ease-in-out infinite' }}>
        <div className="flex items-center gap-4">
          <span className="text-4xl">
            {availableBettors.length === 0
              ? '⚔️'
              : '💰'}
          </span>
          <div>
            <p className="font-bold uppercase tracking-wider text-lg text-[#ffd700]"
               style={{ fontFamily: "'Russo One', sans-serif" }}>
              {availableBettors.length === 0
                ? 'Let the Games Begin!'
                : `${availableBettors.length} Player${availableBettors.length === 1 ? '' : 's'} May Still Bet`}
            </p>
            {availableBettors.length > 0 && (
              <p className="text-gray-400 text-sm mt-1">
                {availableBettors.map((p) => p.nickname).join(', ')}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="points-display text-3xl">
            {bettorsWhoBet.length}/{onDeckPlayers.length}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Bets Placed</div>
        </div>
      </div>

      {/* On-Deck Players - Draggable */}
      <div className="smash-card rounded-lg p-4">
        <h3 className="font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2"
            style={{ fontFamily: "'Russo One', sans-serif" }}>
          <span className="text-[#e60012]">On Deck</span>
          <span className="text-gray-500">-</span>
          <span className="text-gray-400 text-sm font-normal hidden md:inline">Drag to Place Bet</span>
          <span className="text-gray-400 text-sm font-normal md:hidden">Tap to Select, Then Tap Target</span>
        </h3>
        {selectedBettor && (
          <div className="md:hidden mb-3 p-2 bg-[#ffd700]/20 border border-[#ffd700] rounded-lg text-center">
            <span className="text-[#ffd700] text-sm font-bold">
              {getPlayer(selectedBettor)?.nickname} selected - tap a player to bet on them
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {availableBettors.map((player) => (
            <div
              key={player.id}
              draggable={!isLocked}
              onDragStart={(e) => handleDragStart(e, player.id)}
              onDragEnd={handleDragEnd}
              onClick={() => handleTapBettor(player.id)}
              className={`
                bet-chip flex items-center gap-2 px-4 py-3 rounded-lg border-2 select-none transition-all duration-200
                ${isLocked
                  ? 'bg-gray-800 border-gray-600 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#ffd700]/20 to-[#daa520]/20 border-[#ffd700] cursor-grab md:cursor-grab cursor-pointer active:cursor-grabbing hover:shadow-[0_0_20px_rgba(255,215,0,0.4)]'}
                ${draggedBettor === player.id ? 'opacity-50 ring-2 ring-white scale-110' : ''}
                ${selectedBettor === player.id ? 'bg-[#ffd700]/50 border-[#ffd700] shadow-[0_0_40px_rgba(255,215,0,1)]' : ''}
              `}
            >
              <span className="text-2xl">{getAvatarEmoji(player.avatar)}</span>
              <span className="text-white font-bold tracking-wide"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                {player.nickname}
              </span>
              <span className="text-[#ffd700] text-xs font-bold uppercase ml-1 animate-pulse">Bet!</span>
            </div>
          ))}

        </div>

        {bettorsWhoBet.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#333]">
            <p className="text-xs text-green-400 mb-3 font-bold uppercase tracking-wider">
              Already Bet ({bettorsWhoBet.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {bettorsWhoBet.map((player) => (
                <div
                  key={player.id}
                  className="group relative flex items-center gap-2 px-3 py-2 bg-green-900/30 border border-green-500/50 rounded-lg"
                  title={`${player.nickname} has bet${!isLocked ? ' - click X to cancel' : ''}`}
                >
                  <span className="text-xl">{getAvatarEmoji(player.avatar)}</span>
                  <span className="text-green-400 text-sm font-bold">✓</span>
                  {!isLocked && (
                    <button
                      onClick={() => onRemoveBet(player.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-bold opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                      title={`Cancel ${player.nickname}'s bet`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Matches with Drop Zones */}
      <div className="flex flex-wrap justify-center gap-4">
        {[...matches].sort((a, b) => GAME_ORDER[a.gameType] - GAME_ORDER[b.gameType]).map((match) => {
          const player1 = getPlayer(match.player1Id);
          const player2 = getPlayer(match.player2Id);
          const betsOnPlayer1 = getBetsForPlayer(match.id, match.player1Id);
          const betsOnPlayer2 = getBetsForPlayer(match.id, match.player2Id);

          return (
            <div key={match.id} className="bg-gray-800 rounded-xl p-4 w-72">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-lg font-semibold text-white">{GAME_NAMES[match.gameType]}</span>
              </div>

              <div className="flex items-start gap-2">
                {/* Player 1 Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, `${match.id}-${match.player1Id}`)}
                  onDragLeave={(e) => handleDragLeave(e, `${match.id}-${match.player1Id}`)}
                  onDrop={(e) => handleDrop(e, match.id, match.player1Id)}
                  onClick={() => handleTapTarget(match.id, match.player1Id)}
                  className={`
                    flex-1 p-3 rounded-lg text-center transition-colors
                    ${hoveredDropZone === `${match.id}-${match.player1Id}`
                      ? 'border-2 border-solid border-[#ffd700] bg-[#ffd700]/20 shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                      : isDragging
                        ? 'border-2 border-dashed border-blue-400 bg-blue-900/20'
                        : selectedBettor
                          ? 'border-2 border-dashed border-[#ffd700] bg-[#ffd700]/10 cursor-pointer'
                          : 'bg-gray-700'}
                  `}
                >
                  <div className="text-2xl mb-1 pointer-events-none">{player1 ? getAvatarEmoji(player1.avatar) : '?'}</div>
                  <div className="font-medium text-white text-sm truncate pointer-events-none">{player1?.nickname ?? '?'}</div>

                  {/* Show bettors who picked this player */}
                  {betsOnPlayer1.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mt-2 pt-2 border-t border-gray-600 pointer-events-none">
                      {betsOnPlayer1.map((bet) => {
                        const bettor = getPlayer(bet.bettorId);
                        return (
                          <span
                            key={bet.id}
                            className="text-lg"
                            title={`${bettor?.nickname} bet on ${player1?.nickname}`}
                          >
                            {bettor ? getAvatarEmoji(bettor.avatar) : '?'}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center text-gray-500 font-bold text-sm">VS</div>

                {/* Player 2 Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, `${match.id}-${match.player2Id}`)}
                  onDragLeave={(e) => handleDragLeave(e, `${match.id}-${match.player2Id}`)}
                  onDrop={(e) => handleDrop(e, match.id, match.player2Id)}
                  onClick={() => handleTapTarget(match.id, match.player2Id)}
                  className={`
                    flex-1 p-3 rounded-lg text-center transition-colors
                    ${hoveredDropZone === `${match.id}-${match.player2Id}`
                      ? 'border-2 border-solid border-[#ffd700] bg-[#ffd700]/20 shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                      : isDragging
                        ? 'border-2 border-dashed border-blue-400 bg-blue-900/20'
                        : selectedBettor
                          ? 'border-2 border-dashed border-[#ffd700] bg-[#ffd700]/10 cursor-pointer'
                          : 'bg-gray-700'}
                  `}
                >
                  <div className="text-2xl mb-1 pointer-events-none">{player2 ? getAvatarEmoji(player2.avatar) : '?'}</div>
                  <div className="font-medium text-white text-sm truncate pointer-events-none">{player2?.nickname ?? '?'}</div>

                  {/* Show bettors who picked this player */}
                  {betsOnPlayer2.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mt-2 pt-2 border-t border-gray-600 pointer-events-none">
                      {betsOnPlayer2.map((bet) => {
                        const bettor = getPlayer(bet.bettorId);
                        return (
                          <span
                            key={bet.id}
                            className="text-lg"
                            title={`${bettor?.nickname} bet on ${player2?.nickname}`}
                          >
                            {bettor ? getAvatarEmoji(bettor.avatar) : '?'}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isLocked && (
        <p className="text-center text-yellow-400 text-sm font-medium">
          Betting is locked - games in progress
        </p>
      )}
    </div>
  );
}
