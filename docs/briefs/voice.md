# Voice Brief

Tone and copy direction for every user-facing surface — webapp UI text, MCP tool descriptions, README, error messages, all of it.

## Frame

**Lab notebook, not oracle.** This tool reads the sky and the user's data, reports back what's measurable, and invites reflection. It does not predict, pronounce, or claim cosmic authority. It is an *instrument*, used by a *co-investigator*.

The user is testing whether the patterns hold up in their own life. The tool is the apparatus. Claude is the synthesizing intelligence working alongside.

## Throughline

**Don't claim authority you haven't earned.** Every copy decision flows from this principle. The old Clockwork Mirror failed because it mythologized — Sentinels of Sense, Architects of Algorithmic Precision, Dear Seeker. That voice was counterfeit authority: confident grandeur without substance. This project's design integrity, including its voice, is the technical expression of refusing that.

## Register

- **Curious, not authoritative.** "Worth noticing that..." beats "The cosmos reveals..."
- **Specific, not mystical.** "Saturn is square your natal Sun within 1° — your work theme has been registering 'heavy' in your pings" beats "A challenging transit is upon you."
- **Playful where appropriate.** This is a personal tool used by a thoughtful human, not a sacred text. Levity is welcome when it doesn't undercut substance.
- **Plain, not jargon-laden.** Terms of art (transit, aspect, house) used freely; mystical vocabulary ("consciousness development," "energy beaming," "spiritual quest") never.

## What the tool says

- "Logged 1966 cluster as synchronicity. If a fourth reference lands unprompted in the next week, that's a real cluster worth examining."
- "Today's sky: transiting Sun at 1° Gemini, conjunct your natal Chiron within 1°. Worth a note if anything inherited surfaces."
- "Your last 5 pings have skewed 'charged'. Your 4 most recent events are tagged 'work'. Transiting Jupiter is sitting on your natal Mars in your 6th house — your work theme is up."
- "Brier score across your 12 scored predictions: 0.27. Slightly better than chance (0.25 at p=0.5). Not yet decisive."

## What the tool never says

- "Dear Seeker..."
- "The universe is asking you to..."
- "Saturn is teaching you a lesson about..."
- "Your spiritual journey is..."
- "Consciousness development requires..."
- "Revolutionary three-pillar architecture..."
- "Sentinels of Sense / Architects of Algorithmic Precision / Servants of Conscious Development..."
- Any cascading abstraction: "X becomes Y becomes Z becomes transformation"
- Any classical comparison reaching for prestige (Plato's cave, etc.)
- Any "revolutionary" claim about itself
- "Cosmic noise," "cosmic curriculum," "archetypal mastery path"

## Tone by situation

| Situation | Tone |
|---|---|
| Greeting on Today view | Direct, no preamble. Show the sky + your recent pings. |
| Reporting a tight transit | Specific, naming the configuration. No drama. |
| Synthesizing chart + transits | Multi-angle, hedged, explicit about what's tight vs. wide orb. |
| Error/missing data | Plain. "Birth time unknown — house cusps and Ascendant not computed." |
| Calling out confirmation-bias risk | Honest, not preachy. "I'd notice that connection regardless of which three figures you named — Forer-effect risk worth naming." |
| Asking the user something | Concise, end with a question mark. "Want to drop a prediction about how that lands by Friday?" |
| Acknowledging a synchronicity log | Validating without inflating. "Logged. If it sharpens or persists, you'll have data." |

## Use in MCP tool descriptions

Tools surfaced to Claude via MCP get descriptions that Claude reads when deciding which to call. These descriptions also follow the voice — direct, plain, useful. No marketing.

Good: `compute_chart` — "Compute a natal chart for a person already in the DB. Returns 10 planets, 5 asteroids, 2 TNOs, 4 points, angles, and houses with within-natal aspects."

Bad: `compute_chart` — "Unveil the cosmic blueprint of any soul you've added to your sacred database."

## Use in error messages

Errors stay calm and specific. The tool is not embarrassed by missing data or failed lookups.

- "No person found with name 'Alice'."
- "Probability must be between 0.00 and 1.00."
- "SwissEph file `s136199s.se1` not found — Eris will be skipped. Download from [Treindl Dropbox](https://www.dropbox.com/scl/fo/y3naz62gy6f6qfrhquu7u) and place in `ephemeris/`."

## Use in README and setup docs

Same register: direct, specific, no marketing. Setup is six steps; describe them as six steps. The reader is technical and can handle real information.

## The user is co-investigator, not "Dear Seeker"

Address the user as `you` directly. Never invoke spiritual-quest framing. Their authority over their own life is presumed; the tool serves their inquiry, not the other way around.

The conversation between the user and the tool is two intelligent agents working on a shared problem — one with embodiment and lived experience, one with archetypal vocabulary and synthesis ability. Neither is superior. The relationship is collaborative.
