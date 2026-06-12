import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import type { ProductivityActionSeverity } from '../data/ceo-dashboard.data';

const severityBadge: Record<ProductivityActionSeverity, string> = {
  critical: 'cpr-actions__badge--critical',
  warning: 'cpr-actions__badge--warning'
};

const severityCard: Record<ProductivityActionSeverity, string> = {
  critical: 'cpr-actions__card--critical',
  warning: 'cpr-actions__card--warning'
};

const severityLabel: Record<ProductivityActionSeverity, string> = {
  critical: 'Critical',
  warning: 'Warning'
};

export const ProductivityActionNeededPanel: React.FC = () => {
  const { actionItems } = ceoDashboardData.productivity;
  const criticalCount = actionItems.filter((item) => item.severity === 'critical').length;

  return (
    <article className="eto-widget cpr-panel cpr-cell--actions cpr-actions">
      <header className="cpr-actions__head">
        <div className="cpr-actions__title-block">
          <span className="cpr-actions__icon-wrap" aria-hidden="true">
            <AlertCircle size={16} />
          </span>
          <div className="cpr-actions__titles">
            <h3 className="cpr-actions__title">CEO Action Needed</h3>
            <p className="cpr-actions__subtitle">Decisions blocking delivery</p>
          </div>
        </div>
        <span
          className={`cpr-actions__head-badge ${
            criticalCount > 0 ? 'cpr-actions__head-badge--critical' : 'cpr-actions__head-badge--neutral'
          }`}
        >
          {criticalCount > 0 ? `${criticalCount} critical` : `${actionItems.length} items`}
        </span>
      </header>

      <ul className="cpr-actions__list" aria-label="CEO action items">
        {actionItems.map((item) => (
          <li key={item.id} className={`cpr-actions__card ${severityCard[item.severity]}`}>
            <span className="cpr-actions__card-label">{item.label}</span>
            <div className="cpr-actions__card-tail">
              <span className={`cpr-actions__badge ${severityBadge[item.severity]}`}>
                {severityLabel[item.severity]}
              </span>
              <button type="button" className="cpr-actions__card-btn">
                {item.actionLabel}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};
