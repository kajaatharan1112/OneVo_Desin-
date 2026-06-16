import React from 'react';
import { Users } from 'lucide-react';
import { executiveDashboard } from '../../../data/executive-dashboard.data';
import { overallAttendance } from '../../../data/tenant-today-productivity.data';

export const TotalEmployeeAttendanceTtoPanel: React.FC = () => {
  const { percent, present, total } = overallAttendance;
  const title = executiveDashboard.attendanceBreakdown.title;

  return (
    <article className="tto-total-emp tto-cell--total-emp" aria-label={title}>
      <div className="tto-total-emp__container">
        <div className="tto-total-emp__header">
          <div className="tto-total-emp__title-row">
            <Users size={14} className="tto-total-emp__icon" aria-hidden="true" />
            <span className="tto-total-emp__title">{title}</span>
          </div>
          <div className="tto-total-emp__stats">
            <span className="tto-total-emp__count">{present}</span>
            <span className="tto-total-emp__sep">/</span>
            <span className="tto-total-emp__total">{total} employees</span>
            <span className="tto-total-emp__rate">({percent}%)</span>
          </div>
        </div>
        <div
          className="tto-total-emp__bar-track"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${percent}% present`}
        >
          <div className="tto-total-emp__bar-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </article>
  );
};
