import React from 'react';
import { Building2 } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

export const WorkforceDepartmentAttendance: React.FC = () => {
  const { departmentAttendance } = ceoDashboardData.workforce;
  const avgRate = Math.round(
    departmentAttendance.reduce((sum, dept) => sum + dept.rate, 0) / departmentAttendance.length
  );

  return (
    <article className="cwo-widget cwo-cell--dept">
      <header className="cwo-widget__head">
        <Building2 size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Dept attendance</h4>
        <span className="cwo-widget__tab">{avgRate}% avg</span>
      </header>
      <ul className="cwo-meter-list">
        {departmentAttendance.map((dept) => (
          <li key={dept.id} className="cwo-meter-list__item">
            <div className="cwo-meter-list__top">
              <span className="cwo-meter-list__title">{dept.department}</span>
              <span
                className={`cwo-meter-list__badge${dept.rate < 75 ? ' cwo-meter-list__badge--warn' : ''}`}
              >
                {dept.rate}%
              </span>
            </div>
            <div className="cwo-meter-list__bar" aria-hidden="true">
              <span
                className={`cwo-meter-list__fill${dept.rate < 75 ? ' cwo-meter-list__fill--warn' : ''}`}
                style={{ width: `${dept.rate}%` }}
              />
            </div>
            <span className="cwo-meter-list__meta">
              {dept.present} present · {dept.onLeave} on leave
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
};
