'use client';

// Today surface components — ported from the Design handoff
// (project/ui_kits/today/TodayComponents.jsx) to ES module React.

import { ZODIAC, PLANET_COLORS } from '@/lib/chart-data';

const D2R = Math.PI / 180;

export function MiniRadar({ size = 200, currentSky, natalAsc = 35.539 }) {
  const cx = size / 2, cy = size / 2;
  const polar = (r, lon, asc) => {
    const t = Math.PI + (lon - asc) * D2R;
    return { x: cx + r * Math.cos(t), y: cy - r * Math.sin(t) };
  };
  const rOuter = size * 0.45;
  const rInner = size * 0.30;
  return (
    <div className="mini-radar" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <defs>
          <linearGradient id="sweepMini" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="var(--phosphor)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--phosphor)" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="var(--phosphor-dim)" strokeWidth="1"/>
        <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="var(--phosphor-faint)" strokeWidth="1"/>
        <circle cx={cx} cy={cy} r={rInner * 0.5} fill="none" stroke="var(--phosphor-faint)" strokeWidth="1" opacity="0.5"/>

        <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} stroke="var(--phosphor-dim)" />
        <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4} stroke="var(--phosphor-dim)" />

        {Array.from({ length: 12 }, (_, i) => {
          const lon = i * 30;
          const p1 = polar(rInner, lon, natalAsc);
          const p2 = polar(rOuter, lon, natalAsc);
          return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                       stroke="var(--phosphor-faint)" strokeWidth="1"/>;
        })}

        {ZODIAC.map((s, i) => {
          const lon = i * 30 + 15;
          const p = polar((rOuter + rInner) / 2, lon, natalAsc);
          return (
            <text key={s.name} x={p.x} y={p.y} fontSize="9"
                  fontFamily="var(--font-mono)"
                  fill={s.color} opacity="0.7"
                  textAnchor="middle" dominantBaseline="central">
              {s.glyph}
            </text>
          );
        })}

        {currentSky.map((p) => {
          const pt = polar(rOuter + 4, p.lon, natalAsc);
          return (
            <g key={p.name}>
              <text x={pt.x} y={pt.y} fontSize="11"
                    fontFamily="var(--font-mono)"
                    fill={PLANET_COLORS[p.name]}
                    textAnchor="middle" dominantBaseline="central"
                    style={{ filter: 'drop-shadow(0 0 3px currentColor)' }}>
                {p.glyph}
              </text>
            </g>
          );
        })}

        <path d={`M ${cx} ${cy} L ${cx + rOuter} ${cy} A ${rOuter} ${rOuter} 0 0 0
                 ${cx + rOuter * Math.cos(-12 * D2R)} ${cy + rOuter * Math.sin(-12 * D2R)} Z`}
              fill="url(#sweepMini)"
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                animation: 'radarRotate 60s linear infinite',
              }} />

        <text x={polar(rOuter + 14, natalAsc, natalAsc).x}
              y={polar(rOuter + 14, natalAsc, natalAsc).y}
              fontSize="7" fontFamily="var(--font-mono)"
              fill="var(--p-mars)" letterSpacing="0.14em"
              textAnchor="middle" dominantBaseline="central">
          ASC
        </text>
      </svg>
      <style jsx>{`
        .mini-radar {
          position: relative;
          background: radial-gradient(circle, #0d0906 0%, #02010300 80%);
          border-radius: 50%;
          box-shadow: inset 0 0 30px rgba(0,0,0,0.7);
        }
        @keyframes radarRotate {
          to { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}

export function CurrentSky({ data }) {
  return (
    <div className="current-sky">
      <ul>
        {data.map((p) => (
          <li key={p.name}>
            <span className="sk-glyph" style={{ color: PLANET_COLORS[p.name] }}>{p.glyph}</span>
            <span className="sk-name">{p.name}</span>
            <span className="sk-pos">
              {String(p.deg).padStart(2, ' ')}°{String(p.min).padStart(2, '0')}′
              <span className="sk-sign">{p.sign}</span>
            </span>
            <span className="sk-retro">{p.retro ? '℞' : ''}</span>
          </li>
        ))}
      </ul>
      <style jsx>{`
        .current-sky ul { list-style: none; margin: 0; padding: 0; }
        .current-sky li {
          display: grid;
          grid-template-columns: 22px 1fr auto 18px;
          gap: 8px; align-items: center;
          padding: 5px 12px;
          font-family: var(--font-mono);
          font-size: 11px;
          font-variant-numeric: tabular-nums;
          border-bottom: 1px solid rgba(255,184,76,0.05);
        }
        .sk-glyph {
          font-size: 14px; text-align: center;
          filter: drop-shadow(0 0 3px currentColor);
        }
        .sk-name { font-family: var(--font-sans); font-size: 11px; color: var(--fg-1); }
        .sk-pos { color: var(--phosphor); text-align: right; }
        .sk-sign { color: var(--fg-2); margin-left: 4px; }
        .sk-retro {
          color: var(--alert);
          text-shadow: 0 0 4px currentColor;
          text-align: right;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

export function TightestAspects({ aspects }) {
  const cAsp = {
    Conjunction: 'var(--phosphor)', Opposition: 'var(--alert)', Square: 'var(--alert)',
    Trine: 'var(--success)', Sextile: 'var(--p-mercury)', Quincunx: 'var(--p-jupiter)',
  };
  return (
    <div className="tight-aspects">
      {aspects.map((a, i) => (
        <div key={i} className="ta-row">
          <div className="ta-line">
            <span className="ta-trans">tr.</span>
            <span className="ta-body" style={{ color: PLANET_COLORS[a.a] }}>
              {a.glyph_a} {a.a}
            </span>
            <span className="ta-asp" style={{ color: cAsp[a.type] }}>{a.glyph_type}</span>
            <span className="ta-body" style={{ color: PLANET_COLORS[a.b] }}>
              {a.glyph_b} {a.b}
            </span>
          </div>
          <div className="ta-meta">
            <span className="ta-orb" style={{ color: a.orb < 1 ? 'var(--alert)' : 'var(--phosphor)' }}>
              {a.orb < 0.1 ? 'exact' : a.orb.toFixed(2) + '°'}
            </span>
            <span className="ta-when">{a.when}</span>
          </div>
        </div>
      ))}
      <style jsx>{`
        .tight-aspects { display: flex; flex-direction: column; }
        .ta-row {
          padding: 10px 12px;
          border-bottom: 1px solid rgba(255,184,76,0.05);
          display: flex; flex-direction: column; gap: 4px;
        }
        .ta-line {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-sans);
          font-size: 12px;
        }
        .ta-trans {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--fg-3);
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .ta-asp {
          font-size: 14px;
          font-family: var(--font-mono);
          filter: drop-shadow(0 0 3px currentColor);
        }
        .ta-body {
          font-family: var(--font-mono);
          font-size: 12px;
        }
        .ta-meta {
          display: flex; justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--fg-3);
          padding-left: 22px;
        }
        .ta-orb {
          font-variant-numeric: tabular-nums;
          text-shadow: 0 0 3px currentColor;
        }
      `}</style>
    </div>
  );
}

export function RecentPings({ pings }) {
  const moodColor = {
    charged: 'var(--phosphor)',
    heavy: 'var(--alert)',
    curious: 'var(--p-mercury)',
    calm: 'var(--success)',
  };
  return (
    <div className="recent-pings">
      {pings.map((p) => (
        <div key={p.id} className="ping-row">
          <div className="pr-time">{p.when}</div>
          <div className="pr-body">
            <div className="pr-head">
              <span className="pr-mood" style={{ color: moodColor[p.mood] || 'var(--phosphor)' }}>
                ● {p.mood}
              </span>
              <span className="pr-energy">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < p.energy ? 'bar on' : 'bar'}></span>
                ))}
              </span>
              <span className="pr-tags">
                {p.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </span>
            </div>
            <div className="pr-note">{p.note}</div>
          </div>
        </div>
      ))}
      <style jsx>{`
        .recent-pings { display: flex; flex-direction: column; }
        .ping-row {
          display: grid;
          grid-template-columns: 56px 1fr;
          gap: 10px;
          padding: 10px 12px;
          border-bottom: 1px solid rgba(255,184,76,0.05);
        }
        .pr-time {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--phosphor-dim);
          padding-top: 2px;
          font-variant-numeric: tabular-nums;
        }
        .pr-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .pr-head {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .pr-mood {
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: -0.01em;
          text-shadow: 0 0 4px currentColor;
        }
        .pr-mood::first-letter { text-transform: capitalize; }
        .pr-energy { display: flex; gap: 2px; }
        .bar {
          width: 4px; height: 10px;
          background: var(--phosphor-faint);
          border: 1px solid var(--phosphor-dimmer);
        }
        .bar.on {
          background: var(--phosphor);
          border-color: var(--phosphor);
          box-shadow: 0 0 3px var(--phosphor);
        }
        .pr-tags { display: flex; gap: 4px; margin-left: auto; }
        .tag {
          font-family: var(--font-mono);
          font-size: 9px;
          padding: 1px 5px;
          color: var(--fg-3);
          border: 1px solid var(--phosphor-faint);
          border-radius: 999px;
          letter-spacing: 0.06em;
        }
        .pr-note {
          font-family: var(--font-serif);
          font-size: 13px;
          line-height: 1.45;
          color: var(--fg-paper);
        }
      `}</style>
    </div>
  );
}

export function OpenPredictions({ predictions }) {
  return (
    <div className="open-preds">
      {predictions.map((p) => (
        <div key={p.id} className="pred-row">
          <div className="pred-head">
            <span className="pred-status">window active</span>
            <span className="pred-prob">p = {p.probability}</span>
          </div>
          <div className="pred-transit">{p.transit}</div>
          <div className="pred-text">{p.text}</div>
          <div className="pred-window">{p.window}</div>
        </div>
      ))}
      <style jsx>{`
        .pred-row {
          padding: 12px;
          border-bottom: 1px solid rgba(255,184,76,0.05);
          display: flex; flex-direction: column; gap: 6px;
        }
        .pred-head {
          display: flex; justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
        .pred-status {
          color: var(--success);
          text-shadow: 0 0 4px currentColor;
        }
        .pred-status::before { content: '◉ '; }
        .pred-prob {
          color: var(--phosphor);
          font-variant-numeric: tabular-nums;
        }
        .pred-transit {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--phosphor);
          font-variant-numeric: tabular-nums;
        }
        .pred-text {
          font-family: var(--font-serif);
          font-size: 13px;
          line-height: 1.5;
          color: var(--fg-paper);
        }
        .pred-window {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--fg-3);
        }
      `}</style>
    </div>
  );
}

export function QuickPing() {
  const moods = ['charged', 'heavy', 'curious', 'calm', 'scattered', 'tender'];
  return (
    <div className="quick-ping">
      <div className="qp-head">
        <span className="label">Drop a ping</span>
        <span className="qp-cursor"><span className="data">{'>'}</span><span className="cursor"></span></span>
      </div>
      <div className="qp-input">
        <input type="text" placeholder="brief note..." defaultValue="" />
      </div>
      <div className="qp-moods">
        {moods.map((m) => (
          <button key={m} className={m === 'calm' ? 'on' : ''}>{m}</button>
        ))}
      </div>
      <div className="qp-row">
        <div className="qp-energy-label">Energy</div>
        <div className="qp-energy-bars">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < 4 ? 'ebar on' : 'ebar'}></span>
          ))}
        </div>
        <button className="qp-submit">LOG ⏎</button>
      </div>
      <style jsx>{`
        .quick-ping {
          padding: 14px;
          background: var(--bg-inset);
          border: 1px solid var(--phosphor-dim);
          border-radius: 2px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .qp-head {
          display: flex; justify-content: space-between; align-items: center;
        }
        .qp-cursor { display: flex; align-items: center; gap: 2px; }
        .qp-input input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--phosphor-dimmer);
          color: var(--fg-1);
          font-family: var(--font-mono);
          font-size: 13px;
          padding: 6px 0;
          outline: none;
        }
        .qp-input input:focus { border-bottom-color: var(--phosphor); }
        .qp-input input::placeholder { color: var(--fg-mute); }
        .qp-moods {
          display: flex; flex-wrap: wrap; gap: 4px;
        }
        .qp-moods button {
          font-family: var(--font-mono);
          font-size: 10px;
          padding: 4px 8px;
          background: transparent;
          color: var(--fg-3);
          border: 1px solid var(--phosphor-faint);
          border-radius: 999px;
          cursor: pointer;
          letter-spacing: 0.04em;
          transition: all var(--dur-fast);
        }
        .qp-moods button:hover { color: var(--fg-1); border-color: var(--phosphor-dim); }
        .qp-moods button.on {
          color: var(--phosphor);
          border-color: var(--phosphor);
          background: rgba(255,184,76,0.08);
          text-shadow: 0 0 3px currentColor;
        }
        .qp-row { display: flex; align-items: center; gap: 10px; }
        .qp-energy-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--fg-3);
        }
        .qp-energy-bars { display: flex; gap: 3px; }
        .ebar { width: 5px; height: 12px; background: var(--phosphor-faint); border: 1px solid var(--phosphor-dimmer); }
        .ebar.on { background: var(--phosphor); border-color: var(--phosphor); box-shadow: 0 0 3px var(--phosphor); }
        .qp-submit {
          margin-left: auto;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          padding: 5px 12px;
          background: rgba(255,184,76,0.12);
          color: var(--phosphor);
          border: 1px solid var(--phosphor);
          border-radius: 2px;
          cursor: pointer;
          text-shadow: 0 0 3px currentColor;
        }
        .qp-submit:hover {
          background: var(--phosphor);
          color: var(--bg-deep);
          text-shadow: none;
        }
      `}</style>
    </div>
  );
}

export function BottomTabs({ active = 'Today' }) {
  const tabs = [
    { name: 'Today',    glyph: '◉' },
    { name: 'Calendar', glyph: '▤' },
    { name: 'Chart',    glyph: '◯' },
    { name: 'Notebook', glyph: '≡' },
    { name: 'More',     glyph: '···' },
  ];
  return (
    <div className="bottom-tabs">
      {tabs.map((t) => (
        <button key={t.name} className={active === t.name ? 'on' : ''}>
          <span className="bt-glyph">{t.glyph}</span>
          <span className="bt-label">{t.name}</span>
        </button>
      ))}
      <style jsx>{`
        .bottom-tabs {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          background: var(--bg-panel);
          border-top: 1px solid var(--phosphor-dim);
          padding: 6px 0 18px;
        }
        .bottom-tabs button {
          background: transparent;
          border: none;
          display: flex; flex-direction: column; align-items: center;
          gap: 2px;
          padding: 4px 0;
          color: var(--fg-3);
          cursor: pointer;
          transition: color var(--dur-fast);
        }
        .bt-glyph {
          font-family: var(--font-mono);
          font-size: 16px;
        }
        .bt-label {
          font-family: var(--font-sans);
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .bottom-tabs button.on {
          color: var(--phosphor);
          text-shadow: 0 0 4px currentColor;
        }
      `}</style>
    </div>
  );
}
