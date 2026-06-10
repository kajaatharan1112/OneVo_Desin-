import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import type { ProjectStatus } from '../data/ceo-dashboard.data';
import { WidgetLead } from './widget-lead';

const statusClass: Record<ProjectStatus, string> = {
  'On Track': 'cph-focus-card--track',
  Delayed: 'cph-focus-card--delayed',
  Blocked: 'cph-focus-card--blocked',
  'At Risk': 'cph-focus-card--risk'
};

export const ProjectFocusPanel: React.FC = () => {
  const { delayedBlocked } = ceoDashboardData.projects;

  return (
    <article className="cwo-widget cph-cell--focus">
      <header className="cwo-widget__head">
        <AlertTriangle size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Needs your attention</h4>
      </header>
      <WidgetLead
        value={`${delayedBlocked.length} projects blocked or delayed`}
        caption="Reason and delay shown for each — review these first"
        tone="warn"
      />
      <ul className="cph-focus-list">
        {delayedBlocked.map((item) => (
          <li key={item.id} className={`cph-focus-card ${statusClass[item.status]}`}>
            <div className="cph-focus-card__head">
              <span className="cph-focus-card__name">{item.name}</span>
              <span className="cph-focus-card__status">{item.status}</span>
            </div>
            <p className="cph-focus-card__reason">{item.reason}</p>
            <span className="cph-focus-card__meta">{item.delayLabel}</span>
          </li>
        ))}
      </ul>
    </article>
  );
};
