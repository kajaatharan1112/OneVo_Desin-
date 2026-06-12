import React, { useMemo } from 'react';
import { Building2, TrendingDown, TrendingUp } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

function formatDeltaVsAvg(rate: number, avg: number): string {
  const delta = rate - avg;
  if (delta === 0) {
    return 'At avg';
  }
  return `${delta > 0 ? '+' : ''}${delta}%`;
}

export const ProductivityDeptPanel: React.FC = () => {
  const { departmentProductivity, summary } = ceoDashboardData.productivity;
  const companyAvg = summary.scorePercent;

  const ranked = useMemo(
    () => [...departmentProductivity].sort((a, b) => b.rate - a.rate),
    [departmentProductivity]
  );

  return (
    <article className="eto-widget cpr-panel cpr-cell--dept cpr-dept-board">
      <header className="cpr-panel__head">
        <div className="cpr-panel__title-block">
          <span className="cpr-panel__icon-wrap" aria-hidden="true">
            <Building2 size={16} />
          </span>
          <div className="cpr-panel__titles">
            <h3 className="cpr-panel__title">Department Productivity</h3>
            <p className="cpr-panel__subtitle">Ranked output vs company average</p>
          </div>
        </div>
        <span className="cpr-pill cpr-pill--neutral">{companyAvg}% avg</span>
      </header>

      <p className="cpr-dept-legend">
        <span className="cpr-dept-legend__mark" aria-hidden="true" />
        Company average marker
      </p>

      <div className="cpr-scroll-fade cpr-scroll-fade--dept">
        <ul className="cpr-dept-rank" aria-label="Department productivity ranking">
          {ranked.map((dept, index) => {
            const deltaVsAvg = dept.rate - companyAvg;
            const tone = deltaVsAvg >= 0 ? 'above' : 'below';

            return (
              <li
                key={dept.id}
                className={`cpr-dept-rank__row cpr-dept-rank__row--${tone}`}
                aria-label={`${dept.department}: ${dept.rate}% productivity, ${formatDeltaVsAvg(dept.rate, companyAvg)} vs avg`}
              >
                <span className="cpr-dept-rank__pos" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="cpr-dept-rank__name">{dept.department}</span>
                <span className="cpr-dept-rank__rate">{dept.rate}%</span>
                <div className="cpr-dept-rank__track" aria-hidden="true">
                  <span className="cpr-dept-rank__avg" style={{ left: `${companyAvg}%` }} />
                  <span className="cpr-dept-rank__fill" style={{ width: `${dept.rate}%` }} />
                </div>
                <span
                  className={`cpr-dept-rank__delta${
                    deltaVsAvg < 0
                      ? ' cpr-dept-rank__delta--down'
                      : deltaVsAvg > 0
                        ? ' cpr-dept-rank__delta--up'
                        : ''
                  }`}
                >
                  {deltaVsAvg < 0 ? (
                    <TrendingDown size={11} aria-hidden="true" />
                  ) : deltaVsAvg > 0 ? (
                    <TrendingUp size={11} aria-hidden="true" />
                  ) : null}
                  {formatDeltaVsAvg(dept.rate, companyAvg)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
};
