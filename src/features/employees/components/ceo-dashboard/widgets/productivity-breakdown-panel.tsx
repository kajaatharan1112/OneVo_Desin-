import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

export const ProductivityBreakdownPanel: React.FC = () => {
  const { breakdown } = ceoDashboardData.productivity;

  return (
    <article className="cwo-widget cpr-cell--breakdown">
      <header className="cwo-widget__head">
        <BarChart3 size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Productivity breakdown</h4>
      </header>
      <ul className="cwo-meter-list cwo-meter-list--breakdown">
        {breakdown.map((item) => {
          const isNegative = item.tone === 'negative';
          const isDanger = item.id === 'overdue';
          const displayRate = isNegative ? `-${item.rate}%` : `${item.rate}%`;
          const negativeFill = isDanger
            ? ' cwo-meter-list__fill--danger'
            : ' cwo-meter-list__fill--warn';
          const negativeBadge = isDanger
            ? ' cwo-meter-list__badge--danger'
            : ' cwo-meter-list__badge--warn';

          return (
            <li key={item.id} className="cwo-meter-list__item">
              <div className="cwo-meter-list__top">
                <span className="cwo-meter-list__title">{item.label}</span>
                <span
                  className={`cwo-meter-list__badge${isNegative ? negativeBadge : ''}`}
                >
                  {displayRate}
                </span>
              </div>
              <div className="cwo-meter-list__bar" aria-hidden="true">
                <span
                  className={`cwo-meter-list__fill${isNegative ? negativeFill : ''}`}
                  style={{ width: `${item.rate}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
};
