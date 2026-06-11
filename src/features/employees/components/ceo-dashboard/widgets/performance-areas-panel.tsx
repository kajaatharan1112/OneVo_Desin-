import React, { useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

function getDeptTone(rate: number, avg: number): 'above' | 'below' {
  return rate >= avg ? 'above' : 'below';
}

export const PerformanceDepartmentsPanel: React.FC = () => {
  const { departmentPerformance, summary } = ceoDashboardData.companyPerformance;
  const companyAvg = summary.scorePercent;

  const ranked = useMemo(
    () => [...departmentPerformance].sort((a, b) => b.rate - a.rate),
    [departmentPerformance]
  );

  const topDept = ranked[0];
  const belowAvgCount = ranked.filter((dept) => dept.rate < companyAvg).length;

  return (
    <article className="eto-widget cpg-cell--areas cpg-dept-panel">
      <header className="eto-widget__head">
        <Building2 size={16} aria-hidden="true" />
        <h3 className="eto-widget__title">Department performance</h3>
        <span className="eto-widget__tab">
          {topDept ? `#1 ${topDept.department}` : `${companyAvg}% avg`}
        </span>
      </header>

      {belowAvgCount > 0 ? (
        <p className="cpg-dept-panel__note">
          {belowAvgCount} department{belowAvgCount > 1 ? 's' : ''} below {companyAvg}% company average
        </p>
      ) : null}

      <ul className="cpg-dept-board nexus-scroll-y" aria-label="Department performance leaderboard">
        {ranked.map((dept, index) => (
          <li
            key={dept.id}
            className={`cpg-dept-row cpg-dept-row--${getDeptTone(dept.rate, companyAvg)}`}
          >
            <span className="cpg-dept-row__rank">{index + 1}</span>
            <div className="cpg-dept-row__body">
              <div className="cpg-dept-row__top">
                <span className="cpg-dept-row__name">{dept.department}</span>
                <span className="cpg-dept-row__score">{dept.rate}%</span>
              </div>
              <div className="cpg-dept-row__track" aria-hidden="true">
                <span className="cpg-dept-row__fill" style={{ width: `${dept.rate}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};

/** @deprecated Use PerformanceDepartmentsPanel */
export const PerformanceAreasPanel = PerformanceDepartmentsPanel;
