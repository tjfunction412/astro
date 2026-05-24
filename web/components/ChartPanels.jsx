'use client';

// Supporting tables for the Chart surface — ported from the Design handoff
// (project/ui_kits/chart/ChartPanels.jsx) to ES module React components.

import { PLANET_COLORS } from '@/lib/chart-data';

export function ChartHeader({ activeSurface = 'Chart' }) {
  const surfaces = ['Today', 'Calendar', 'Chart', 'People', 'Notebook', 'Predictions', 'Reference', 'Settings'];
  return (
    <header className="chart-header">
      <div className="brand">
        <span className="brand-glyph">⊙</span>
        <span className="brand-wm">astro</span>
        <span className="brand-sub">lab notebook</span>
      </div>
      <nav className="surface-nav">
        {surfaces.map((s) => (
          <a key={s} href="#" className={s === activeSurface ? 'active' : ''}>{s}</a>
        ))}
      </nav>
      <div className="header-meta">
        <span className="data">2026·05·24</span>
        <span className="dot">·</span>
        <span className="data">21:08 PDT</span>
      </div>
      <style jsx>{`
        .chart-header {
          display: flex; align-items: center; gap: 32px;
          padding: 14px 24px;
          border-bottom: 1px solid var(--phosphor-dim);
          background: var(--bg-panel);
        }
        .brand { display: flex; align-items: baseline; gap: 8px; }
        .brand-glyph {
          font-family: var(--font-mono);
          font-size: 18px;
          color: var(--phosphor);
          filter: drop-shadow(0 0 4px currentColor);
        }
        .brand-wm {
          font-family: var(--font-sans);
          font-size: 17px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--fg-1);
        }
        .brand-sub {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--fg-3);
        }
        .surface-nav { display: flex; gap: 18px; flex: 1; }
        .surface-nav a {
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--fg-3);
          text-decoration: none;
          padding: 4px 0;
          border-bottom: 1px solid transparent;
          transition: color var(--dur-fast) var(--ease-crt);
        }
        .surface-nav a:hover { color: var(--fg-1); }
        .surface-nav a.active {
          color: var(--phosphor);
          border-bottom-color: var(--phosphor);
          filter: drop-shadow(0 0 3px var(--phosphor));
        }
        .header-meta {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--phosphor-dim);
        }
        .header-meta .dot { opacity: 0.4; }
      `}</style>
    </header>
  );
}

export function PersonSelector({ person }) {
  return (
    <div className="person-selector">
      <div className="label">Subject</div>
      <button className="select-btn">
        <span className="person-name">{person.name}</span>
        <span className="person-rel">· {person.relation}</span>
        <span className="chev">▾</span>
      </button>
      <div className="birth-meta">
        <span className="data">{person.birth.date}</span>
        <span className="sep">·</span>
        <span className="data">{person.birth.time}</span>
        <span className="sep">·</span>
        <span className="data">{person.birth.place}</span>
      </div>
      <style jsx>{`
        .person-selector { display: flex; flex-direction: column; gap: 6px; }
        .select-btn {
          background: var(--bg-inset);
          border: 1px solid var(--phosphor-dim);
          color: var(--fg-1);
          font-family: var(--font-sans);
          font-size: 18px;
          font-weight: 500;
          padding: 10px 14px;
          display: flex; align-items: baseline; gap: 8px;
          cursor: pointer;
          border-radius: 2px;
          letter-spacing: -0.01em;
          transition: border-color var(--dur-fast);
        }
        .select-btn:hover { border-color: var(--phosphor); }
        .person-rel {
          color: var(--fg-3);
          font-size: 13px;
        }
        .chev {
          margin-left: auto;
          color: var(--phosphor-dim);
          font-size: 12px;
        }
        .birth-meta {
          display: flex; gap: 6px; align-items: center;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--phosphor-dim);
        }
        .birth-meta .sep { opacity: 0.4; }
      `}</style>
    </div>
  );
}

export function HouseSystemSwitcher({ value = 'Placidus' }) {
  const opts = ['Placidus', 'Whole Sign', 'Equal', 'Koch'];
  return (
    <div className="house-switcher">
      <div className="label">House system</div>
      <div className="seg">
        {opts.map((o) => (
          <button key={o} className={o === value ? 'on' : ''}>{o}</button>
        ))}
      </div>
      <style jsx>{`
        .house-switcher { display: flex; flex-direction: column; gap: 6px; }
        .seg {
          display: flex;
          border: 1px solid var(--phosphor-dim);
          border-radius: 2px;
          overflow: hidden;
          width: fit-content;
        }
        .seg button {
          background: transparent;
          border: none;
          border-right: 1px solid var(--phosphor-dim);
          color: var(--fg-3);
          font-family: var(--font-sans);
          font-size: 12px;
          padding: 6px 12px;
          cursor: pointer;
          transition: all var(--dur-fast);
        }
        .seg button:last-child { border-right: none; }
        .seg button:hover { color: var(--fg-1); }
        .seg button.on {
          background: rgba(255, 184, 76, 0.12);
          color: var(--phosphor);
          text-shadow: 0 0 4px currentColor;
        }
      `}</style>
    </div>
  );
}

export function BodyTable({ title, rows }) {
  return (
    <div className="body-table">
      <div className="bt-head">
        <span className="label">{title}</span>
        <span className="bt-count">{rows.length}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th className="th-glyph"></th>
            <th>Body</th>
            <th className="th-pos">Position</th>
            <th className="th-hs">H</th>
            <th className="th-r"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.name}>
              <td className="td-glyph" style={{ color: PLANET_COLORS[b.name] }}>{b.glyph}</td>
              <td className="td-name">{b.name}</td>
              <td className="td-pos">
                <span className="deg">{String(b.deg).padStart(2, ' ')}°{String(b.min).padStart(2, '0')}′</span>
                <span className="sign">{b.sign}</span>
              </td>
              <td className="td-house">{b.house}</td>
              <td className="td-retro">{b.retro ? '℞' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        .body-table { display: flex; flex-direction: column; }
        .bt-head {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 10px;
          border-bottom: 1px solid var(--phosphor-dim);
        }
        .bt-count {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--phosphor-dim);
          letter-spacing: 0.1em;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-mono);
          font-size: 12px;
          font-variant-numeric: tabular-nums;
        }
        th {
          text-align: left;
          padding: 6px 8px 4px;
          color: var(--fg-3);
          font-weight: 400;
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          border-bottom: 1px solid var(--phosphor-faint);
        }
        th.th-pos, th.th-hs, th.th-r { text-align: right; }
        td {
          padding: 5px 8px;
          color: var(--fg-1);
          border-bottom: 1px solid rgba(255,184,76,0.04);
        }
        tr:hover td { background: rgba(255,184,76,0.04); }
        .td-glyph {
          font-size: 16px;
          text-align: center;
          width: 22px;
          filter: drop-shadow(0 0 3px currentColor);
        }
        .td-name { color: var(--fg-1); }
        .td-pos { text-align: right; color: var(--phosphor); }
        .td-pos .sign { color: var(--fg-2); margin-left: 6px; }
        .td-house { text-align: right; color: var(--fg-2); width: 24px; }
        .td-retro {
          text-align: right; color: var(--alert);
          text-shadow: 0 0 4px currentColor;
          width: 18px;
        }
      `}</style>
    </div>
  );
}

export function AspectsList({ aspects, maxOrb = 2.0 }) {
  const aspectColor = {
    Conjunction: 'var(--phosphor)',
    Opposition:  'var(--alert)',
    Square:      'var(--alert)',
    Trine:       'var(--success)',
    Sextile:     'var(--p-mercury)',
    Quincunx:    'var(--p-jupiter)',
  };
  const filtered = aspects.filter((a) => a.orb <= maxOrb);
  return (
    <div className="aspects-list">
      <div className="al-head">
        <span className="label">Tightest aspects</span>
        <span className="al-orb">≤ {maxOrb.toFixed(1)}° orb</span>
      </div>
      <ul>
        {filtered.map((a, i) => (
          <li key={i}>
            <span className="a-body" style={{ color: PLANET_COLORS[a.a] || 'var(--fg-1)' }}>{a.a}</span>
            <span className="a-glyph" style={{ color: aspectColor[a.type] }}>{a.glyph}</span>
            <span className="a-body" style={{ color: PLANET_COLORS[a.b] || 'var(--fg-1)' }}>{a.b}</span>
            <span className="a-orb">{a.orb.toFixed(2)}°</span>
          </li>
        ))}
      </ul>
      <style jsx>{`
        .aspects-list { display: flex; flex-direction: column; }
        .al-head {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 10px;
          border-bottom: 1px solid var(--phosphor-dim);
        }
        .al-orb {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--phosphor-dim);
          letter-spacing: 0.1em;
        }
        ul { list-style: none; margin: 0; padding: 0; }
        li {
          display: grid;
          grid-template-columns: 1fr 18px 1fr 44px;
          gap: 8px;
          align-items: center;
          padding: 5px 10px;
          font-family: var(--font-mono);
          font-size: 12px;
          border-bottom: 1px solid rgba(255,184,76,0.04);
        }
        li:hover { background: rgba(255,184,76,0.04); }
        .a-body {
          font-family: var(--font-sans);
          font-size: 12px;
        }
        .a-body:first-child { text-align: right; }
        .a-glyph {
          text-align: center;
          font-size: 14px;
          filter: drop-shadow(0 0 3px currentColor);
        }
        .a-orb {
          text-align: right;
          color: var(--phosphor);
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
