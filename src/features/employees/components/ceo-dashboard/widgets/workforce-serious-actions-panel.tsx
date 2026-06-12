import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import type { WorkforceActionSeverity } from '../data/ceo-dashboard.data';

const severityBadge: Record<WorkforceActionSeverity, string> = {
  critical: 'cwf-actions__badge--critical',
  warning: 'cwf-actions__badge--warning'
};

const severityCard: Record<WorkforceActionSeverity, string> = {
  critical: 'cwf-actions__card--critical',
  warning: 'cwf-actions__card--warning'
};

const severityLabel: Record<WorkforceActionSeverity, string> = {
  critical: 'Critical',
  warning: 'Warning'
};

export const WorkforceSeriousActionsPanel: React.FC = () => {
  const { seriousActions } = ceoDashboardData.workforce;
  const criticalCount = seriousActions.filter((action) => action.severity === 'critical').length;

  return (
    <article className="eto-widget cwo-cell--actions cwf-panel cwf-panel--actions cwf-actions">
      <header className="cwf-actions__head">
        <div className="cwf-actions__title-block">
          <span className="cwf-actions__icon-wrap" aria-hidden="true">
            <AlertTriangle size={16} />
          </span>
          <div className="cwf-actions__titles">
            <h3 className="cwf-actions__title">Critical Actions</h3>
            <p className="cwf-actions__subtitle">Items needing CEO attention today</p>
          </div>
        </div>
        <span
          className={`cwf-actions__head-badge ${
            criticalCount > 0 ? 'cwf-actions__head-badge--critical' : 'cwf-actions__head-badge--neutral'
          }`}
        >
          {criticalCount > 0 ? `${criticalCount} critical` : `${seriousActions.length} items`}
        </span>
      </header>

      <ul className="cwf-actions__list" aria-label="Critical actions requiring CEO attention">
        {seriousActions.map((action) => (
          <li
            key={action.id}
            className={`cwf-actions__card ${severityCard[action.severity]}`}
          >
            <div className="cwf-actions__card-copy">
              <span className="cwf-actions__card-title">{action.title}</span>
              <span className="cwf-actions__card-meta">
                {action.impactCount.toLocaleString()} employees impacted
              </span>
            </div>
            <div className="cwf-actions__card-tail">
              <span className={`cwf-actions__badge ${severityBadge[action.severity]}`}>
                {severityLabel[action.severity]}
              </span>
              <button type="button" className="cwf-actions__card-btn">
                {action.actionLabel}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};
