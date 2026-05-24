// Aspect computation. Pure helper: given two body lists, find the angular
// aspects between them within configurable orbs.
//
// Used by chart.js for within-natal aspects. Will also be used by future
// transit-to-natal and synastry scripts.

export const ASPECTS = [
  { name: 'Conjunction', angle: 0,   symbol: '☌', orb: 8 },
  { name: 'Sextile',     angle: 60,  symbol: '⚹', orb: 6 },
  { name: 'Square',      angle: 90,  symbol: '□', orb: 8 },
  { name: 'Trine',       angle: 120, symbol: '△', orb: 8 },
  { name: 'Quincunx',    angle: 150, symbol: '⚻', orb: 3 },
  { name: 'Opposition',  angle: 180, symbol: '☍', orb: 8 },
];

/**
 * Find aspects between two body sets.
 *
 * bodies1, bodies2: arrays of { name, longitude }
 *   (objects with .error or missing/non-finite .longitude are skipped)
 *
 * opts.aspects   — override the aspect definitions (default: ASPECTS)
 * opts.sameSet   — true when bodies1 === bodies2; skips self-pairs and
 *                  duplicates (i,j) / (j,i). Use for within-natal.
 *
 * Returns array of { body1, body2, aspect, symbol, angle, separation, orb },
 * sorted by tightness (smallest orb first). Each pair contributes at most
 * one aspect (the tightest match).
 */
export function findAspects(bodies1, bodies2, opts = {}) {
  const { aspects = ASPECTS, sameSet = false } = opts;
  const found = [];

  for (let i = 0; i < bodies1.length; i++) {
    const a = bodies1[i];
    if (!Number.isFinite(a?.longitude)) continue;

    const startJ = sameSet ? i + 1 : 0;
    for (let j = startJ; j < bodies2.length; j++) {
      const b = bodies2[j];
      if (!Number.isFinite(b?.longitude)) continue;
      if (sameSet && i === j) continue;

      // Shortest angular separation (0..180)
      let sep = Math.abs(a.longitude - b.longitude);
      if (sep > 180) sep = 360 - sep;

      // Find the tightest matching aspect for this pair
      let best = null;
      for (const asp of aspects) {
        const orb = Math.abs(sep - asp.angle);
        if (orb <= asp.orb && (best === null || orb < best.orb)) {
          best = { aspect: asp, orb };
        }
      }

      if (best) {
        found.push({
          body1: a.name,
          body2: b.name,
          aspect: best.aspect.name,
          symbol: best.aspect.symbol,
          angle: best.aspect.angle,
          separation: sep,
          orb: best.orb,
        });
      }
    }
  }

  found.sort((x, y) => x.orb - y.orb);
  return found;
}

/** Format an orb (decimal degrees) as "D°MM′". */
export function formatOrb(orb) {
  const deg = Math.floor(orb);
  const min = Math.floor((orb - deg) * 60);
  return `${deg}°${String(min).padStart(2, '0')}′`;
}
