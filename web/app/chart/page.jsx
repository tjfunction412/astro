import ChartWheel from '@/components/ChartWheel';
import {
  ChartHeader,
  PersonSelector,
  HouseSystemSwitcher,
  BodyTable,
  AspectsList,
} from '@/components/ChartPanels';
import { AVERY_CHART } from '@/lib/chart-data';

export default function ChartPage() {
  const chart = AVERY_CHART;

  return (
    <div className="chart-surface">
      <ChartHeader activeSurface="Chart" />

      <main className="chart-main">
        <aside className="chart-controls">
          <PersonSelector person={chart.person} />
          <HouseSystemSwitcher value={chart.houseSystem} />
        </aside>

        <section className="chart-wheel-wrap">
          <ChartWheel size={560} chart={chart} />
          <div className="wheel-caption">
            <span className="label">{chart.person.name}</span>
            <span className="data">{chart.person.birth.date} · {chart.person.birth.time} · {chart.person.birth.place}</span>
          </div>
        </section>

        <aside className="chart-side">
          <BodyTable title="Planets"   rows={chart.planets} />
          <BodyTable title="Points"    rows={chart.points} />
          <BodyTable title="Asteroids" rows={chart.asteroids} />
          <AspectsList aspects={chart.aspects} maxOrb={2.0} />
        </aside>
      </main>

      <style>{`
        .chart-surface {
          min-height: 100vh;
          background: var(--bg-deep);
          color: var(--fg-1);
        }
        .chart-main {
          display: grid;
          grid-template-columns: 260px 1fr 360px;
          gap: 24px;
          padding: 24px;
          align-items: start;
        }
        .chart-controls {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .chart-wheel-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .wheel-caption {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-variant-numeric: tabular-nums;
        }
        .chart-side {
          display: flex;
          flex-direction: column;
          gap: 18px;
          background: var(--bg-panel);
          border: 1px solid var(--bezel);
          border-radius: var(--r-2);
          padding: 8px;
        }
        @media (max-width: 1100px) {
          .chart-main {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
