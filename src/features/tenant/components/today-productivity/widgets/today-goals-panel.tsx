import React from 'react';
import { Target } from 'lucide-react';
import { executiveDashboard } from '../../../data/executive-dashboard.data';
import { todayCompanyProjects } from '../../../data/tenant-today-productivity.data';

export const TodayGoalsPanel: React.FC = () => (
  <article className="tto-widget tto-goals tto-cell--goals">
    <header className="tto-widget__head">
      <Target size={16} aria-hidden="true" />
      <h3 className="tto-widget__title">{executiveDashboard.projectGoals.title}</h3>
    </header>

    <div className="tto-goals__list">
      {todayCompanyProjects.map((project) => (
          <div key={project.id} className="tto-goals__project-box">
            <div className="tto-goals__project-row">
              <span className="tto-goals__project-name">{project.name}</span>
              <span className="tto-goals__project-pct">
                <span className="tto-goals__project-pct--done">{project.completedPercent}%</span>
                <span className="tto-goals__project-pct--sep"> / </span>
                <span className="tto-goals__project-pct--rem">{project.remainingPercent}% left</span>
              </span>
            </div>
            <div className="tto-goals__bar-track" role="progressbar" aria-valuenow={project.completedPercent} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="tto-goals__bar-fill"
                style={{ width: `${project.completedPercent}%` }}
              />
            </div>
          </div>
        ))}
    </div>
  </article>
);
