import React from 'react';
import { CalendarOff } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

const shortLeaveLabels: Record<string, string> = {
  annual: 'Annual',
  medical: 'Medical',
  casual: 'Casual',
  half: 'Half day'
};

export const WorkforceLeaveBreakdown: React.FC = () => {
  const { leaveBreakdown } = ceoDashboardData.workforce;
  const totalOnLeave = leaveBreakdown.reduce((sum, item) => sum + item.count, 0);

  return (
    <article className="cwo-widget cwo-cell--leave">
      <header className="cwo-widget__head">
        <CalendarOff size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Leave today</h4>
        <span className="cwo-widget__tab">{totalOnLeave} total</span>
      </header>
      <div className="cwo-stack-bar" role="img" aria-label="Leave type distribution">
        {leaveBreakdown.map((item, index) => (
          <span
            key={item.id}
            className={`cwo-stack-bar__seg cwo-stack-bar__seg--tone-${index + 1}`}
            style={{ width: `${item.percent}%` }}
            title={`${shortLeaveLabels[item.id] ?? item.label}: ${item.count}`}
          />
        ))}
      </div>
      <ul className="cwo-mini-legend cwo-mini-legend--leave">
        {leaveBreakdown.map((item, index) => (
          <li key={item.id} className="cwo-mini-legend__item">
            <span
              className={`cwo-mini-legend__dot cwo-mini-legend__dot--tone-${index + 1}`}
              aria-hidden="true"
            />
            <span className="cwo-mini-legend__label">
              {shortLeaveLabels[item.id] ?? item.label}
            </span>
            <span className="cwo-mini-legend__value">{item.count}</span>
          </li>
        ))}
      </ul>
    </article>
  );
};
