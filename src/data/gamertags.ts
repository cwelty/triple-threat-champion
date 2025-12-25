// Vulgar gamertag generator for bachelor party vibes

const prefixes = [
  'Dirty',
  'Filthy',
  'Sweaty',
  'Moist',
  'Crusty',
  'Greasy',
  'Sloppy',
  'Chunky',
  'Thicc',
  'Girthy',
  'Chubby',
  'Stinky',
  'Soggy',
  'Sticky',
  'Nasty',
  'Trashy',
  'Raunchy',
  'Steamy',
  'Raw',
  'Hung',
  'Big',
  'Long',
  'Hard',
  'Throbbing',
  'Erected',
  'Bulging',
  'Swollen',
  'Drippy',
  'Loaded',
  'Cocked',
];

const middles = [
  'Dong',
  'Wiener',
  'Pickle',
  'Sausage',
  'Banana',
  'Taco',
  'Muffin',
  'Biscuit',
  'Nugget',
  'Dumpling',
  'Meat',
  'Beef',
  'Pork',
  'Balls',
  'Nut',
  'Boner',
  'Chode',
  'Shaft',
  'Rod',
  'Pole',
  'Stick',
  'Tube',
  'Pipe',
  'Hose',
  'Snake',
  'Worm',
  'Sack',
  'Butt',
  'Booty',
  'Cheek',
];

const suffixes = [
  'Lord',
  'Master',
  'King',
  'Daddy',
  'Destroyer',
  'Slayer',
  'Blaster',
  'Banger',
  'Punisher',
  'Wrecker',
  'Smasher',
  'Pounder',
  'Stroker',
  'Handler',
  'Gobbler',
  'Muncher',
  'Lover',
  'Hugger',
  'Tickler',
  'Fondler',
  '69',
  '420',
  'XXX',
  'Pro',
  'God',
  'Chad',
  'Simp',
  'Guzzler',
  'Inhaler',
  'Enjoyer',
];

const standaloneNames = [
  'CumGuzzler3000',
  'BallsDeep420',
  'AssMaster69',
  'TittyTwister',
  'BonerJams98',
  'PussyDestroyer',
  'DickWhisperer',
  'NutBuster9000',
  'CheekClapper',
  'BackshotKing',
  'ThroatGoat',
  'SloppyToppy',
  'WetWillie',
  'BigDickEnergy',
  'SmallPPGang',
  'CockGoblin',
  'ButtPirate',
  'TaintTickler',
  'MoistMike',
  'SoggyBottom',
  'CrustyDave',
  'SwampAss42',
  'FartSniffer',
  'PoopScoop',
  'DingleBerry',
  'TheFinger',
  'LilSnackTime',
  'ChafedChad',
  'StupidBitch',
  'MotherFucker',
  'PussyPumpkin',
  'BoxMuncher',
  'MoeLester',
  'BarryMcCockiner',
];

export function generateVulgarGamertag(): string {
  // 40% chance to use a standalone name
  if (Math.random() < 0.4) {
    const name = standaloneNames[Math.floor(Math.random() * standaloneNames.length)];
    return name.slice(0, 15);
  }

  // 60% chance to generate a combo
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const middle = middles[Math.floor(Math.random() * middles.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  // Try different combinations to stay under 15 chars
  const fullName = `${prefix}${middle}${suffix}`;
  if (fullName.length <= 15) {
    return fullName;
  }

  // Try without suffix
  const twoPartName = `${prefix}${middle}`;
  if (twoPartName.length <= 15) {
    return twoPartName;
  }

  // Try prefix + suffix
  const altName = `${prefix}${suffix}`;
  if (altName.length <= 15) {
    return altName;
  }

  // Fallback to a short standalone
  const shortStandalones = standaloneNames.filter(n => n.length <= 15);
  return shortStandalones[Math.floor(Math.random() * shortStandalones.length)];
}
