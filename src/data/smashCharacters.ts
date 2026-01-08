// Complete Super Smash Bros Ultimate roster (89 fighters including DLC)
export interface SmashCharacter {
  id: string;
  name: string;
  series: string;
}

export const SMASH_CHARACTERS: SmashCharacter[] = [
  // Super Mario Series (includes DK and Yoshi)
  { id: 'mario', name: 'Mario', series: 'Super Mario' },
  { id: 'luigi', name: 'Luigi', series: 'Super Mario' },
  { id: 'peach', name: 'Peach', series: 'Super Mario' },
  { id: 'daisy', name: 'Daisy', series: 'Super Mario' },
  { id: 'bowser', name: 'Bowser', series: 'Super Mario' },
  { id: 'drMario', name: 'Dr. Mario', series: 'Super Mario' },
  { id: 'rosalina', name: 'Rosalina & Luma', series: 'Super Mario' },
  { id: 'bowserJr', name: 'Bowser Jr.', series: 'Super Mario' },
  { id: 'piranhaPlant', name: 'Piranha Plant', series: 'Super Mario' },
  { id: 'donkeyKong', name: 'Donkey Kong', series: 'Super Mario' },
  { id: 'diddyKong', name: 'Diddy Kong', series: 'Super Mario' },
  { id: 'kingKRool', name: 'King K. Rool', series: 'Super Mario' },
  { id: 'yoshi', name: 'Yoshi', series: 'Super Mario' },

  // The Legend of Zelda Series
  { id: 'link', name: 'Link', series: 'Zelda' },
  { id: 'sheik', name: 'Sheik', series: 'Zelda' },
  { id: 'zelda', name: 'Zelda', series: 'Zelda' },
  { id: 'youngLink', name: 'Young Link', series: 'Zelda' },
  { id: 'ganondorf', name: 'Ganondorf', series: 'Zelda' },
  { id: 'toonLink', name: 'Toon Link', series: 'Zelda' },

  // Metroid Series
  { id: 'samus', name: 'Samus', series: 'Metroid' },
  { id: 'darkSamus', name: 'Dark Samus', series: 'Metroid' },
  { id: 'zeroSuitSamus', name: 'Zero Suit Samus', series: 'Metroid' },
  { id: 'ridley', name: 'Ridley', series: 'Metroid' },

  // Kirby Series
  { id: 'kirby', name: 'Kirby', series: 'Kirby' },
  { id: 'metaKnight', name: 'Meta Knight', series: 'Kirby' },
  { id: 'kingDedede', name: 'King Dedede', series: 'Kirby' },

  // Star Fox Series
  { id: 'fox', name: 'Fox', series: 'Star Fox' },
  { id: 'falco', name: 'Falco', series: 'Star Fox' },
  { id: 'wolf', name: 'Wolf', series: 'Star Fox' },

  // Pokemon Series
  { id: 'pikachu', name: 'Pikachu', series: 'Pokemon' },
  { id: 'jigglypuff', name: 'Jigglypuff', series: 'Pokemon' },
  { id: 'pichu', name: 'Pichu', series: 'Pokemon' },
  { id: 'mewtwo', name: 'Mewtwo', series: 'Pokemon' },
  { id: 'pokemonTrainer', name: 'Pokemon Trainer', series: 'Pokemon' },
  { id: 'lucario', name: 'Lucario', series: 'Pokemon' },
  { id: 'greninja', name: 'Greninja', series: 'Pokemon' },
  { id: 'incineroar', name: 'Incineroar', series: 'Pokemon' },

  // EarthBound Series
  { id: 'ness', name: 'Ness', series: 'EarthBound' },
  { id: 'lucas', name: 'Lucas', series: 'EarthBound' },

  // Fire Emblem Series
  { id: 'marth', name: 'Marth', series: 'Fire Emblem' },
  { id: 'lucina', name: 'Lucina', series: 'Fire Emblem' },
  { id: 'roy', name: 'Roy', series: 'Fire Emblem' },
  { id: 'chrom', name: 'Chrom', series: 'Fire Emblem' },
  { id: 'ike', name: 'Ike', series: 'Fire Emblem' },
  { id: 'robin', name: 'Robin', series: 'Fire Emblem' },
  { id: 'corrin', name: 'Corrin', series: 'Fire Emblem' },
  { id: 'byleth', name: 'Byleth', series: 'Fire Emblem' },

  // Kid Icarus Series
  { id: 'pit', name: 'Pit', series: 'Kid Icarus' },
  { id: 'darkPit', name: 'Dark Pit', series: 'Kid Icarus' },
  { id: 'palutena', name: 'Palutena', series: 'Kid Icarus' },

  // Mii Series
  { id: 'miiBrawler', name: 'Mii Brawler', series: 'Mii' },
  { id: 'miiSwordfighter', name: 'Mii Swordfighter', series: 'Mii' },
  { id: 'miiGunner', name: 'Mii Gunner', series: 'Mii' },

  // Xenoblade Series
  { id: 'shulk', name: 'Shulk', series: 'Xenoblade' },
  { id: 'pyraMythra', name: 'Pyra / Mythra', series: 'Xenoblade' },

  // Street Fighter Series
  { id: 'ryu', name: 'Ryu', series: 'Street Fighter' },
  { id: 'ken', name: 'Ken', series: 'Street Fighter' },

  // Final Fantasy Series
  { id: 'cloud', name: 'Cloud', series: 'Final Fantasy' },
  { id: 'sephiroth', name: 'Sephiroth', series: 'Final Fantasy' },

  // Castlevania Series
  { id: 'simon', name: 'Simon', series: 'Castlevania' },
  { id: 'richter', name: 'Richter', series: 'Castlevania' },

  // Animal Crossing Series
  { id: 'villager', name: 'Villager', series: 'Animal Crossing' },
  { id: 'isabelle', name: 'Isabelle', series: 'Animal Crossing' },

  // Other (single-character series)
  { id: 'captainFalcon', name: 'Captain Falcon', series: 'Other' },
  { id: 'iceClimbers', name: 'Ice Climbers', series: 'Other' },
  { id: 'mrGameAndWatch', name: 'Mr. Game & Watch', series: 'Other' },
  { id: 'wario', name: 'Wario', series: 'Other' },
  { id: 'snake', name: 'Snake', series: 'Other' },
  { id: 'sonic', name: 'Sonic', series: 'Other' },
  { id: 'olimar', name: 'Olimar', series: 'Other' },
  { id: 'rob', name: 'R.O.B.', series: 'Other' },
  { id: 'megaMan', name: 'Mega Man', series: 'Other' },
  { id: 'wiiFitTrainer', name: 'Wii Fit Trainer', series: 'Other' },
  { id: 'littleMac', name: 'Little Mac', series: 'Other' },
  { id: 'pacMan', name: 'Pac-Man', series: 'Other' },
  { id: 'duckHunt', name: 'Duck Hunt', series: 'Other' },
  { id: 'bayonetta', name: 'Bayonetta', series: 'Other' },
  { id: 'inkling', name: 'Inkling', series: 'Other' },
  { id: 'joker', name: 'Joker', series: 'Other' },
  { id: 'hero', name: 'Hero', series: 'Other' },
  { id: 'banjoKazooie', name: 'Banjo & Kazooie', series: 'Other' },
  { id: 'terry', name: 'Terry', series: 'Other' },
  { id: 'minMin', name: 'Min Min', series: 'Other' },
  { id: 'steve', name: 'Steve', series: 'Other' },
  { id: 'kazuya', name: 'Kazuya', series: 'Other' },
  { id: 'sora', name: 'Sora', series: 'Other' },
];

// Get unique series for grouping (with Other at the end)
export const SMASH_SERIES = (() => {
  const series = [...new Set(SMASH_CHARACTERS.map(c => c.series))];
  // Move "Other" to the end if it exists
  const otherIndex = series.indexOf('Other');
  if (otherIndex > -1) {
    series.splice(otherIndex, 1);
    series.push('Other');
  }
  return series;
})();

// Helper to get character by ID
export function getCharacterById(id: string): SmashCharacter | undefined {
  return SMASH_CHARACTERS.find(c => c.id === id);
}

// Helper to get character name by ID
export function getCharacterName(id: string): string {
  return getCharacterById(id)?.name ?? id;
}

// Helper to get characters by series
export function getCharactersBySeries(series: string): SmashCharacter[] {
  return SMASH_CHARACTERS.filter(c => c.series === series);
}

// Group characters by series for UI display
export function getCharactersGroupedBySeries(): Record<string, SmashCharacter[]> {
  const grouped: Record<string, SmashCharacter[]> = {};
  for (const series of SMASH_SERIES) {
    grouped[series] = getCharactersBySeries(series);
  }
  return grouped;
}
