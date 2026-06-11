import React, { useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

const DISPLAY_COUNT = 2;

function getDeptStatus(rate: number, avg: number): { label: string; tone: 'above' | 'below' } {
  if (rate >= avg) {
    return { label: 'Above avg', tone: 'above' };
  }
  return { label: 'Below avg', tone: 'below' };
}

export const PerformanceDepartmentsPanel: React.FC = () => {
  const { departmentPerformance, summary } = ceoDashboardData.companyPerformance;
  const companyAvg = summary.scorePercent;

  const ranked = useMemo(
    () => [...departmentPerformance].sort((a, b) => b.rate - a.rate).slice(0, DISPLAY_COUNT),
    [departmentPerformance]
  );

  const belowAvgCount = departmentPerformance.filter((dept) => dept.rate < companyAvg).length;

  return (
    <article className="cpg-card cpg-card--dept cpg-cell--areas">
      <header className="cpg-card__head">
        <div className="cpg-card__title-block">
          <span className="cpg-card__icon" aria-hidden="true">
            <Building2 size={16} />
          </span>
          <div>
            <h3 className="cpg-card__title">Department Performance</h3>
            <p className="cpg-card__subtitle">Ranked by output score</p>
          </div>
        </div>
      </header>

      {belowAvgCount > 0 ? (
        <p className="cpg-dept__insight">
          {belowAvgCount} department{belowAvgCount > 1 ? 's' : ''} below {companyAvg}% company
          average
        </p>
      ) : null}

      <ul className="cpg-dept__list" aria-label="Department performance ranking">
        {ranked.map((dept, index) => {
          const status = getDeptStatus(dept.rate, companyAvg);

          return (
            <li
              key={dept.id}
              className={`cpg-dept__row cpg-dept__row--${status.tone}`}
              aria-label={`${dept.department}: ${dept.rate}%`}
            >
              <span className="cpg-dept__rank">{index + 1}</span>
              <span className="cpg-dept__name">{dept.department}</span>
              <span className="cpg-dept__score">{dept.rate}%</span>
              <div className="cpg-dept__track" aria-hidden="true">
                <span className="cpg-dept__fill" style={{ width: `${dept.rate}%` }} />
              </div>
              <span className={`cpg-dept__status cpg-dept__status--${status.tone}`}>
                {status.label}
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
};

/** @deprecated Use PerformanceDepartmentsPanel */
export const PerformanceAreasPanel = PerformanceDepartmentsPanel;
