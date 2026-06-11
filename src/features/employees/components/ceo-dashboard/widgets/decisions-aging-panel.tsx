import React from 'react';
import { Clock } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

export const DecisionsAgingPanel: React.FC = () => {
  const { agingBuckets, summary } = ceoDashboardData.decisions;
  const total = summary.pendingApprovals;

  return (
    <article className="cwo-widget cdo-cell--aging">
      <header className="cwo-widget__head">
        <Clock size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Approval aging</h4>
        <span className="cwo-widget__tab cwo-widget__tab--warn">
          {summary.waitingOver48Hours} &gt;48h
        </span>
      </header>

      <div className="cdo-stack-bar" aria-hidden="true">
        {agingBuckets.map((bucket, index) => (
          <span
            key={bucket.label}
            className={`cdo-stack-bar__seg cdo-stack-bar__seg--tone-${index + 1}${index === 2 ? ' cdo-stack-bar__seg--warn' : ''}`}
            style={{ width: `${Math.round((bucket.count / total) * 100)}%` }}
            title={`${bucket.label}: ${bucket.count}`}
          />
        ))}
      </div>

      <div className="cwo-tile-grid cwo-tile-grid--three">
        {agingBuckets.map((bucket, index) => (
          <div
            key={bucket.label}
            className={`cwo-tile${index === 2 ? ' cwo-tile--warn' : index === 0 ? ' cwo-tile--accent' : ''}`}
          >
            <span className={`cwo-tile__value${index === 2 ? ' cwo-tile__value--warn' : ''}`}>
              {bucket.count}
            </span>
            <span className="cwo-tile__label">{bucket.label.replace(' hours', 'h')}</span>
          </div>
        ))}
      </div>

      <p className="cdo-aging-note">
        {Math.round((agingBuckets[0].count / total) * 100)}% resolved within 24 hours
      </p>
    </article>
  );
};
