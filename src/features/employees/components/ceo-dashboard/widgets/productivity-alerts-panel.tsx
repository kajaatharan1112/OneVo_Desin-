import React, { useMemo } from 'react';
import { AlertTriangle, BellRing, CircleAlert } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

type AlertSeverity = 'critical' | 'warning';

interface ProductivityAlert {
  id: string;
  title: string;
  detail: string;
  severity: AlertSeverity;
  actionLabel?: string;
}

function AlertRow({ item }: { item: ProductivityAlert }) {
  return (
    <li className={`cpr-alerts__row cpr-alerts__row--${item.severity}`}>
      <span className="cpr-alerts__row-icon" aria-hidden="true">
        {item.severity === 'critical' ? <CircleAlert size={15} /> : <AlertTriangle size={15} />}
      </span>
      <div className="cpr-alerts__row-copy">
        <p className="cpr-alerts__row-title">{item.title}</p>
        <p className="cpr-alerts__row-desc">{item.detail}</p>
      </div>
      {item.actionLabel ? (
        <button type="button" className="cpr-alerts__row-badge cpr-alerts__row-badge--action">
          {item.actionLabel}
        </button>
      ) : (
        <span className={`cpr-alerts__row-badge cpr-alerts__row-badge--${item.severity}`}>
          {item.severity === 'critical' ? 'Critical' : 'Warning'}
        </span>
      )}
    </li>
  );
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

  const criticalAlerts = alerts.filter((item) => item.severity === 'critical');
  const warningAlerts = alerts.filter((item) => item.severity === 'warning');

  return (
    <article className="eto-widget cpr-panel cpr-cell--alerts cpr-alerts">
      <header className="cpr-panel__head">
        <div className="cpr-panel__title-block">
          <span className="cpr-panel__icon-wrap" aria-hidden="true">
            <BellRing size={16} />
          </span>
          <div className="cpr-panel__titles">
            <h3 className="cpr-panel__title">Productivity Alerts</h3>
            <p className="cpr-panel__subtitle">Blockers, overdue work, and drops</p>
          </div>
        </div>
        <span
          className={`cpr-alerts__badge${criticalAlerts.length > 0 ? ' cpr-alerts__badge--critical' : ''}`}
        >
          {alerts.length} active
        </span>
      </header>

      <div className="cpr-scroll-fade cpr-scroll-fade--alerts">
        <div className="cpr-alerts__groups" aria-label="Productivity alerts">
          {criticalAlerts.length > 0 ? (
            <section className="cpr-alerts__group">
              <h4 className="cpr-alerts__group-title">Critical</h4>
              <ul className="cpr-alerts__list">
                {criticalAlerts.map((item) => (
                  <AlertRow key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ) : null}

          {warningAlerts.length > 0 ? (
            <section className="cpr-alerts__group">
              <h4 className="cpr-alerts__group-title">Warning</h4>
              <ul className="cpr-alerts__list">
                {warningAlerts.map((item) => (
                  <AlertRow key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
};
