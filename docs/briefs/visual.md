# Visual Brief

The aesthetic direction for every visual surface. Pairs with `voice.md` (text register) and `ia.md` (what we're designing for).

## The frame: retro scientific instrument, modernized

The reference cluster the user reached for: phosphor radar scopes, CRT terminals, aviation HUDs, weather displays, medical monitors. Mono-chrome dominant with selective color accents. High information density. Bezels, frames, subtle bloom — texture and depth, not flat-design sterility.

**This isn't decoration.** The visual frame IS the philosophical frame. A radar scope reads the sky and reports back. The astrology tool reads the sky + user data and reports back. The aesthetic itself says *"I am an instrument, not an oracle."*

References that resonated: green/amber phosphor radar displays, 80s-90s tactical HUDs, terminal phosphor (think `cool-retro-term`), early color CRT, ms-dos-era information density.

## Base palette

- **Background**: Near-black with slight cool/warm tint — *not* pure `#000`. Reads as "monitor on," not "screen off." Two candidates worth A/B'ing in Design:
  - Warm: `#0a0805` (very dark warm — feels like a CRT just powered on)
  - Cool: `#04060a` (very dark blue-black — feels like deep-space observatory)
- **Primary phosphor**: Green `#5fff9c` or amber `#ffb84c` as the *body text and data* color. Lean **amber** as the default — amber reads as more contemporary-cool than nostalgic; green can feel ironic. (Open to user pushback.)
- **Subdued data**: A dimmed variant (~50% luma) of the phosphor color for less-active info
- **Critical accent**: A red `#ff5b5b` for warnings, alerts, exact aspects, things that need attention

## Planet color accent system

Use traditional planetary colors as a *semantic* highlight layer — not decorative. Each color identifies which planet is active in a given element.

| Body | Color | Hex (starting point) |
|---|---|---|
| Sun | Solar yellow / gold | `#f5c842` |
| Moon | Silver-blue | `#c5d4e0` |
| Mercury | Cyan-silver | `#8fd1c8` |
| Venus | Emerald | `#7fc78a` |
| Mars | Red | `#e85d3c` |
| Jupiter | Royal purple / amber | `#b07acc` |
| Saturn | Deep slate-blue | `#5773a8` |
| Uranus | Electric teal | `#4ecae8` |
| Neptune | Sea-blue / indigo | `#5468d4` |
| Pluto | Deep maroon / oxblood | `#8b3737` |
| Chiron | Bronze | `#a87a4c` |
| Lilith | Deep violet-black | `#5e3a6e` |

Used **sparingly**, to mark which body is the subject of a piece of data. Not as background fills. Not as decorative gradient. Used like a colored ink — the way an air traffic controller uses red for an active alert.

## Typography — three-tier system

Each typeface signals what kind of content the user is reading.

### 1. Outfit (sans-serif) — UI chrome
Navigation, headings, buttons, labels, form controls. Geometric clarity reads as "modern instrument panel." User's stated preference.

### 2. Monospace — data display
All numeric, tabular, identifier, and timestamp data. Two candidates:
- **IBM Plex Mono** — cleaner-modern, professional instrument feel
- **JetBrains Mono** — slightly warmer code-feel

Plus **one accent monospace** for specific "raw terminal output" moments — when the tool wants to look explicitly like a phosphor printout (e.g., daily reading log, prediction registration confirmation):
- **VT323** or **IBM VGA8** — authentic 80s-90s character

### 3. Serif — interpretation text
Claude's synthesis output, philosophical content, archetype reference panels. The voice with embodiment, distinct from data and UI:
- **Fraunces** (variable, lots of expression range) — primary candidate
- Alternates: **EB Garamond**, **Crimson Pro**

The combination produces an immediate read of *what kind of thing you're looking at*: tabular mono = data, sans = UI, serif = interpretation.

## Visual texture

Enough to evoke instrumentation; not so much that it slides into costume.

- **Subtle CRT bloom** on accent-colored text (planet colors, alerts). Small 1-2px glow at low opacity. Skip bloom on body text.
- **Very-low-opacity scanlines** on primary panels — `~3-5% alpha` repeating horizontal lines. Enough to register if you look; invisible if you don't.
- **Thin border-bezels** around major sections — single-pixel or two-pixel lines in dimmed phosphor color, occasionally with corner tick marks evoking aviation-grade UI framing.
- **Background grid** — extremely faint dot or line grid pattern on some surfaces (Calendar especially) at like 4% opacity.
- **No gradients in the body of components.** Gradients belong only in optional glow effects.

## Motion vocabulary

- **Radar sweep** — for live sky data updates. A subtle rotating sweep line on the chart wheel surface. Once per minute, low-key.
- **Phosphor decay** — when state fades or transitions out, simulate the slow dim of CRT phosphor rather than instant transparency.
- **Cursor blink** — in input fields, a real-cursor-style blinking caret in monospace.
- **Aspect line draw** — when entering the Chart surface, aspect lines draw on with a brief delay rather than appearing instantly. Gives the impression of computation.
- **No bouncy modern animation.** Springs, overshoots, elastic — all wrong for the register. Linear and CRT-organic only.
- **Reduced motion** — fully honored. Animations off → static instrument display.

## Surface-specific direction

### Today (radar-scope dashboard)
Compact instrument panel. Current sky as a small radar wheel; tightest aspects below; recent pings as a rolling log strip; one prominent ping-quick-add.

### Calendar (instrument schedule grid)
Dense month grid. Each cell tiny but readable: glyphs for major transits, mood color hint for pings, themed dots for events. Hover/tap expands. Color sparingly used; most cells are mono. Days with action stand out.

### Chart (the signature surface)
**Render the chart wheel as a radar scope.** Circular, dark background, planets as glyph markers around the perimeter, aspect lines drawn across the interior at appropriate opacity. Active transits overlaid in a distinct, slightly different shade (e.g., slightly brighter phosphor for natal, dimmed for transit). House divisions as faint radial lines. House numbers in monospace at the perimeter.

This view is the visual signature of the app. Done right, the chart wheel alone tells you what the project is.

### Notebook
Terminal log feel. Monospace timestamps left-margin. Entries as scrollable rows. Optional accent monospace (VT323 / IBM VGA8) for the entry text if it looks good without sacrificing readability.

### Predictions
Scientific results display. Numerics prominent, monospace. Brier calibration as a small embedded instrument (a tiny scatter plot of predicted probability vs. outcome with the diagonal of perfect calibration drawn faintly).

### Reference
Quieter, type-led. Serif body. Monospace for glyphs and astronomical data. Less instrumentation, more field-guide.

## Mobile adaptation

The dense-radar look sings on desktop. Mobile needs:
- Priority data only on Today (top 3 aspects, top 3 pings, sky summary)
- Week-view on Calendar instead of month-grid
- Vertical-stack on Chart (wheel above, tables stacked below)
- Same visual vocabulary, *lower density per surface*

Mobile should feel like a *handheld instrument* — like an aviation E6B or a tactical compass — not a stripped-down desktop app. That posture changes how layout decisions get made.

## Things to actively avoid

- **Kitsch / costume / vaporwave nostalgia.** The line between "earnest instrumentation" and "ironic retro" is real. Lean earnest. Resist meme references and 80s pastel palettes.
- **Pure green-on-black for long-form reading.** High-contrast phosphor is for data; body text needs softer values.
- **Bloom overdose.** A little glow adds depth; a lot makes text unreadable.
- **Flat-design sterility.** Equally bad direction. The point is depth + texture, not minimal whitespace.
- **Decorative gradient backgrounds.** Reads as marketing-website, not instrument.
- **Skeuomorphic knobs and dials beyond what serves a real function.** A purely decorative "tuning dial" is gimmick. A real input control styled as instrument hardware is fine.
- **Light mode.** Default dark forever. Light mode can be a Settings toggle but isn't where design decisions are made.

## Quick palette references in CSS for Claude Design to start from

```css
:root {
  /* Backgrounds */
  --bg-deep: #0a0805;       /* primary, warm tint */
  --bg-deep-alt: #04060a;   /* cool tint alternate */
  --bg-panel: #100c08;       /* slightly lifted */

  /* Phosphor */
  --phosphor-primary: #ffb84c;     /* amber */
  --phosphor-primary-dim: #8a6128;
  --phosphor-alt: #5fff9c;          /* green, for alternate displays */

  /* Status */
  --alert: #ff5b5b;
  --success: #7fc78a;
  --warning: #f5c842;

  /* Planet colors — used as accents only */
  --p-sun: #f5c842;
  --p-moon: #c5d4e0;
  --p-mercury: #8fd1c8;
  --p-venus: #7fc78a;
  --p-mars: #e85d3c;
  --p-jupiter: #b07acc;
  --p-saturn: #5773a8;
  --p-uranus: #4ecae8;
  --p-neptune: #5468d4;
  --p-pluto: #8b3737;
  --p-chiron: #a87a4c;
  --p-lilith: #5e3a6e;

  /* Type */
  --font-sans: 'Outfit', sans-serif;
  --font-mono: 'IBM Plex Mono', 'JetBrains Mono', monospace;
  --font-mono-retro: 'VT323', 'IBM VGA8', monospace;
  --font-serif: 'Fraunces', 'EB Garamond', serif;
}
```

These are starting values. Claude Design should refine based on real screen testing.
