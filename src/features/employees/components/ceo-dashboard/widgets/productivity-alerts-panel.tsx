import React, { useMemo } from 'react';
import { AlertTriangle, CircleAlert, BellRing } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

type AlertSeverity = 'critical' | 'warning';

interface ProductivityAlert {
  id: string;
  title: string;
  detail: string;
  severity: AlertSeverity;
  actionLabel?: string;
}

export const ProductivityAlertsPanel: React.FC = () => {
  const { actionItems, performanceHighlights, blockedWork, summary } = ceoDashboardData.productivity;

  const alerts = useMemo<ProductivityAlert[]>(() => {
    const items: ProductivityAlert[] = [];

    actionItems.forEach((item) => {
      items.push({
        id: item.id,
        title: item.label,
        detail: item.severity === 'critical' ? 'Blocking delivery progress' : 'Needs review',
        severity: item.severity,
        actionLabel: item.actionLabel
      });
    });

    performanceHighlights
      .filter((item) => item.tone === 'warning' || item.tone === 'negative')
      .forEach((item) => {
        items.push({
          id: `highlight-${item.id}`,
          title: item.label,
          detail: item.tone === 'negative' ? 'Below productivity target' : 'Watch this week',
          severity: item.tone === 'negative' ? 'critical' : 'warning'
        });
      });

    const blockedTotal = blockedWork.reduce((sum, item) => sum + item.count, 0);
    if (blockedTotal > 0) {
      const topBlocker = [...blockedWork].sort((a, b) => b.count - a.count)[0];
      items.push({
        id: 'blocked-work',
        title: `${blockedTotal} blocked tasks company-wide`,
        detail: topBlocker ? `Top blocker: ${topBlocker.reason}` : 'Review blockers',
        severity: blockedTotal >= 10 ? 'critical' : 'warning'
      });
    }

    if (summary.overdueTasks >= 20) {
      items.push({
        id: 'overdue-tasks',
        title: `${summary.overdueTasks} overdue tasks today`,
        detail: 'Impacting delivery velocity',
        severity: 'warning'
      });
    }

    return items;
  }, [actionItems, blockedWork, performanceHighlights, summary.overdueTasks]);

  const criticalCount = alerts.filter((item) => item.severity === 'critical').length;

  return (
    <article className="eto-widget eto-status-panel cpr-panel cpr-cell--alerts cpr-alerts">
      <header className="eto-widget__head">
        <BellRing size={16} aria-hidden="true" />
        <h3 className="eto-widget__title">Productivity Alerts</h3>
        <span className={`cpr-alerts__badge${criticalCount > 0 ? ' cpr-alerts__badge--critical' : ''}`}>
          {alerts.length} active
        </span>
      </header>

      <div className="eto-status-panel__banner cpr-alerts__banner">
        <p className="eto-status-panel__banner-title">
          {criticalCount > 0 ? `${criticalCount} critical alerts` : 'No critical alerts'}
        </p>
        <p className="eto-status-panel__banner-desc">
          Blockers, overdue work, and productivity drops
        </p>
      </div>

      <ul className="eto-status-panel__list cpr-alerts__list" aria-label="Productivity alerts">
        {alerts.map((item) => (
          <li key={item.id} className={`eto-status-panel__item cpr-alerts__item cpr-alerts__item--${item.severity}`}>
            <span className="eto-status-panel__icon cpr-alerts__icon" aria-hidden="true">
              {item.severity === 'critical' ? <CircleAlert size={14} /> : <AlertTriangle size={14} />}
            </span>
            <div className="eto-status-panel__copy cpr-alerts__copy">
              <span className="eto-status-panel__title">{item.title}</span>
              <span className="eto-status-panel__detail">{item.detail}</span>
            </div>
            {item.actionLabel ? (
              <button type="button" className="cpr-alerts__action">
                {item.actionLabel}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </article>
  );
};
