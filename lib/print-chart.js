// Print a person's natal chart to the terminal.
// Run: npm run chart -- --name "TJ"

import { parseArgs } from 'node:util';
import { getPersonByName } from './people.js';
import { close } from './db.js';
import { computeNatalChart } from './chart.js';
import { formatOrb } from './aspects.js';

const { values } = parseArgs({
  options: {
    name:   { type: 'string', short: 'n' },
    system: { type: 'string', short: 's' }, // house system code, e.g. P, K, W
    help:   { type: 'boolean', short: 'h' },
  },
});

if (values.help || !values.name) {
  console.log(`
Print a person's natal chart.

Usage:
  npm run chart -- --name "TJ"
  npm run chart -- --name "TJ" --system W   (whole-sign houses)

House systems: P=Placidus (default), K=Koch, W=Whole-sign, E=Equal
`);
  process.exit(values.help ? 0 : 1);
}

const person = await getPersonByName(values.name);
if (!person) {
  console.error(`No person found with name "${values.name}".`);
  await close();
  process.exit(1);
}

const chart = computeNatalChart(person, { houseSystem: values.system ?? 'P' });

const relTag = chart.person.relation ? ` [${chart.person.relation}]` : '';
console.log(`\nNatal chart — ${chart.person.name}${relTag}`);
console.log('─'.repeat(50));

function bodyLine(b) {
  if (b.error) return `  ${b.name.padEnd(10)} (skipped: ${b.error})`;
  const retro = b.retrograde ? ' ℞' : '  ';
  const house = b.house ? `  House ${String(b.house).padStart(2)}` : '';
  return `  ${b.name.padEnd(10)} ${b.display.padEnd(18)}${retro}${house}`;
}

console.log('\nPlanets:');
for (const p of chart.planets) console.log(bodyLine(p));

if (chart.asteroids?.some((b) => !b.error)) {
  console.log('\nAsteroids:');
  for (const b of chart.asteroids) console.log(bodyLine(b));
}

if (chart.tnos?.some((b) => !b.error)) {
  console.log('\nTNOs:');
  for (const b of chart.tnos) console.log(bodyLine(b));
} else if (chart.tnos?.length) {
  console.log('\nTNOs:');
  for (const b of chart.tnos) console.log(bodyLine(b));
}

if (chart.points?.some((pt) => !pt.error)) {
  console.log('\nPoints:');
  for (const pt of chart.points) console.log(bodyLine(pt));
}

if (chart.timeKnown) {
  console.log('\nAngles:');
  console.log(`  Ascendant  ${chart.ascendant.display}`);
  console.log(`  Midheaven  ${chart.mc.display}`);

  console.log(`\nHouses (${chart.houseSystem}):`);
  for (const h of chart.houses) {
    console.log(`  ${String(h.number).padStart(2)}         ${h.display}`);
  }
} else {
  console.log('\n(Birth time unknown — house cusps and Ascendant not computed.)');
}

if (chart.aspects?.length) {
  // Print the tightest aspects up front, then the rest under a cutoff.
  // Tightness cutoff: <= 3° orb is "close," considered most active.
  const close = chart.aspects.filter((a) => a.orb <= 3);
  const wider = chart.aspects.filter((a) => a.orb > 3);

  if (close.length) {
    console.log('\nAspects (close, ≤ 3° orb):');
    for (const a of close) {
      console.log(`  ${a.body1.padEnd(10)} ${a.symbol}  ${a.body2.padEnd(10)} ${a.aspect.padEnd(11)} ${formatOrb(a.orb)}`);
    }
  }

  if (wider.length) {
    console.log(`\nAspects (wider, ${wider.length} total):`);
    for (const a of wider) {
      console.log(`  ${a.body1.padEnd(10)} ${a.symbol}  ${a.body2.padEnd(10)} ${a.aspect.padEnd(11)} ${formatOrb(a.orb)}`);
    }
  }
}

console.log('');
await close();
