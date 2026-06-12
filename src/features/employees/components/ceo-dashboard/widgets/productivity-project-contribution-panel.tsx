import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, CircleX, Layers } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import type { CeoProductivityProjectContribution, ProjectStatus } from '../data/ceo-dashboard.data';

const STATUS_PRIORITY: Record<ProjectStatus, number> = {
  Blocked: 0,
  Delayed: 1,
  'At Risk': 2,
  'On Track': 3
};

const statusTone: Record<ProjectStatus, string> = {
  'On Track': 'track',
  Delayed: 'delayed',
  Blocked: 'blocked',
  'At Risk': 'risk'
};

function sortProjects(projects: CeoProductivityProjectContribution[]) {
  return [...projects].sort((a, b) => {
    const statusDelta = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (statusDelta !== 0) {
      return statusDelta;
    }
    return b.productivePercent - a.productivePercent;
  });
}

function StatusIcon({ status }: { status: ProjectStatus }) {
  if (status === 'On Track') {
    return <CheckCircle2 size={12} aria-hidden="true" />;
  }
  if (status === 'Blocked') {
    return <CircleX size={12} aria-hidden="true" />;
  }
  return <AlertTriangle size={12} aria-hidden="true" />;
}

export const ProductivityProjectContributionPanel: React.FC = () => {
  const { projectContributions } = ceoDashboardData.productivity;

  const projects = useMemo(() => sortProjects(projectContributions), [projectContributions]);

  const renderProjectRow = (project: CeoProductivityProjectContribution) => {
    const tone = statusTone[project.status];

    return (
      <li
        key={project.id}
        className={`cpr-proj-row cpr-proj-row--${tone}`}
        aria-label={`${project.name}: ${project.productivePercent}% contribution, ${project.status}. ${project.reason}`}
      >
        <div className="cpr-proj-row__copy">
          <p className="cpr-proj-row__name">{project.name}</p>
          <p className="cpr-proj-row__reason">{project.reason}</p>
        </div>
        <span className={`cpr-proj-row__status cpr-proj-row__status--${tone}`}>
          <StatusIcon status={project.status} />
          {project.status === 'At Risk' ? 'Attention' : project.status}
        </span>
        <div
          className={`cpr-proj-row__ring cpr-proj-row__ring--${tone}`}
          style={{ '--cpr-proj-pct': project.productivePercent } as React.CSSProperties}
          role="img"
          aria-label={`${project.productivePercent}% contribution`}
        >
          <span aria-hidden="true">{project.productivePercent}%</span>
        </div>
      </li>
    );
  };

  return (
    <article className="eto-widget cpr-panel cpr-cell--projects cpr-proj-board">
      <header className="cpr-panel__head">
        <div className="cpr-panel__title-block">
          <span className="cpr-panel__icon-wrap" aria-hidden="true">
            <Layers size={16} />
          </span>
          <div className="cpr-panel__titles">
            <h3 className="cpr-panel__title">Project Contribution</h3>
            <p className="cpr-panel__subtitle">Delivery impact by active project</p>
          </div>
        </div>
      </header>

      <div className="cpr-scroll-fade cpr-scroll-fade--proj">
        <ul className="cpr-proj-list" aria-label="Project contribution list">
          {projects.map(renderProjectRow)}
        </ul>
      </div>
    </article>
  );
};
