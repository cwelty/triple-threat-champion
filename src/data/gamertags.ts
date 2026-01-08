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
  'Massive',
  'Bulging',
  'Swollen',
  'Drippy',
  'Loaded',
  'Cocked',
  'Bussin',
];

const middles = [
  'Dong',
  'Wiener',
  'Pickle',
  'Sausage',
  'Banana',
  'Taco',
  'Smooch',
  'Biscuit',
  'Nugget',
  'Dumpling',
  'Meat',
  'Beef',
  'Pork',
  'Balls',
  'Nut',
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
  'Dawg',
];

const suffixes = [
  'Lord',
  'Master',
  'Prince',
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
  'Gremlin',
];

const standaloneNames = [
  'CumGuzzler3000',
  'BallsDeep420',
  'AssMaster69',
  'TittyTwister',
  'PussyDestroyer',
  'DickWhisperer',
  'NutBuster9000',
  'CheekClapper',
  'Inf. Backshots',
  'ThroatGoat',
  'SloppyToppy',
  'WetWilliam',
  'BigDickEnergy',
  'SmallPPGang',
  'CockGoblin',
  'LilSpanks',
  'TaintTickler',
  'MoistMike',
  'SoggyBottom',
  'CrustyDave',
  'SwampAss42',
  'ScoobyPoop',
  'LilSnackTime',
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
