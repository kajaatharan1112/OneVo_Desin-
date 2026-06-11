import React, { useMemo } from 'react';
import { Building2, TrendingDown, TrendingUp } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

function formatDeltaVsAvg(rate: number, avg: number): string {
  const delta = rate - avg;
  if (delta === 0) {
    return 'At avg';
  }
  return `${delta > 0 ? '+' : ''}${delta}% vs avg`;
}

function getDeptTone(rate: number, avg: number, rank: number): 'lead' | 'strong' | 'watch' {
  if (rank === 0) {
    return 'lead';
  }
  if (rate >= avg) {
    return 'strong';
  }
  return 'watch';
}

export const ProductivityDeptPanel: React.FC = () => {
  const { departmentProductivity, summary } = ceoDashboardData.productivity;
  const companyAvg = summary.scorePercent;

  const ranked = useMemo(
    () => [...departmentProductivity].sort((a, b) => b.rate - a.rate),
    [departmentProductivity]
  );

  const belowAvgCount = ranked.filter((dept) => dept.rate < companyAvg).length;
  const leader = ranked[0];
  const trailer = ranked[ranked.length - 1];

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

      <div className="cpr-dept-kpis" aria-label="Department productivity summary">
        <div className="cpr-dept-kpis__item cpr-dept-kpis__item--lead">
          <span className="cpr-dept-kpis__value">{leader?.rate ?? 0}%</span>
          <span className="cpr-dept-kpis__label">{leader?.department ?? '—'} leads</span>
        </div>
        <div className="cpr-dept-kpis__item">
          <span className="cpr-dept-kpis__value">{belowAvgCount}</span>
          <span className="cpr-dept-kpis__label">dept below avg</span>
        </div>
      </div>

      <p className="cpr-dept-legend">
        <span className="cpr-dept-legend__mark" aria-hidden="true" />
        Company average {companyAvg}%
      </p>

      <ul className="cpr-dept-rank" aria-label="Department productivity ranking">
        {ranked.map((dept, index) => {
          const deltaVsAvg = dept.rate - companyAvg;
          const tone = getDeptTone(dept.rate, companyAvg, index);

          return (
            <li
              key={dept.id}
              className={`cpr-dept-rank__row cpr-dept-rank__row--${tone}`}
              aria-label={`${dept.department}: ${dept.rate}% productivity, ${formatDeltaVsAvg(dept.rate, companyAvg)}`}
            >
              <span className="cpr-dept-rank__pos" aria-hidden="true">
                {index + 1}
              </span>
              <div className="cpr-dept-rank__main">
                <div className="cpr-dept-rank__top">
                  <span className="cpr-dept-rank__name">{dept.department}</span>
                  <span className="cpr-dept-rank__rate">{dept.rate}%</span>
                </div>
                <div className="cpr-dept-rank__track" aria-hidden="true">
                  <span className="cpr-dept-rank__avg" style={{ left: `${companyAvg}%` }} />
                  <span className="cpr-dept-rank__fill" style={{ width: `${dept.rate}%` }} />
                </div>
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
                  <TrendingDown size={10} aria-hidden="true" />
                ) : deltaVsAvg > 0 ? (
                  <TrendingUp size={10} aria-hidden="true" />
                ) : null}
                {formatDeltaVsAvg(dept.rate, companyAvg)}
              </span>
            </li>
          );
        })}
      </ul>

      {trailer && trailer.rate < companyAvg ? (
        <footer className="cpr-dept-board__foot">
          <span>
            {trailer.department} trails by {companyAvg - trailer.rate} pts
          </span>
        </footer>
      ) : null}
    </article>
  );
};
