import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import type { WorkforceRiskLevel } from '../data/ceo-dashboard.data';

const MAX_CASES = 4;

const riskBadgeClass: Record<WorkforceRiskLevel, string> = {
  healthy: 'cwf-riskleave__badge--healthy',
  warning: 'cwf-riskleave__badge--warning',
  critical: 'cwf-riskleave__badge--critical'
};

const riskCardClass: Record<WorkforceRiskLevel, string> = {
  healthy: 'cwf-riskleave__dept-card--healthy',
  warning: 'cwf-riskleave__dept-card--warning',
  critical: 'cwf-riskleave__dept-card--critical'
};

const riskFillClass: Record<WorkforceRiskLevel, string> = {
  healthy: 'cwf-riskleave__bar-fill--healthy',
  warning: 'cwf-riskleave__bar-fill--warning',
  critical: 'cwf-riskleave__bar-fill--critical'
};

const riskLabel: Record<WorkforceRiskLevel, string> = {
  healthy: 'Strong',
  warning: 'Watch',
  critical: 'Risk'
};

export const WorkforceRiskLeavePanel: React.FC = () => {
  const { departmentRisk, leaveImpact, keyLeaveCases } = ceoDashboardData.workforce;
  const cases = keyLeaveCases.slice(0, MAX_CASES);
  const criticalCount = departmentRisk.filter((dept) => dept.risk === 'critical').length;

  return (
    <article className="eto-widget cwo-cell--riskLeave cwf-panel cwf-panel--riskleave cwf-riskleave">
      <header className="cwf-riskleave__head">
        <div className="cwf-riskleave__title-block">
          <span className="cwf-riskleave__icon-wrap" aria-hidden="true">
            <ShieldAlert size={16} />
          </span>
          <div className="cwf-riskleave__titles">
            <h3 className="cwf-riskleave__title">Risk &amp; Leave Overview</h3>
            <p className="cwf-riskleave__subtitle">Department risk and leave impact</p>
          </div>
        </div>
        {criticalCount > 0 ? (
          <span className="cwf-riskleave__head-badge cwf-riskleave__head-badge--critical">
            {criticalCount} at risk
          </span>
        ) : null}
      </header>

      <div className="cwf-riskleave__grid nexus-scroll-y">
        <section className="cwf-riskleave__col" aria-label="Department attendance risk">
          <span className="cwf-riskleave__section-label">Department risk</span>
          <div className="cwf-riskleave__dept-cards">
            {departmentRisk.map((dept) => (
              <article
                key={dept.id}
                className={`cwf-riskleave__dept-card ${riskCardClass[dept.risk]}`}
              >
                <div className="cwf-riskleave__dept-card-head">
                  <span className="cwf-riskleave__dept-name">{dept.department}</span>
                  <span className={`cwf-riskleave__badge ${riskBadgeClass[dept.risk]}`}>
                    {riskLabel[dept.risk]}
                  </span>
                </div>
                <div className="cwf-riskleave__dept-rate-row">
                  <span className="cwf-riskleave__dept-rate">{dept.presentRate}%</span>
                  <span className="cwf-riskleave__dept-meta">{dept.onLeave} on leave</span>
                </div>
                <div className="cwf-riskleave__bar" aria-hidden="true">
                  <span
                    className={`cwf-riskleave__bar-fill ${riskFillClass[dept.risk]}`}
                    style={{ width: `${dept.presentRate}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="cwf-riskleave__col cwf-riskleave__col--leave" aria-label="Leave impact">
          <span className="cwf-riskleave__section-label">Leave impact</span>
          <div className="cwf-riskleave__impact-grid">
            {leaveImpact.items.map((item) => (
              <article key={item.id} className="cwf-riskleave__impact-card">
                <span className="cwf-riskleave__impact-label">{item.label}</span>
                <span className="cwf-riskleave__impact-count">{item.count}</span>
              </article>
            ))}
          </div>

          <p className="cwf-riskleave__insight">{leaveImpact.insight}</p>

          <span className="cwf-riskleave__section-label">Key leave cases</span>
          <ul className="cwf-riskleave__case-list" aria-label="Key leave cases">
            {cases.map((item) => (
              <li key={item.id} className="cwf-riskleave__case-card">
                <div className="cwf-riskleave__case-copy">
                  <span className="cwf-riskleave__case-name">{item.name}</span>
                  <span className="cwf-riskleave__case-meta">
                    {item.department} · {item.leaveType}
                  </span>
                </div>
                <span className="cwf-riskleave__case-duration">{item.duration}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
};
