// Generate a fully-fictional handoff packet for Claude Design.
// People and entries are made up; chart compute is real (against the
// fictional birth data) so the schema and shape match production exactly.
//
// Run: node lib/export-example.js

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeNatalChart } from './chart.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '..', 'docs', 'handoff', 'sample-data.example.json');

const themes = [
  { slug: 'work',          label: 'Work',          description: 'Job, career, professional craft' },
  { slug: 'body',          label: 'Body',          description: 'Health, sleep, exercise, vitality' },
  { slug: 'love',          label: 'Love',          description: 'Romantic partnership, intimacy' },
  { slug: 'family',        label: 'Family',        description: 'Family of origin, blood relations' },
  { slug: 'creative',      label: 'Creative',      description: 'Art, expression, making' },
  { slug: 'money',         label: 'Money',         description: 'Finances, income, exchange' },
  { slug: 'social',        label: 'Social',        description: 'Friends, community, broader relations' },
  { slug: 'inner',         label: 'Inner',         description: 'Solo, contemplative, dreams, shadow work' },
  { slug: 'synchronicity', label: 'Synchronicity', description: 'Patterns, glitches, meaningful coincidences' },
];

const people = [
  {
    id: 'aaaaaaaa-0000-4000-8000-000000000001',
    name: 'Avery',
    relation: 'self',
    birth_date: new Date('1990-04-18'),
    birth_time: '06:42:00',
    birth_tz: 'America/Los_Angeles',
    birth_place: 'Portland, OR',
    birth_lat: '45.51520',
    birth_lon: '-122.67840',
    notes: 'Sample primary user for the design handoff. Fictional.',
    mbti: 'INFJ',
    created_at: '2026-04-01T10:00:00.000Z',
    updated_at: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 'aaaaaaaa-0000-4000-8000-000000000002',
    name: 'Sam',
    relation: 'partner',
    birth_date: new Date('1988-11-03'),
    birth_time: '21:15:00',
    birth_tz: 'America/Chicago',
    birth_place: 'Austin, TX',
    birth_lat: '30.26720',
    birth_lon: '-97.74310',
    notes: null,
    mbti: 'ENTP',
    created_at: '2026-04-05T14:30:00.000Z',
    updated_at: '2026-04-05T14:30:00.000Z',
  },
  {
    id: 'aaaaaaaa-0000-4000-8000-000000000003',
    name: 'Mom',
    relation: 'mother',
    birth_date: new Date('1958-07-25'),
    birth_time: null,
    birth_tz: 'America/Los_Angeles',
    birth_place: 'Eugene, OR',
    birth_lat: '44.05210',
    birth_lon: '-123.08680',
    notes: null,
    mbti: null,
    created_at: '2026-04-10T09:15:00.000Z',
    updated_at: '2026-04-10T09:15:00.000Z',
  },
];

const events = [
  {
    id: 'bbbbbbbb-0000-4000-8000-000000000001',
    occurred_at: '2026-05-10T14:30:00.000Z',
    description: 'Started a new project at work — managing the migration to a new vendor.',
    themes: ['work'],
    person_id: null,
    created_at: '2026-05-10T15:00:00.000Z',
  },
  {
    id: 'bbbbbbbb-0000-4000-8000-000000000002',
    occurred_at: '2026-05-15T19:00:00.000Z',
    description: 'Long phone call with Mom — she shared a story from her childhood I had never heard.',
    themes: ['family', 'synchronicity'],
    person_id: 'aaaaaaaa-0000-4000-8000-000000000003',
    created_at: '2026-05-15T20:30:00.000Z',
  },
  {
    id: 'bbbbbbbb-0000-4000-8000-000000000003',
    occurred_at: '2026-05-21T08:00:00.000Z',
    description: 'Sam and I made breakfast together for the first time in weeks. Felt grounded.',
    themes: ['love', 'family'],
    person_id: 'aaaaaaaa-0000-4000-8000-000000000002',
    created_at: '2026-05-21T08:15:00.000Z',
  },
];

const pings = [
  {
    id: 'cccccccc-0000-4000-8000-000000000001',
    pinged_at: '2026-05-22T08:30:00.000Z',
    mood: 'charged',
    energy: 4,
    note: 'Productive morning, ideas flowing.',
    tags: ['work', 'creative'],
    created_at: '2026-05-22T08:30:00.000Z',
  },
  {
    id: 'cccccccc-0000-4000-8000-000000000002',
    pinged_at: '2026-05-22T21:45:00.000Z',
    mood: 'heavy',
    energy: 2,
    note: 'Tired. The work intensity is starting to weigh.',
    tags: ['work', 'body'],
    created_at: '2026-05-22T21:45:00.000Z',
  },
  {
    id: 'cccccccc-0000-4000-8000-000000000003',
    pinged_at: '2026-05-23T11:00:00.000Z',
    mood: 'curious',
    energy: 3,
    note: '1966 keeps surfacing — Baumol, Dusty Springfield, Jeff Beck retrospective.',
    tags: ['synchronicity', 'inner'],
    created_at: '2026-05-23T11:00:00.000Z',
  },
  {
    id: 'cccccccc-0000-4000-8000-000000000004',
    pinged_at: '2026-05-24T07:15:00.000Z',
    mood: 'calm',
    energy: 4,
    note: 'Slept well. Quiet morning. Feels like something is shifting.',
    tags: ['body', 'inner'],
    created_at: '2026-05-24T07:15:00.000Z',
  },
];

const predictions = [
  {
    id: 'dddddddd-0000-4000-8000-000000000001',
    predicted_at: '2026-05-18T10:00:00.000Z',
    transit_summary: 'Saturn square natal Sun, exact ~2026-05-22',
    prediction_text: 'Expect work pressure to peak; possible self-doubt about identity in role.',
    probability: '0.65',
    predicted_themes: ['work', 'inner'],
    person_id: 'aaaaaaaa-0000-4000-8000-000000000001',
    window_start: '2026-05-20',
    window_end: '2026-05-26',
    verdict: 'hit',
    verdict_text: 'Work pressure peaked Wednesday; had a hard conversation with my manager about role direction.',
    verdict_at: '2026-05-26T22:00:00.000Z',
    brier_score: '0.123',
    created_at: '2026-05-18T10:00:00.000Z',
  },
  {
    id: 'dddddddd-0000-4000-8000-000000000002',
    predicted_at: '2026-05-23T15:00:00.000Z',
    transit_summary: 'Venus conjunct natal Moon, exact ~2026-05-28',
    prediction_text: 'Possible warmth in close relationships; nostalgic family feelings.',
    probability: '0.55',
    predicted_themes: ['love', 'family'],
    person_id: 'aaaaaaaa-0000-4000-8000-000000000001',
    window_start: '2026-05-27',
    window_end: '2026-05-30',
    verdict: 'pending',
    verdict_text: null,
    verdict_at: null,
    brier_score: null,
    created_at: '2026-05-23T15:00:00.000Z',
  },
];

// Compute real charts for the fictional people
const charts = {};
for (const p of people) {
  try {
    charts[p.name] = computeNatalChart(p);
  } catch (e) {
    charts[p.name] = { error: e.message };
  }
}

const packet = {
  generated_at: new Date().toISOString(),
  note: 'Example handoff packet for Claude Design. All people, events, pings, and predictions are fictional. Chart compute is real (Swiss Ephemeris against fictional birth data) so the data shape matches production exactly.',
  themes,
  people,
  events,
  pings,
  predictions,
  charts,
};

await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, JSON.stringify(packet, null, 2), 'utf-8');

console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);
console.log(`  ${people.length} fictional people, ${events.length} events, ${pings.length} pings, ${predictions.length} predictions`);
