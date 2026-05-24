// Natal chart computation. Given a person row, returns their planet positions,
// house cusps, and angles (Ascendant, Midheaven).
//
// Pure function — no DB, no printing. Other code consumes the returned object.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sweph from 'sweph';
import { DateTime } from 'luxon';
import { findAspects } from './aspects.js';

// Point sweph at our local ephemeris directory so file-based bodies (Chiron, etc.)
// can be computed. Main planets still use Moshier (no file needed); analytic
// points like Mean Node and Mean Lilith are likewise file-free.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
sweph.set_ephe_path(path.resolve(__dirname, '..', 'ephemeris'));

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

const POINTS = [
  { id: sweph.constants.SE_MEAN_NODE, name: 'N. Node', category: 'Points' },
  { id: sweph.constants.SE_MEAN_APOG, name: 'Lilith',  category: 'Points' },
];

const ASTEROIDS = [
  { id: sweph.constants.SE_CHIRON, name: 'Chiron', category: 'Asteroids' },
  { id: sweph.constants.SE_CERES,  name: 'Ceres',  category: 'Asteroids' },
  { id: sweph.constants.SE_PALLAS, name: 'Pallas', category: 'Asteroids' },
  { id: sweph.constants.SE_JUNO,   name: 'Juno',   category: 'Asteroids' },
  { id: sweph.constants.SE_VESTA,  name: 'Vesta',  category: 'Asteroids' },
];

// TNOs use SE_AST_OFFSET (=10000) + the body's minor-planet-center number.
// Eris (#136199), Sedna (#90377). May require additional ephemeris files.
const TNOS = [
  { id: sweph.constants.SE_AST_OFFSET + 136199, name: 'Eris',  category: 'TNOs' },
  { id: sweph.constants.SE_AST_OFFSET + 90377,  name: 'Sedna', category: 'TNOs' },
];

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export function formatPosition(longitude) {
  const signIndex = Math.floor(longitude / 30);
  const within = longitude - signIndex * 30;
  const deg = Math.floor(within);
  const min = Math.floor((within - deg) * 60);
  return {
    sign: SIGNS[signIndex],
    deg,
    min,
    longitude,
    display: `${String(deg).padStart(2, ' ')}°${String(min).padStart(2, '0')}′ ${SIGNS[signIndex]}`,
  };
}

function computeJulianDay(person) {
  const dateStr = person.birth_date instanceof Date
    ? person.birth_date.toISOString().slice(0, 10)
    : person.birth_date;

  // Fallback to noon if birth time unknown; flag this in the chart output.
  const timeStr = person.birth_time ?? '12:00:00';
  const localISO = `${dateStr}T${timeStr}`;

  const dt = DateTime.fromISO(localISO, { zone: person.birth_tz });
  if (!dt.isValid) {
    throw new Error(
      `Invalid datetime: ${localISO} in ${person.birth_tz} — ${dt.invalidReason}: ${dt.invalidExplanation}`
    );
  }

  const utc = dt.toUTC();
  const hourDecimal = utc.hour + utc.minute / 60 + utc.second / 3600;

  return sweph.julday(
    utc.year, utc.month, utc.day, hourDecimal,
    sweph.constants.SE_GREG_CAL,
  );
}

// Given a longitude and 12 house cusps, return the house number (1-12) the
// longitude falls within. Handles 0/360 wraparound.
function houseFor(longitude, houses) {
  if (!houses) return null;
  for (let i = 0; i < 12; i++) {
    let from = houses[i].longitude;
    let to = houses[(i + 1) % 12].longitude;
    if (to <= from) to += 360;
    let lon = longitude < from ? longitude + 360 : longitude;
    if (lon >= from && lon < to) return i + 1;
  }
  return null;
}

function computeBody({ id, name }, jd, flags, houses) {
  const result = sweph.calc_ut(jd, id, flags);
  const longitude = result.data[0];
  const speed = result.data[3];

  // sweph returns flag === -1 on hard failure (with longitude=0 as a default,
  // which would otherwise look like 0° Aries). It may also return successful
  // data with a benign warning string (e.g. file fallback). Use flag to tell apart.
  if (result.flag === -1 || !Number.isFinite(longitude)) {
    return { name, error: result.error || 'invalid result' };
  }

  return {
    name,
    ...formatPosition(longitude),
    house: houseFor(longitude, houses),
    retrograde: speed < 0,
    speed,
    warning: result.error || null,
  };
}

// Compute a natal chart for a person row from the people table.
//   options.houseSystem — single-char Swiss Ephemeris code. 'P' = Placidus (default),
//                         'K' = Koch, 'W' = whole sign, 'E' = equal, etc.
export function computeNatalChart(person, { houseSystem = 'P' } = {}) {
  const jd = computeJulianDay(person);
  const timeKnown = person.birth_time != null;
  // Main planets use Moshier (no files); points use default Swiss Ephemeris mode
  // (Chiron from seas_18.se1; mean nodes/lilith are analytic, no file needed).
  const planetFlags = sweph.constants.SEFLG_MOSEPH | sweph.constants.SEFLG_SPEED;
  const pointFlags  = sweph.constants.SEFLG_SPEED;

  // Compute houses first so each body can be mapped to a house.
  let houses = null;
  let ascendant = null;
  let mc = null;
  let vertexLongitude = null;

  if (timeKnown) {
    const result = sweph.houses(
      jd,
      parseFloat(person.birth_lat),
      parseFloat(person.birth_lon),
      houseSystem,
    );

    houses = result.data.houses.map((cusp, i) => ({
      number: i + 1,
      ...formatPosition(cusp),
    }));

    // Swiss Ephemeris ascmc array: [0]=Ascendant, [1]=MC, [2]=ARMC, [3]=Vertex, ...
    ascendant       = formatPosition(result.data.points[0]);
    mc              = formatPosition(result.data.points[1]);
    vertexLongitude = result.data.points[3];
  }

  const planets   = PLANETS.map((p)   => computeBody(p, jd, planetFlags, houses));
  const points    = POINTS.map((p)    => computeBody(p, jd, pointFlags,  houses));
  const asteroids = ASTEROIDS.map((p) => computeBody(p, jd, pointFlags,  houses));
  const tnos      = TNOS.map((p)      => computeBody(p, jd, pointFlags,  houses));

  // Vertex: ascmc[3] from the houses call. Only meaningful with a known birth time.
  let vertex = null;
  if (timeKnown) {
    vertex = {
      name: 'Vertex',
      category: 'Points',
      ...formatPosition(vertexLongitude),
      house: houseFor(vertexLongitude, houses),
    };
  }

  // Part of Fortune: Arabic Lot. Day chart (Sun above horizon, houses 7-12):
  // Asc + Moon - Sun. Night chart (Sun below): Asc + Sun - Moon.
  let partOfFortune = null;
  if (timeKnown && ascendant && !planets[0].error && !planets[1].error) {
    const sun  = planets[0];
    const moon = planets[1];
    const isDay = sun.house >= 7;
    const lon = isDay
      ? (ascendant.longitude + moon.longitude - sun.longitude + 720) % 360
      : (ascendant.longitude + sun.longitude  - moon.longitude + 720) % 360;
    partOfFortune = {
      name: 'Fortune',
      category: 'Points',
      formula: isDay ? 'day' : 'night',
      ...formatPosition(lon),
      house: houseFor(lon, houses),
    };
  }

  // Merge Vertex + Part of Fortune into the points collection (keep N.Node, Lilith).
  const allPoints = [...points];
  if (vertex)        allPoints.push(vertex);
  if (partOfFortune) allPoints.push(partOfFortune);

  // Compute within-natal aspects across every body that has a longitude:
  // planets, asteroids, TNOs, points, and angles (Ascendant, Midheaven).
  const aspectableBodies = [
    ...planets,
    ...asteroids,
    ...tnos,
    ...allPoints,
  ].filter((b) => Number.isFinite(b?.longitude));

  if (ascendant) aspectableBodies.push({ name: 'Ascendant', longitude: ascendant.longitude });
  if (mc)        aspectableBodies.push({ name: 'Midheaven', longitude: mc.longitude });

  const aspects = findAspects(aspectableBodies, aspectableBodies, { sameSet: true });

  return {
    person: { name: person.name, relation: person.relation },
    julianDay: jd,
    timeKnown,
    houseSystem: timeKnown ? houseSystem : null,
    planets,
    points: allPoints,
    asteroids,
    tnos,
    houses,
    ascendant,
    mc,
    aspects,
  };
}
