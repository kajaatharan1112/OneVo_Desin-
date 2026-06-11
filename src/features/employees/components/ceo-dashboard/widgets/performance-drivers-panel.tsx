import React from 'react';
import { Layers, Package, Users } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

interface DriverTileProps {
  tone: 'product' | 'employee';
  label: string;
  score: number;
  headline: string;
  status: string;
  targetNote: string;
}

function DriverIcon({ tone }: { tone: DriverTileProps['tone'] }) {
  if (tone === 'product') {
    return <Package size={14} aria-hidden="true" />;
  }
  return <Users size={14} aria-hidden="true" />;
}

function DriverTile({ tone, label, score, headline, status, targetNote }: DriverTileProps) {
  return (
    <div className={`cpg-driver-tile cpg-driver-tile--${tone}`}>
      <div className="cpg-driver-tile__top">
        <span className="cpg-driver-tile__icon" aria-hidden="true">
          <DriverIcon tone={tone} />
        </span>
        <span className="cpg-driver-tile__label">{label.toUpperCase()}</span>
      </div>
      <div
        className="cpg-driver-tile__ring"
        style={{ '--cpg-driver-pct': score } as React.CSSProperties}
        role="img"
        aria-label={`${label}: ${score}%`}
      >
        <span aria-hidden="true">{score}%</span>
      </div>
      <p className="cpg-driver-tile__headline">{headline}</p>
      <p className="cpg-driver-tile__status">{status}</p>
      <span className="cpg-driver-tile__pill">{targetNote}</span>
    </div>
  );
}

export const PerformanceDriversPanel: React.FC = () => {
  const { breakdown, productKpis, employeeKpis } = ceoDashboardData.companyPerformance;
  const deliveryRate = breakdown.find((item) => item.id === 'delivery')?.rate ?? 82;
  const productivityRate = breakdown.find((item) => item.id === 'productivity')?.rate ?? 81;
  const deliveryKpi = productKpis.find((kpi) => kpi.id === 'pk1');
  const csatKpi = productKpis.find((kpi) => kpi.id === 'pk3');
  const attendanceKpi = employeeKpis.find((kpi) => kpi.id === 'ek2');

  return (
    <article className="cpg-card cpg-card--drivers cpg-cell--drivers">
      <header className="cpg-card__head">
        <div className="cpg-card__title-block">
          <span className="cpg-card__icon cpg-drivers__icon" aria-hidden="true">
            <Layers size={16} />
          </span>
          <div>
            <h3 className="cpg-card__title">Drivers</h3>
            <p className="cpg-card__subtitle">What is driving the company score</p>
          </div>
        </div>
      </header>

      <div className="cpg-drivers__grid">
        <DriverTile
          tone="product"
          label="Product"
          score={deliveryRate}
          headline={`${deliveryRate}% delivery`}
          status={csatKpi ? `${csatKpi.value} customer satisfaction` : 'On-time delivery stable'}
          targetNote={deliveryKpi?.delta ?? '-2% vs last month'}
        />
        <DriverTile
          tone="employee"
          label="Employee"
          score={productivityRate}
          headline={`${productivityRate}% productivity`}
          status={
            attendanceKpi
              ? `${attendanceKpi.value} attendance today`
              : 'Team output holding steady'
          }
          targetNote={attendanceKpi?.delta ?? '+6% vs last week'}
        />
      </div>
    </article>
  );
};
