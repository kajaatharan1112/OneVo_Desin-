import React from 'react';
import { FolderKanban } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

const statusItems = [
  { key: 'onTrack' as const, label: 'On track', tone: 'track' },
  { key: 'delayed' as const, label: 'Delayed', tone: 'delayed' },
  { key: 'blocked' as const, label: 'Blocked', tone: 'blocked' },
  { key: 'atRisk' as const, label: 'At risk', tone: 'risk' }
];

export const ProjectSummaryPanel: React.FC = () => {
  const { summary } = ceoDashboardData.projects;

  return (
    <article className="cwo-widget cph-cell--summary cph-summary">
      <header className="cwo-widget__head">
        <FolderKanban size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Project portfolio</h4>
        <span className="cwo-widget__tab">{summary.onTimeRate}% on-time</span>
      </header>

      <div className="cph-summary__hero">
        <span className="cph-summary__hero-value">{summary.activeProjects}</span>
        <span className="cph-summary__hero-label">Active projects</span>
      </div>

      <div className="cph-summary__progress">
        <div className="cph-summary__progress-head">
          <span className="cph-summary__progress-label">Average progress</span>
          <span className="cph-summary__progress-value">{summary.averageProgress}%</span>
        </div>
        <div className="cwo-meter-list__bar" aria-hidden="true">
          <span
            className="cwo-meter-list__fill"
            style={{ width: `${summary.averageProgress}%` }}
          />
        </div>
      </div>

      <ul className="cph-summary__stats">
        {statusItems.map((item) => (
          <li key={item.key} className={`cph-summary__stat cph-summary__stat--${item.tone}`}>
            <span className="cph-summary__stat-value">{summary[item.key]}</span>
            <span className="cph-summary__stat-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </article>
  );
};
