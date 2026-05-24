// Current-sky computation + transit-to-natal aspect logic.
// Pure functions, no printing. Shared by transits.js (CLI), chart.js,
// and the MCP server.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sweph from 'sweph';
import { findAspects } from './aspects.js';
import { computeNatalChart, formatPosition } from './chart.js';

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

/**
 * Compute current sky (or sky at a given moment).
 *   options.at — optional ISO datetime string; defaults to now (UTC).
 * Returns array of { name, longitude, retrograde, speed, ...formatPosition }.
 */
export function getCurrentSky({ at = null } = {}) {
  const moment = at ? new Date(at) : new Date();
  const jd = sweph.julday(
    moment.getUTCFullYear(),
    moment.getUTCMonth() + 1,
    moment.getUTCDate(),
    moment.getUTCHours() + moment.getUTCMinutes() / 60 + moment.getUTCSeconds() / 3600,
    sweph.constants.SE_GREG_CAL,
  );

  const flags = sweph.constants.SEFLG_MOSEPH | sweph.constants.SEFLG_SPEED;

  const bodies = PLANETS.map((p) => {
    const result = sweph.calc_ut(jd, p.id, flags);
    if (result.flag === -1) {
      return { name: p.name, error: result.error };
    }
    const longitude = result.data[0];
    const speed = result.data[3];
    return {
      name: p.name,
      ...formatPosition(longitude),
      retrograde: speed < 0,
      speed,
    };
  });

  return {
    moment: moment.toISOString(),
    julianDay: jd,
    bodies,
  };
}

/**
 * Compute aspects between current sky and a person's natal chart.
 *   person — a row from the people table (with birth data)
 *   options.at — optional ISO datetime string for the transit moment
 * Returns array of aspects sorted by tightness (transit_body, natal_body, aspect, orb).
 */
export function getTransitsToNatal(person, { at = null } = {}) {
  const sky = getCurrentSky({ at });
  const natal = computeNatalChart(person);

  // Collect natal bodies for aspecting (planets + asteroids + tnos + points + angles)
  const natalBodies = [
    ...natal.planets,
    ...natal.asteroids,
    ...natal.tnos,
    ...natal.points,
  ].filter((b) => Number.isFinite(b?.longitude));

  if (natal.ascendant) natalBodies.push({ name: 'Ascendant', longitude: natal.ascendant.longitude });
  if (natal.mc)        natalBodies.push({ name: 'Midheaven', longitude: natal.mc.longitude });

  // Tag bodies so aspects are unambiguous about which set they came from
  const transitBodies = sky.bodies
    .filter((b) => Number.isFinite(b?.longitude))
    .map((b) => ({ ...b, name: `T·${b.name}` }));
  const natalTagged = natalBodies.map((b) => ({ ...b, name: `N·${b.name}` }));

  const aspects = findAspects(transitBodies, natalTagged, { sameSet: false });

  return {
    moment: sky.moment,
    julianDay: sky.julianDay,
    person: { name: person.name, relation: person.relation },
    transitBodies: sky.bodies,
    aspects,
  };
}
