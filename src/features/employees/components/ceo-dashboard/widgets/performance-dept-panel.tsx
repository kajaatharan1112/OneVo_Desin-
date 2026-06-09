import React, { useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

export const PerformanceDeptPanel: React.FC = () => {
  const { departmentPerformance, summary } = ceoDashboardData.companyPerformance;
  const avgRate = summary.scorePercent;

  const ranked = useMemo(
    () => [...departmentPerformance].sort((a, b) => b.rate - a.rate),
    [departmentPerformance]
  );

  return (
    <article className="cwo-widget cpg-cell--dept">
      <header className="cwo-widget__head">
        <Building2 size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Dept ranking</h4>
        <span className="cwo-widget__tab">{avgRate}% company avg</span>
      </header>
      <ul className="cwo-rank-list">
        {ranked.map((dept, index) => (
          <li key={dept.id} className="cwo-rank-list__item">
            <span className="cwo-rank-list__num" aria-hidden="true">
              {index + 1}
            </span>
            <span className="cwo-rank-list__name">{dept.department}</span>
            <span
              className={`cwo-rank-list__value${dept.rate < avgRate ? ' cwo-rank-list__value--warn' : ''}`}
            >
              {dept.rate}%
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
};
