import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { AvatarPicker } from './AvatarPicker';
import { getRandomAvatar } from '../../data/avatars';
import { generateVulgarGamertag } from '../../data/gamertags';

interface PlayerRegistrationFormProps {
  usedAvatars: string[];
  usedGamertags: string[];
  onRegister: (name: string, gamertag: string, avatar: string) => void;
}

export function PlayerRegistrationForm({ usedAvatars, usedGamertags, onRegister }: PlayerRegistrationFormProps) {
  const [name, setName] = useState('');
  const [gamertag, setGamertag] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const normalizedGamertag = gamertag.trim().toLowerCase();
  const isDuplicateGamertag = usedGamertags.some(
    (used) => used.toLowerCase() === normalizedGamertag
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !gamertag.trim() || !avatar || isDuplicateGamertag) return;

    onRegister(name.trim(), gamertag.trim().slice(0, 15), avatar);
    setName('');
    setGamertag('');
    setAvatar(null);
  };

  const handleRandomAvatar = () => {
    const random = getRandomAvatar(usedAvatars);
    if (random) {
      setAvatar(random.id);
    }
  };

  const handleGenerateGamertag = () => {
    // Generate unique gamertag (try up to 20 times to avoid duplicates)
    let newTag = generateVulgarGamertag();
    let attempts = 0;
    while (
      usedGamertags.some((used) => used.toLowerCase() === newTag.toLowerCase()) &&
      attempts < 20
    ) {
      newTag = generateVulgarGamertag();
      attempts++;
    }
    setGamertag(newTag);
  };

  const handleGamertagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 15) {
      setGamertag(value);
    }
  };

  const isValid = name.trim() && gamertag.trim() && avatar && !isDuplicateGamertag;

  return (
    <form onSubmit={handleSubmit} className="smash-card rounded-lg overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#e60012] to-[#b8000e] px-6 py-4">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider"
            style={{ fontFamily: "'Russo One', sans-serif" }}>
          Register Player
        </h2>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-bold text-[#e60012] mb-2 uppercase tracking-wider"
                 style={{ fontFamily: "'Russo One', sans-serif" }}>
            First Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              const val = e.target.value;
              setName(val.charAt(0).toUpperCase() + val.slice(1));
            }}
            placeholder="Enter your name..."
            className="smash-input w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-[#e60012] uppercase tracking-wider"
                   style={{ fontFamily: "'Russo One', sans-serif" }}>
              Gamertag
            </label>
            <span className="text-xs text-gray-500 font-medium">{gamertag.length}/15</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={gamertag}
              onChange={handleGamertagChange}
              maxLength={15}
              placeholder="Enter or generate..."
              className="smash-input flex-1"
            />
            <button
              type="button"
              onClick={handleGenerateGamertag}
              className="px-4 py-2 bg-gradient-to-b from-purple-500 to-purple-700 border-2 border-purple-400 text-white rounded-md text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              title="Generate a new vulgar gamertag"
            >
              Generate
            </button>
          </div>
          {isDuplicateGamertag && gamertag.trim() ? (
            <p className="text-xs text-[#e60012] mt-2 font-bold uppercase">
              ⚠️ This gamertag is already taken!
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-2">
              Click Generate for a spicy gamertag suggestion
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-[#e60012] uppercase tracking-wider"
                   style={{ fontFamily: "'Russo One', sans-serif" }}>
              Select Avatar
            </label>
            <button
              type="button"
              onClick={handleRandomAvatar}
              className="text-sm text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wide transition-colors"
            >
              🎲 Random
            </button>
          </div>
          <AvatarPicker
            selectedAvatar={avatar}
            usedAvatars={usedAvatars}
            onSelect={setAvatar}
          />
        </div>

        <Button
          type="submit"
          disabled={!isValid}
          className="w-full"
          size="lg"
        >
          🔥 Register Player 🔥
        </Button>
      </div>
    </form>
  );
}
