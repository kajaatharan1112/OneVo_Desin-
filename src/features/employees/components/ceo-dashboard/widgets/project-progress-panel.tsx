import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import type { ProjectStatus } from '../data/ceo-dashboard.data';

const statusClass: Record<ProjectStatus, string> = {
  'On Track': 'cph-status cph-status--track',
  Delayed: 'cph-status cph-status--delayed',
  Blocked: 'cph-status cph-status--blocked',
  'At Risk': 'cph-status cph-status--risk'
};

export const ProjectProgressPanel: React.FC = () => {
  const { progressOverview } = ceoDashboardData.projects;

  return (
    <article className="cwo-widget cph-cell--progress">
      <header className="cwo-widget__head">
        <TrendingUp size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Each project progress</h4>
      </header>
      <ul className="cwo-meter-list">
        {progressOverview.map((project) => (
          <li key={project.id} className="cwo-meter-list__item">
            <div className="cwo-meter-list__top">
              <span className="cwo-meter-list__title">{project.name}</span>
              <span className={statusClass[project.status]}>{project.status}</span>
            </div>
            <div className="cwo-meter-list__bar" aria-hidden="true">
              <span
                className={`cwo-meter-list__fill cph-progress-fill cph-progress-fill--${project.status.replace(/\s+/g, '-').toLowerCase()}`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="cwo-meter-list__meta">{project.progress}% complete</span>
          </li>
        ))}
      </ul>
    </article>
  );
};
