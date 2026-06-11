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

  const atRiskCount = projectContributions.filter(
    (project) =>
      project.status === 'At Risk' || project.status === 'Blocked' || project.status === 'Delayed'
  ).length;

  const onTrackCount = projectContributions.filter((project) => project.status === 'On Track').length;

  const portfolioAvg = useMemo(() => {
    if (projectContributions.length === 0) {
      return 0;
    }
    const total = projectContributions.reduce((sum, project) => sum + project.productivePercent, 0);
    return Math.round(total / projectContributions.length);
  }, [projectContributions]);

  const attentionProjects = useMemo(
    () => projects.filter((project) => project.status !== 'On Track'),
    [projects]
  );

  const onTrackProjects = useMemo(
    () => projects.filter((project) => project.status === 'On Track'),
    [projects]
  );

  const renderProjectRow = (project: CeoProductivityProjectContribution) => {
    const tone = statusTone[project.status];

    return (
      <li
        key={project.id}
        className={`cpr-proj-row cpr-proj-row--${tone}`}
        aria-label={`${project.name}: ${project.productivePercent}% contribution, ${project.status}. ${project.reason}`}
      >
        <div className="cpr-proj-row__copy">
          <div className="cpr-proj-row__head">
            <span className="cpr-proj-row__name">{project.name}</span>
            <span className={`cpr-proj-row__status cpr-proj-row__status--${tone}`}>
              <StatusIcon status={project.status} />
              {project.status}
            </span>
          </div>
          <span className="cpr-proj-row__reason">{project.reason}</span>
        </div>
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
        {atRiskCount > 0 ? (
          <span className="cpr-pill cpr-pill--risk">{atRiskCount} need attention</span>
        ) : null}
      </header>

      <div className="cpr-proj-kpis" aria-label="Project portfolio summary">
        <div className="cpr-proj-kpis__item cpr-proj-kpis__item--track">
          <span className="cpr-proj-kpis__value">{onTrackCount}</span>
          <span className="cpr-proj-kpis__label">On track</span>
        </div>
        <div className="cpr-proj-kpis__item cpr-proj-kpis__item--watch">
          <span className="cpr-proj-kpis__value">{atRiskCount}</span>
          <span className="cpr-proj-kpis__label">Attention</span>
        </div>
        <div className="cpr-proj-kpis__item cpr-proj-kpis__item--avg">
          <span className="cpr-proj-kpis__value">{portfolioAvg}%</span>
          <span className="cpr-proj-kpis__label">Portfolio avg</span>
        </div>
      </div>

      <div className="cpr-proj-sections">
        {attentionProjects.length > 0 ? (
          <section className="cpr-proj-section" aria-label="Projects needing attention">
            <h4 className="cpr-proj-section__title">Needs attention</h4>
            <ul className="cpr-proj-list">{attentionProjects.map(renderProjectRow)}</ul>
          </section>
        ) : null}

        {onTrackProjects.length > 0 ? (
          <section className="cpr-proj-section" aria-label="Projects on track">
            <h4 className="cpr-proj-section__title">On track</h4>
            <ul className="cpr-proj-list">{onTrackProjects.map(renderProjectRow)}</ul>
          </section>
        ) : null}
      </div>
    </article>
  );
};
