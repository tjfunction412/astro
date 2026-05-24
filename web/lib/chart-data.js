// ============================================================
// Avery's chart data (fictional, schema-accurate).
// Sourced from docs/handoff/sample-data.example.json (charts.Avery).
// Used by the Chart and Today surfaces until live MCP wiring lands.
// ============================================================

export const AVERY_CHART = {
  person: {
    name: "Avery",
    relation: "self",
    birth: {
      date: "1990-04-18",
      time: "06:42",
      tz: "America/Los_Angeles",
      place: "Portland, OR",
      lat: 45.5152,
      lon: -122.6784,
    },
  },
  houseSystem: "Placidus",
  timeKnown: true,

  planets: [
    { name: "Sun",     glyph: "☉", sign: "Aries",     deg: 28, min: 15, lon: 28.260,  house: 12, retro: false, color: "sun" },
    { name: "Moon",    glyph: "☽", sign: "Aquarius",  deg:  1, min: 29, lon: 301.487, house: 10, retro: false, color: "moon" },
    { name: "Mercury", glyph: "☿", sign: "Taurus",    deg: 16, min: 25, lon: 46.426,  house:  1, retro: false, color: "mercury" },
    { name: "Venus",   glyph: "♀", sign: "Pisces",    deg: 12, min: 50, lon: 342.843, house: 11, retro: false, color: "venus" },
    { name: "Mars",    glyph: "♂", sign: "Aquarius",  deg: 28, min: 14, lon: 328.241, house: 11, retro: false, color: "mars" },
    { name: "Jupiter", glyph: "♃", sign: "Cancer",    deg:  4, min: 59, lon: 94.985,  house:  3, retro: false, color: "jupiter" },
    { name: "Saturn",  glyph: "♄", sign: "Capricorn", deg: 25, min:  7, lon: 295.119, house: 10, retro: false, color: "saturn" },
    { name: "Uranus",  glyph: "♅", sign: "Capricorn", deg:  9, min: 34, lon: 279.580, house:  9, retro: true,  color: "uranus" },
    { name: "Neptune", glyph: "♆", sign: "Capricorn", deg: 14, min: 34, lon: 284.573, house:  9, retro: true,  color: "neptune" },
    { name: "Pluto",   glyph: "♇", sign: "Scorpio",   deg: 16, min: 54, lon: 226.911, house:  7, retro: true,  color: "pluto" },
  ],

  points: [
    { name: "N. Node", glyph: "☊",  sign: "Aquarius", deg: 12, min: 45, lon: 312.765, house: 11, retro: true,  color: "node" },
    { name: "Lilith",  glyph: "⚸",  sign: "Scorpio",  deg: 18, min: 27, lon: 228.462, house:  7, retro: false, color: "lilith" },
    { name: "Vertex",  glyph: "Vx", sign: "Libra",    deg: 14, min: 41, lon: 194.686, house:  6, retro: false, color: "vertex" },
    { name: "Fortune", glyph: "⊗",  sign: "Aquarius", deg:  8, min: 45, lon: 308.766, house: 10, retro: false, color: "fortune" },
  ],

  asteroids: [
    { name: "Chiron", glyph: "⚷", sign: "Cancer",  deg: 11, min: 26, lon: 101.443, house: 3, retro: false, color: "chiron" },
    { name: "Ceres",  glyph: "⚳", sign: "Cancer",  deg:  5, min: 22, lon:  95.367, house: 3, retro: false, color: "chiron" },
    { name: "Pallas", glyph: "⚴", sign: "Taurus",  deg: 14, min:  7, lon:  44.129, house: 1, retro: false, color: "chiron" },
    { name: "Juno",   glyph: "⚵", sign: "Scorpio", deg: 21, min: 28, lon: 231.467, house: 7, retro: true,  color: "chiron" },
    { name: "Vesta",  glyph: "⚶", sign: "Aries",   deg:  9, min: 22, lon:   9.380, house: 12, retro: false, color: "chiron" },
  ],

  ascendant: { sign: "Taurus",    deg:  5, min: 32, lon:  35.539 },
  mc:        { sign: "Capricorn", deg: 17, min: 45, lon: 287.751 },

  houses: [
    { num:  1, sign: "Taurus",      deg:  5, min: 32, lon:  35.539 },
    { num:  2, sign: "Gemini",      deg:  6, min: 47, lon:  66.793 },
    { num:  3, sign: "Gemini",      deg: 28, min:  7, lon:  88.130 },
    { num:  4, sign: "Cancer",      deg: 17, min: 45, lon: 107.751 },
    { num:  5, sign: "Leo",         deg: 10, min: 29, lon: 130.500 },
    { num:  6, sign: "Virgo",       deg: 13, min: 30, lon: 163.510 },
    { num:  7, sign: "Scorpio",     deg:  5, min: 32, lon: 215.539 },
    { num:  8, sign: "Sagittarius", deg:  6, min: 47, lon: 246.793 },
    { num:  9, sign: "Sagittarius", deg: 28, min:  7, lon: 268.130 },
    { num: 10, sign: "Capricorn",   deg: 17, min: 45, lon: 287.751 },
    { num: 11, sign: "Aquarius",    deg: 10, min: 29, lon: 310.500 },
    { num: 12, sign: "Pisces",      deg: 13, min: 30, lon: 343.510 },
  ],

  aspects: [
    { a: "Sun",     b: "Mars",      type: "Sextile",     glyph: "⚹", angle:  60, orb: 0.02 },
    { a: "Neptune", b: "Vertex",    type: "Square",      glyph: "□", angle:  90, orb: 0.11 },
    { a: "Pluto",   b: "Eris",      type: "Quincunx",    glyph: "⚻", angle: 150, orb: 0.12 },
    { a: "Uranus",  b: "Vesta",     type: "Square",      glyph: "□", angle:  90, orb: 0.20 },
    { a: "Jupiter", b: "Ceres",     type: "Conjunction", glyph: "☌", angle:   0, orb: 0.38 },
    { a: "Neptune", b: "Pallas",    type: "Trine",       glyph: "△", angle: 120, orb: 0.44 },
    { a: "Mercury", b: "Pluto",     type: "Opposition",  glyph: "☍", angle: 180, orb: 0.49 },
    { a: "Pallas",  b: "Vertex",    type: "Quincunx",    glyph: "⚻", angle: 150, orb: 0.56 },
    { a: "Vesta",   b: "Fortune",   type: "Sextile",     glyph: "⚹", angle:  60, orb: 0.61 },
    { a: "Lilith",  b: "Midheaven", type: "Sextile",     glyph: "⚹", angle:  60, orb: 0.71 },
    { a: "Chiron",  b: "Sedna",     type: "Sextile",     glyph: "⚹", angle:  60, orb: 0.78 },
    { a: "Pluto",   b: "Midheaven", type: "Sextile",     glyph: "⚹", angle:  60, orb: 0.84 },
    { a: "Venus",   b: "Pallas",    type: "Sextile",     glyph: "⚹", angle:  60, orb: 1.29 },
    { a: "Mercury", b: "Midheaven", type: "Trine",       glyph: "△", angle: 120, orb: 1.33 },
    { a: "Venus",   b: "Chiron",    type: "Trine",       glyph: "△", angle: 120, orb: 1.40 },
    { a: "Pluto",   b: "Lilith",    type: "Conjunction", glyph: "☌", angle:   0, orb: 1.55 },
    { a: "Venus",   b: "Neptune",   type: "Sextile",     glyph: "⚹", angle:  60, orb: 1.73 },
    { a: "Uranus",  b: "Chiron",    type: "Opposition",  glyph: "☍", angle: 180, orb: 1.86 },
  ],
};

export const ZODIAC = [
  { name: "Aries",       glyph: "♈", element: "fire",  color: "#e85d3c" },
  { name: "Taurus",      glyph: "♉", element: "earth", color: "#7fc78a" },
  { name: "Gemini",      glyph: "♊", element: "air",   color: "#8fd1c8" },
  { name: "Cancer",      glyph: "♋", element: "water", color: "#5468d4" },
  { name: "Leo",         glyph: "♌", element: "fire",  color: "#f5c842" },
  { name: "Virgo",       glyph: "♍", element: "earth", color: "#a87a4c" },
  { name: "Libra",       glyph: "♎", element: "air",   color: "#b07acc" },
  { name: "Scorpio",     glyph: "♏", element: "water", color: "#8b3737" },
  { name: "Sagittarius", glyph: "♐", element: "fire",  color: "#e85d3c" },
  { name: "Capricorn",   glyph: "♑", element: "earth", color: "#5773a8" },
  { name: "Aquarius",    glyph: "♒", element: "air",   color: "#4ecae8" },
  { name: "Pisces",      glyph: "♓", element: "water", color: "#5468d4" },
];

export const PLANET_COLORS = {
  Sun: "var(--p-sun)", Moon: "var(--p-moon)", Mercury: "var(--p-mercury)",
  Venus: "var(--p-venus)", Mars: "var(--p-mars)", Jupiter: "var(--p-jupiter)",
  Saturn: "var(--p-saturn)", Uranus: "var(--p-uranus)", Neptune: "var(--p-neptune)",
  Pluto: "var(--p-pluto)", Chiron: "var(--p-chiron)", Ceres: "var(--p-chiron)",
  Pallas: "var(--p-chiron)", Juno: "var(--p-chiron)", Vesta: "var(--p-chiron)",
  Lilith: "var(--p-lilith)", "N. Node": "var(--p-node)", Vertex: "var(--p-vertex)",
  Fortune: "var(--p-fortune)", Eris: "var(--p-pluto)", Sedna: "var(--p-pluto)",
  Midheaven: "var(--p-saturn)", Ascendant: "var(--p-mars)",
};

// ============================================================
// Today fixtures — current sky, recent pings, open predictions.
// Placeholder data; will be wired to MCP / Neon in a future pass.
// ============================================================

export const TODAY_CURRENT_SKY = [
  { name: "Sun",     glyph: "☉", sign: "Gemini",       deg:  3, min:  4, lon:  63.07, retro: false },
  { name: "Moon",    glyph: "☽", sign: "Virgo",        deg: 12, min: 14, lon: 162.25, retro: false },
  { name: "Mercury", glyph: "☿", sign: "Gemini",       deg: 14, min: 27, lon:  74.45, retro: false },
  { name: "Venus",   glyph: "♀", sign: "Cancer",       deg:  6, min: 10, lon:  96.17, retro: false },
  { name: "Mars",    glyph: "♂", sign: "Taurus",       deg:  3, min: 57, lon:  33.97, retro: false },
  { name: "Jupiter", glyph: "♃", sign: "Cancer",       deg: 22, min: 38, lon: 112.64, retro: false },
  { name: "Saturn",  glyph: "♄", sign: "Aries",        deg: 11, min: 33, lon:  11.55, retro: false },
  { name: "Uranus",  glyph: "♅", sign: "Gemini",       deg:  1, min: 36, lon:  61.61, retro: false },
  { name: "Neptune", glyph: "♆", sign: "Aries",        deg:  3, min: 53, lon:   3.90, retro: false },
  { name: "Pluto",   glyph: "♇", sign: "Aquarius",     deg:  5, min: 26, lon: 305.44, retro: true  },
];

export const TODAY_TIGHTEST_ASPECTS = [
  { a: "Neptune", b: "Mercury", type: "Quincunx",    glyph_a: "♆", glyph_b: "☿", glyph_type: "⚻", orb: 0.02, when: "exact now" },
  { a: "Mars",    b: "Mercury", type: "Trine",       glyph_a: "♂", glyph_b: "☿", glyph_type: "△", orb: 0.04, when: "exact now" },
  { a: "Pluto",   b: "Moon",    type: "Trine",       glyph_a: "♇", glyph_b: "☽", glyph_type: "△", orb: 0.31, when: "long arc" },
];

export const TODAY_RECENT_PINGS = [
  { id: 1, when: "08:30", mood: "charged", energy: 4, tags: ["work", "creative"], note: "Productive morning, ideas flowing." },
  { id: 2, when: "yesterday", mood: "heavy",   energy: 2, tags: ["work", "body"],     note: "Tired. The work intensity is starting to weigh." },
  { id: 3, when: "2d ago",    mood: "curious", energy: 3, tags: ["synchronicity", "inner"], note: "1966 keeps surfacing — Baumol, Dusty Springfield, Jeff Beck retrospective." },
];

export const TODAY_OPEN_PREDICTIONS = [
  {
    id: "dddddddd-0000-4000-8000-000000000002",
    probability: "0.55",
    transit: "Venus conjunct natal Moon, exact ~2026-05-28",
    text: "Possible warmth in close relationships; nostalgic family feelings.",
    window: "2026-05-27 → 2026-05-30",
  },
];
