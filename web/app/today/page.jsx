import {
  MiniRadar,
  CurrentSky,
  TightestAspects,
  RecentPings,
  OpenPredictions,
  QuickPing,
  BottomTabs,
} from '@/components/TodayComponents';
import {
  TODAY_CURRENT_SKY,
  TODAY_TIGHTEST_ASPECTS,
  TODAY_RECENT_PINGS,
  TODAY_OPEN_PREDICTIONS,
  AVERY_CHART,
} from '@/lib/chart-data';

export default function TodayPage() {
  const ascLon = AVERY_CHART.ascendant.lon;

  return (
    <div className="today-surface">
      <header className="today-header">
        <div className="th-line">
          <span className="brand-glyph">⊙</span>
          <span className="brand-wm">astro</span>
          <span className="brand-sub">lab notebook</span>
          <span className="th-spacer" />
          <span className="data">2026·05·24</span>
        </div>
        <h1 className="th-title">Today</h1>
      </header>

      <main className="today-main">
        <section className="panel radar-panel">
          <div className="label">Current sky</div>
          <div className="radar-wrap">
            <MiniRadar size={260} currentSky={TODAY_CURRENT_SKY} natalAsc={ascLon} />
          </div>
          <CurrentSky data={TODAY_CURRENT_SKY} />
        </section>

        <section className="panel">
          <div className="label">Tightest transits to natal</div>
          <TightestAspects aspects={TODAY_TIGHTEST_ASPECTS} />
        </section>

        <section className="panel">
          <div className="label">Open predictions</div>
          <OpenPredictions predictions={TODAY_OPEN_PREDICTIONS} />
        </section>

        <section className="panel">
          <div className="label">Recent pings</div>
          <RecentPings pings={TODAY_RECENT_PINGS} />
        </section>

        <section className="panel">
          <QuickPing />
        </section>
      </main>

      <div className="today-tabs">
        <BottomTabs active="Today" />
      </div>

      <style>{`
        .today-surface {
          min-height: 100vh;
          background: var(--bg-deep);
          color: var(--fg-1);
          padding-bottom: 70px;
        }
        .today-header {
          padding: 18px 20px 12px;
          border-bottom: 1px solid var(--phosphor-dim);
          background: var(--bg-panel);
        }
        .th-line {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 8px;
        }
        .th-spacer { flex: 1; }
        .brand-glyph {
          font-family: var(--font-mono);
          font-size: 16px;
          color: var(--phosphor);
          filter: drop-shadow(0 0 4px currentColor);
        }
        .brand-wm {
          font-family: var(--font-sans);
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--fg-1);
        }
        .brand-sub {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--fg-3);
        }
        .th-title {
          font-family: var(--font-sans);
          font-size: 22px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--fg-1);
          margin: 0;
        }
        .today-main {
          max-width: 720px;
          margin: 0 auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .panel {
          background: var(--bg-panel);
          border: 1px solid var(--bezel);
          border-radius: var(--r-2);
          overflow: hidden;
        }
        .panel > .label {
          display: block;
          padding: 8px 12px 4px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--fg-3);
          font-weight: 500;
          border-bottom: 1px solid var(--phosphor-dim);
        }
        .radar-panel {
          display: flex;
          flex-direction: column;
        }
        .radar-wrap {
          display: flex;
          justify-content: center;
          padding: 16px;
        }
        .today-tabs {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--bg-panel);
        }
      `}</style>
    </div>
  );
}
