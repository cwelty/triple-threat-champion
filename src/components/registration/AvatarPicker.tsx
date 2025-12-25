import React, { useState, useEffect } from 'react';
import { AVATARS } from '../../data/avatars';

interface AvatarPickerProps {
  selectedAvatar: string | null;
  usedAvatars: string[];
  onSelect: (avatarId: string) => void;
}

const AVATARS_PER_PAGE = 16;

export function AvatarPicker({ selectedAvatar, usedAvatars, onSelect }: AvatarPickerProps) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(AVATARS.length / AVATARS_PER_PAGE);
  const startIndex = page * AVATARS_PER_PAGE;
  const visibleAvatars = AVATARS.slice(startIndex, startIndex + AVATARS_PER_PAGE);

  // Auto-navigate to the page containing the selected avatar
  useEffect(() => {
    if (selectedAvatar) {
      const avatarIndex = AVATARS.findIndex((a) => a.id === selectedAvatar);
      if (avatarIndex >= 0) {
        const targetPage = Math.floor(avatarIndex / AVATARS_PER_PAGE);
        if (targetPage !== page) {
          setPage(targetPage);
        }
      }
    }
  }, [selectedAvatar]);

  const goToPrevPage = () => {
    setPage((p) => (p > 0 ? p - 1 : totalPages - 1));
  };

  const goToNextPage = () => {
    setPage((p) => (p < totalPages - 1 ? p + 1 : 0));
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={goToPrevPage}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-xl transition-colors"
          title="Previous page"
        >
          ◀
        </button>

        {/* Avatar Grid */}
        <div className="flex-1 grid grid-cols-4 gap-2">
          {visibleAvatars.map((avatar) => {
            const isUsed = usedAvatars.includes(avatar.id);
            const isSelected = selectedAvatar === avatar.id;

            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => !isUsed && onSelect(avatar.id)}
                disabled={isUsed}
                className={`
                  p-2 rounded-lg text-2xl transition-all
                  ${isSelected ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-gray-700 hover:bg-gray-600'}
                  ${isUsed ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                `}
                title={isUsed ? `${avatar.name} is taken` : avatar.name}
              >
                {avatar.emoji}
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={goToNextPage}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-xl transition-colors"
          title="Next page"
        >
          ▶
        </button>
      </div>

      {/* Page Indicator */}
      <div className="text-center text-xs text-gray-500 mt-2">
        Page {page + 1} of {totalPages} ({AVATARS.length} avatars)
      </div>
    </div>
  );
}
