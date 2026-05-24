// Today's planet positions via Swiss Ephemeris in Moshier mode (no data files needed).
// Run: npm run transits

import sweph from 'sweph';

const PLANETS = [
  { id: sweph.constants.SE_SUN,     name: 'Sun' },
  { id: sweph.constants.SE_MOON,    name: 'Moon' },
  { id: sweph.constants.SE_MERCURY, name: 'Mercury' },
  { id: sweph.constants.SE_VENUS,   name: 'Venus' },
  { id: sweph.constants.SE_MARS,    name: 'Mars' },
  { id: sweph.constants.SE_JUPITER, name: 'Jupiter' },
  { id: sweph.constants.SE_SATURN,  name: 'Saturn' },
  { id: sweph.constants.SE_URANUS,  name: 'Uranus' },
  { id: sweph.constants.SE_NEPTUNE, name: 'Neptune' },
  { id: sweph.constants.SE_PLUTO,   name: 'Pluto' },
];

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function formatPosition(longitude) {
  const signIndex = Math.floor(longitude / 30);
  const within = longitude - signIndex * 30;
  const deg = Math.floor(within);
  const min = Math.floor((within - deg) * 60);
  return `${String(deg).padStart(2, ' ')}°${String(min).padStart(2, '0')}′ ${SIGNS[signIndex]}`;
}

const now = new Date();
const jd = sweph.julday(
  now.getUTCFullYear(),
  now.getUTCMonth() + 1,
  now.getUTCDate(),
  now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600,
  sweph.constants.SE_GREG_CAL,
);

const flags = sweph.constants.SEFLG_MOSEPH | sweph.constants.SEFLG_SPEED;

console.log(`\nToday's sky — ${now.toISOString()}`);
console.log('─'.repeat(40));

for (const planet of PLANETS) {
  const result = sweph.calc_ut(jd, planet.id, flags);
  if (result.error) {
    console.log(`  ${planet.name.padEnd(10)} ERROR: ${result.error}`);
    continue;
  }
  const longitude = result.data[0];
  const speed = result.data[3];
  const retro = speed < 0 ? ' ℞' : '';
  console.log(`  ${planet.name.padEnd(10)} ${formatPosition(longitude)}${retro}`);
}

console.log('');
