import React, { useMemo } from 'react';
import { AlertTriangle, CircleAlert } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

const FOCUS_STATUS = new Set(['Blocked', 'Delayed', 'At Risk']);
const EMPLOYEE_SCORE_THRESHOLD = 80;

export const PerformanceWatchPanel: React.FC = () => {
  const { productHighlights, employeeHighlights, employeeKpis } = ceoDashboardData.companyPerformance;

  const watchItems = useMemo(() => {
    const items: { id: string; title: string; detail: string; critical: boolean }[] = [];

    productHighlights
      .filter((item) => FOCUS_STATUS.has(item.status))
      .forEach((item) => {
        items.push({
          id: `product-${item.id}`,
          title: item.name,
          detail: `${item.score}% · ${item.note}`,
          critical: item.status === 'Blocked' || item.status === 'Delayed'
        });
      });

    employeeHighlights
      .filter((item) => item.score < EMPLOYEE_SCORE_THRESHOLD)
      .forEach((item) => {
        items.push({
          id: `employee-${item.id}`,
          title: item.label,
          detail: `${item.score}% · ${item.meta}`,
          critical: false
        });
      });

    const attendanceKpi = employeeKpis.find((kpi) => kpi.id === 'ek2');
    if (attendanceKpi?.tone === 'warn') {
      items.push({
        id: 'attendance-kpi',
        title: attendanceKpi.label,
        detail: attendanceKpi.delta ?? 'Below company goal',
        critical: false
      });
    }

    return items;
  }, [employeeHighlights, employeeKpis, productHighlights]);

  return (
    <article className="eto-widget eto-status-panel cpg-cell--watch">
      <header className="eto-widget__head">
        <AlertTriangle size={16} aria-hidden="true" />
        <h3 className="eto-widget__title">Watch list</h3>
        <span className="eto-widget__meta">{watchItems.length} items</span>
      </header>

      <div className="eto-status-panel__banner">
        <p className="eto-status-panel__banner-title">{watchItems.length} priorities need review</p>
        <p className="eto-status-panel__banner-desc">
          Products at risk and employee metrics below target
        </p>
      </div>

      <ul className="eto-status-panel__list nexus-scroll-y">
        {watchItems.map((item) => (
          <li key={item.id} className="eto-status-panel__item">
            <span className="eto-status-panel__icon" aria-hidden="true">
              {item.critical ? <CircleAlert size={14} /> : <AlertTriangle size={14} />}
            </span>
            <div className="eto-status-panel__copy">
              <span className="eto-status-panel__title">{item.title}</span>
              <span className="eto-status-panel__detail">{item.detail}</span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};
