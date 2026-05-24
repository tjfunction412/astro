-- Astro: Phase 1 schema + lab-notebook tables.
-- All statements idempotent; safe to run multiple times via `npm run migrate`.

-- =============================================================================
-- PEOPLE
-- Tracked people: self + anyone you read charts for.
-- =============================================================================

CREATE TABLE IF NOT EXISTS people (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  relation     text,                       -- 'self', 'sister', 'friend', etc.
  birth_date   date NOT NULL,              -- local date of birth
  birth_time   time,                       -- local time, null if unknown
  birth_tz     text NOT NULL,              -- IANA tz, e.g. 'America/New_York'
  birth_place  text NOT NULL,              -- human-readable location
  birth_lat    numeric(8,5) NOT NULL,
  birth_lon    numeric(8,5) NOT NULL,
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS people_name_idx ON people (lower(name));

-- MBTI overlay — optional Jungian typology. Nullable, free text (we don't
-- validate; "ENFJ" or "ENFJ-A" or notes are all OK).
ALTER TABLE people ADD COLUMN IF NOT EXISTS mbti text;

-- =============================================================================
-- THEMES
-- Categorical tags applied to events, pings, predictions. Seeded with a starter
-- set; user can add more by inserting rows.
-- =============================================================================

CREATE TABLE IF NOT EXISTS themes (
  slug         text PRIMARY KEY,
  label        text NOT NULL,
  description  text
);

INSERT INTO themes (slug, label, description) VALUES
  ('work',          'Work',          'Job, career, professional craft'),
  ('body',          'Body',          'Health, sleep, exercise, vitality'),
  ('love',          'Love',          'Romantic partnership, intimacy'),
  ('family',        'Family',        'Family of origin, blood relations'),
  ('creative',      'Creative',      'Art, expression, making'),
  ('money',         'Money',         'Finances, income, exchange'),
  ('social',        'Social',        'Friends, community, broader relations'),
  ('inner',         'Inner',         'Solo, contemplative, dreams, shadow work'),
  ('synchronicity', 'Synchronicity', 'Patterns, glitches, meaningful coincidences')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- EVENTS
-- Time-stamped life happenings. Ground truth for the lab notebook.
-- Captured when something happens; not a daily ritual.
-- =============================================================================

CREATE TABLE IF NOT EXISTS events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at   timestamptz NOT NULL,
  description   text NOT NULL,
  themes        text[],                       -- array of theme slugs
  person_id     uuid REFERENCES people(id),   -- optional: someone involved
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_occurred_at_idx ON events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS events_person_idx     ON events (person_id);

-- =============================================================================
-- PINGS
-- Low-friction daily-ish state capture. 30-second entries, not journaling.
-- The time-series substrate the lab notebook is built on.
-- =============================================================================

CREATE TABLE IF NOT EXISTS pings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pinged_at    timestamptz NOT NULL DEFAULT now(),
  mood         text NOT NULL,                  -- e.g. 'heavy', 'light', 'charged', 'calm', 'mixed'
  energy       smallint,                       -- optional 1-5
  note         text,
  tags         text[],                         -- theme slugs
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pings_pinged_at_idx ON pings (pinged_at DESC);

-- =============================================================================
-- PREDICTIONS
-- Time-locked hypotheses about transit impact. Pre-registered before a transit
-- perfects; verdict assigned after the window. Probability + Brier score are
-- the rigor-mode features; can be left null for casual hunches.
-- =============================================================================

CREATE TABLE IF NOT EXISTS predictions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  predicted_at      timestamptz NOT NULL DEFAULT now(),
  transit_summary   text NOT NULL,            -- e.g. "Saturn square natal Sun, exact ~2026-06-15"
  prediction_text   text NOT NULL,            -- 1-3 themes you expect to activate
  probability       numeric(3,2),             -- 0.00 to 1.00; null = no probability set
  predicted_themes  text[],                   -- theme slugs you predict will be involved
  person_id         uuid REFERENCES people(id), -- whose chart (default: self)
  window_start      date,                     -- transit's active window
  window_end        date,
  verdict           text NOT NULL DEFAULT 'pending', -- pending | hit | miss | partial | unclear
  verdict_text      text,
  verdict_at        timestamptz,
  brier_score       numeric(4,3),             -- (probability - outcome)^2 at verdict time
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS predictions_window_idx  ON predictions (window_start, window_end);
CREATE INDEX IF NOT EXISTS predictions_verdict_idx ON predictions (verdict);

-- =============================================================================
-- CONTROLS
-- Blind retrospective sessions. Once a quarter (or whenever), Claude reads your
-- event log for a past month WITHOUT seeing transit data, generates an
-- astrological-style narrative, then you reveal the real transits and rate fit.
-- Makes the Forer/Barnum effect visible.
-- =============================================================================

CREATE TABLE IF NOT EXISTS controls (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_for_month   date NOT NULL,          -- YYYY-MM-01 of the month under blind review
  reading_narrative   text NOT NULL,          -- Claude's blind narrative (no transit data shown)
  reading_at          timestamptz NOT NULL DEFAULT now(),
  revealed_at         timestamptz,            -- when actual transits were revealed
  comparison_notes    text,                   -- honest assessment of fit
  fit_score           smallint,               -- 1-5 subjective fit after reveal
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS controls_month_idx ON controls (control_for_month);
