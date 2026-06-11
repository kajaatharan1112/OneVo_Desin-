import React from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { overallAttendance } from '../../../data/tenant-today-productivity.data';

export const TotalEmployeeAttendancePanel: React.FC = () => {
  const { percent, present, total, changeVsYesterday } = overallAttendance;

  return (
    <article className="ceo-attendance" aria-label="Overall Today Attendance">
      <div className="ceo-attendance__row">
        <div className="ceo-attendance__left">
          <Users size={14} className="ceo-attendance__icon" aria-hidden="true" />
          <span className="ceo-attendance__title">Overall Today Attendance</span>
        </div>
        <div className="ceo-attendance__right">
          <span className="ceo-attendance__percent">
            <strong>{percent}%</strong>
            <small>PRESENT</small>
          </span>
          <span className="ceo-attendance__count">
            {present} / {total} Employees
          </span>
          <span className="ceo-attendance__trend">
            <TrendingUp size={12} aria-hidden="true" />
            +{changeVsYesterday}% vs yesterday
          </span>
        </div>
      </div>
      <div
        className="ceo-attendance__bar-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${percent}% present`}
      >
        <div className="ceo-attendance__bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </article>
  );
};
