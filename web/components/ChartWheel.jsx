'use client';

// ============================================================
// ChartWheel — natal chart rendered as a radar scope.
// Ported from the Claude Design handoff (project/ui_kits/chart/ChartWheel.jsx)
// to a Next.js client component. Convention preserved:
//   - Ascendant on the LEFT (9 o'clock).
//   - Zodiac signs run counter-clockwise (longitudes increase eastward).
//   - screen_angle_rad = π + (longitude - L_asc) * (π / 180)
//   - SVG x = r·cos(θ), y = -r·sin(θ)  (y-flip for screen coords)
// ============================================================

import { ZODIAC, PLANET_COLORS } from '@/lib/chart-data';

const D2R = Math.PI / 180;

function polar(cx, cy, r, lon, ascLon) {
  const theta = Math.PI + (lon - ascLon) * D2R;
  return { x: cx + r * Math.cos(theta), y: cy - r * Math.sin(theta) };
}

function declutter(bodies, minSep = 6) {
  const sorted = bodies.map((b, i) => ({ ...b, _i: i })).sort((a, b) => a.lon - b.lon);
  const out = sorted.map((b) => ({ ...b, drawLon: b.lon }));
  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    for (let i = 0; i < out.length; i++) {
      const a = out[i], b = out[(i + 1) % out.length];
      let gap = b.drawLon - a.drawLon; while (gap < 0) gap += 360;
      if (gap < minSep) {
        const push = (minSep - gap) / 2;
        a.drawLon = (a.drawLon - push + 360) % 360;
        b.drawLon = (b.drawLon + push) % 360;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return out.sort((a, b) => a._i - b._i);
}

function ZodiacRing({ cx, cy, rOuter, rInner, ascLon }) {
  return (
    <g className="zodiac-ring">
      <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="var(--phosphor-dim)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="var(--phosphor-dim)" strokeWidth="1" />

      {ZODIAC.map((sign, i) => {
        const lonStart = i * 30;
        const lonMid = i * 30 + 15;
        const divP1 = polar(cx, cy, rInner, lonStart, ascLon);
        const divP2 = polar(cx, cy, rOuter, lonStart, ascLon);
        const glyphP = polar(cx, cy, (rOuter + rInner) / 2, lonMid, ascLon);
        return (
          <g key={sign.name}>
            <line x1={divP1.x} y1={divP1.y} x2={divP2.x} y2={divP2.y}
                  stroke="var(--phosphor-dim)" strokeWidth="1" />
            <text x={glyphP.x} y={glyphP.y}
                  fontSize="20"
                  fill={sign.color}
                  fontFamily="var(--font-mono)"
                  textAnchor="middle" dominantBaseline="central"
                  style={{ filter: 'drop-shadow(0 0 3px currentColor)' }}
                  opacity="0.85">
              {sign.glyph}
            </text>
          </g>
        );
      })}

      {Array.from({ length: 72 }, (_, i) => {
        const lon = i * 5;
        const isMajor = i % 6 === 0;
        const p1 = polar(cx, cy, rInner, lon, ascLon);
        const p2 = polar(cx, cy, rInner - (isMajor ? 6 : 3), lon, ascLon);
        return (
          <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke="var(--phosphor-dimmer)" strokeWidth="1"
                opacity={isMajor ? 0.7 : 0.4} />
        );
      })}
    </g>
  );
}

function HouseRing({ cx, cy, rOuter, rInner, ascLon, houses }) {
  return (
    <g className="house-ring">
      <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="var(--phosphor-dimmer)" strokeWidth="1" />

      {houses.map((h, i) => {
        const nextH = houses[(i + 1) % 12];
        const isAngular = (h.num === 1 || h.num === 4 || h.num === 7 || h.num === 10);
        const cuspEnd = polar(cx, cy, rOuter, h.lon, ascLon);
        const cuspStart = polar(cx, cy, 30, h.lon, ascLon);

        let arcMid = h.lon;
        let nextLon = nextH.lon;
        while (nextLon < h.lon) nextLon += 360;
        arcMid = (h.lon + nextLon) / 2;
        const numP = polar(cx, cy, (rOuter + rInner) / 2, arcMid, ascLon);

        return (
          <g key={h.num}>
            <line x1={cuspStart.x} y1={cuspStart.y}
                  x2={cuspEnd.x} y2={cuspEnd.y}
                  stroke={isAngular ? 'var(--phosphor-dim)' : 'var(--phosphor-faint)'}
                  strokeWidth={isAngular ? '1.25' : '1'}
                  strokeDasharray={isAngular ? '' : '2 4'}
                  opacity={isAngular ? 0.9 : 0.6} />
            <text x={numP.x} y={numP.y}
                  fontSize="11" fontFamily="var(--font-mono)"
                  fill="var(--phosphor-dim)"
                  textAnchor="middle" dominantBaseline="central">
              {h.num}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function AngleLabels({ cx, cy, r, ascLon, mcLon }) {
  const labels = [
    { txt: 'ASC', lon: ascLon,        color: 'var(--p-mars)' },
    { txt: 'DSC', lon: ascLon + 180,  color: 'var(--phosphor-dim)' },
    { txt: 'MC',  lon: mcLon,         color: 'var(--p-saturn)' },
    { txt: 'IC',  lon: mcLon + 180,   color: 'var(--phosphor-dim)' },
  ];
  return (
    <g className="angle-labels">
      {labels.map((l) => {
        const p = polar(cx, cy, r, l.lon, ascLon);
        return (
          <g key={l.txt}>
            <circle cx={p.x} cy={p.y} r="2.5" fill={l.color}
                    style={{ filter: 'drop-shadow(0 0 2px currentColor)' }} />
            <text x={p.x} y={p.y - 10}
                  fontSize="9" fontFamily="var(--font-mono)"
                  fill={l.color}
                  letterSpacing="0.14em"
                  textAnchor="middle">
              {l.txt}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function PlanetGlyphs({ cx, cy, r, ascLon, planets }) {
  const placed = declutter(planets, 7);
  return (
    <g className="planet-glyphs">
      {planets.map((p, i) => {
        const drawn = placed[i];
        const tickIn = polar(cx, cy, r + 8, p.lon, ascLon);
        const tickOut = polar(cx, cy, r - 4, p.lon, ascLon);
        const glyphP = polar(cx, cy, r + 22, drawn.drawLon, ascLon);
        const color = PLANET_COLORS[p.name];
        return (
          <g key={p.name}>
            <line x1={tickIn.x} y1={tickIn.y} x2={tickOut.x} y2={tickOut.y}
                  stroke={color} strokeWidth="1.25"
                  style={{ filter: 'drop-shadow(0 0 2px currentColor)' }}/>
            <text x={glyphP.x} y={glyphP.y}
                  fontSize="20" fontFamily="var(--font-mono)"
                  fill={color}
                  textAnchor="middle" dominantBaseline="central"
                  style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}>
              {p.glyph}
            </text>
            {p.retro && (
              <text x={glyphP.x + 12} y={glyphP.y + 10}
                    fontSize="9" fontFamily="var(--font-mono)"
                    fill="var(--alert)"
                    textAnchor="middle" dominantBaseline="central">
                ℞
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

function AspectLines({ cx, cy, r, ascLon, aspects, planets }) {
  const aspectColor = (type) => {
    switch (type) {
      case 'Conjunction': return 'var(--phosphor)';
      case 'Opposition':  return 'var(--alert)';
      case 'Square':      return 'var(--alert)';
      case 'Trine':       return 'var(--success)';
      case 'Sextile':     return 'var(--p-mercury)';
      case 'Quincunx':    return 'var(--p-jupiter)';
      default:            return 'var(--phosphor-dim)';
    }
  };
  const lookup = (name) => {
    const b = planets.find((p) => p.name === name);
    return b ? b.lon : null;
  };
  return (
    <g className="aspect-lines">
      {aspects.map((asp, i) => {
        const la = lookup(asp.a), lb = lookup(asp.b);
        if (la == null || lb == null) return null;
        const pa = polar(cx, cy, r, la, ascLon);
        const pb = polar(cx, cy, r, lb, ascLon);
        const orbAlpha = Math.max(0.18, 0.7 - asp.orb * 0.25);
        const isMajor = asp.orb < 1.0;
        return (
          <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={aspectColor(asp.type)}
                strokeWidth={isMajor ? 1.25 : 0.85}
                strokeDasharray={asp.type === 'Quincunx' ? '3 3' : ''}
                opacity={orbAlpha}
                style={{
                  filter: isMajor ? 'drop-shadow(0 0 2px currentColor)' : 'none',
                  animation: `aspectDraw 600ms var(--ease-crt) ${i * 35}ms both`,
                }}
                pathLength="100" />
        );
      })}
    </g>
  );
}

function RadarSweep({ cx, cy, r }) {
  const sweepId = 'radarSweepGrad';
  return (
    <g className="radar-sweep" style={{
      transformOrigin: `${cx}px ${cy}px`,
      animation: 'radarRotate 60s linear infinite',
    }}>
      <defs>
        <linearGradient id={sweepId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--phosphor)" stopOpacity="0" />
          <stop offset="80%" stopColor="var(--phosphor)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--phosphor)" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <path d={`M ${cx} ${cy}
                L ${cx + r} ${cy}
                A ${r} ${r} 0 0 0 ${cx + r * Math.cos(-12 * D2R)} ${cy + r * Math.sin(-12 * D2R)}
                Z`}
            fill={`url(#${sweepId})`} />
    </g>
  );
}

export default function ChartWheel({ size = 560, chart }) {
  const cx = size / 2, cy = size / 2;
  const rOuter      = size * 0.48;
  const rZodInner   = size * 0.42;
  const rHouseInner = size * 0.32;
  const rPlanets    = size * 0.30;

  const ascLon = chart.ascendant.lon;
  const mcLon  = chart.mc.lon;

  return (
    <div className="wheel-frame" style={{ width: size, height: size }}>
      <div className="wheel-vignette"></div>
      <div className="wheel-scanlines"></div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="wheel-svg">
        <circle cx={cx} cy={cy} r={rPlanets} fill="none"
                stroke="var(--phosphor-faint)" strokeWidth="1" opacity="0.5" />
        <circle cx={cx} cy={cy} r={rPlanets * 0.6} fill="none"
                stroke="var(--phosphor-faint)" strokeWidth="1" opacity="0.3" />
        <circle cx={cx} cy={cy} r={rPlanets * 0.3} fill="none"
                stroke="var(--phosphor-faint)" strokeWidth="1" opacity="0.2" />

        <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy}
              stroke="var(--phosphor-dim)" strokeWidth="1" opacity="0.6" />
        <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6}
              stroke="var(--phosphor-dim)" strokeWidth="1" opacity="0.6" />

        <HouseRing  cx={cx} cy={cy} rOuter={rZodInner} rInner={rHouseInner}
                    ascLon={ascLon} houses={chart.houses} />
        <ZodiacRing cx={cx} cy={cy} rOuter={rOuter} rInner={rZodInner} ascLon={ascLon} />

        <RadarSweep cx={cx} cy={cy} r={rOuter - 2} />

        <AspectLines cx={cx} cy={cy} r={rPlanets}
                     ascLon={ascLon} aspects={chart.aspects}
                     planets={[...chart.planets, ...chart.points, ...chart.asteroids,
                       { name: 'Ascendant', lon: ascLon },
                       { name: 'Midheaven', lon: mcLon }]} />

        <PlanetGlyphs cx={cx} cy={cy} r={rZodInner + 6}
                      ascLon={ascLon}
                      planets={[...chart.planets, ...chart.points.slice(0, 2), ...chart.asteroids]} />

        <AngleLabels cx={cx} cy={cy} r={rOuter + 18} ascLon={ascLon} mcLon={mcLon} />
      </svg>

      <style jsx>{`
        .wheel-frame {
          position: relative;
          background: radial-gradient(circle at center,
            #0d0906 0%,
            #06040a 70%,
            #020103 100%);
          border-radius: 50%;
          box-shadow:
            inset 0 0 60px rgba(0,0,0,0.9),
            inset 0 0 0 2px var(--bezel),
            0 0 30px rgba(255, 184, 76, 0.06);
        }
        .wheel-vignette {
          position: absolute; inset: 0;
          border-radius: 50%;
          pointer-events: none;
          background: radial-gradient(circle at 35% 25%,
            rgba(255,184,76,0.04) 0%,
            transparent 50%);
        }
        .wheel-scanlines {
          position: absolute; inset: 4px;
          border-radius: 50%;
          pointer-events: none;
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent 2px,
            rgba(255,184,76,0.05) 2px,
            rgba(255,184,76,0.05) 3px
          );
          mix-blend-mode: screen;
          opacity: 0.6;
        }
        .wheel-svg {
          position: relative;
          display: block;
        }
        @keyframes radarRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes aspectDraw {
          from { stroke-dashoffset: 100; stroke-dasharray: 100; opacity: 0; }
          to   { stroke-dashoffset: 0;   opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
