import React from 'react';
import { AlertTriangle, TrendingDown, Users, Server } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

const impactIcons: Record<string, React.ReactNode> = {
  h1: <TrendingDown size={14} aria-hidden="true" />,
  h2: <Users size={14} aria-hidden="true" />,
  h3: <Server size={14} aria-hidden="true" />
};

export const DecisionsHighImpactPanel: React.FC = () => {
  const { highImpact } = ceoDashboardData.decisions;

  return (
    <article className="cwo-widget cdo-cell--impact">
      <header className="cwo-widget__head">
        <AlertTriangle size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">High impact</h4>
        <span className="cwo-widget__tab cwo-widget__tab--warn">{highImpact.length} critical</span>
      </header>
      <ul className="cdo-banner-list">
        {highImpact.map((item) => (
          <li key={item.id} className="cdo-banner-list__item">
            <span className="cdo-banner-list__stripe" aria-hidden="true" />
            <span className="cdo-banner-list__icon">
              {impactIcons[item.id] ?? <AlertTriangle size={14} aria-hidden="true" />}
            </span>
            <div className="cdo-banner-list__copy">
              <span className="cdo-banner-list__title">{item.title}</span>
              <span className="cdo-banner-list__risk">{item.risk}</span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};
