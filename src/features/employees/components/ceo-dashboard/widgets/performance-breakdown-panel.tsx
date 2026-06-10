import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

export const PerformanceBreakdownPanel: React.FC = () => {
  const { breakdown } = ceoDashboardData.companyPerformance;

  return (
    <article className="cwo-widget cpg-cell--breakdown">
      <header className="cwo-widget__head">
        <BarChart3 size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Area scores</h4>
      </header>
      <ul className="cwo-meter-list">
        {breakdown.map((item) => (
          <li key={item.id} className="cwo-meter-list__item">
            <div className="cwo-meter-list__top">
              <span className="cwo-meter-list__title">{item.label}</span>
              <span className="cwo-meter-list__badge">{item.rate}%</span>
            </div>
            <div className="cwo-meter-list__bar" aria-hidden="true">
              <span className="cwo-meter-list__fill" style={{ width: `${item.rate}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};
