import React from 'react';
import { Users } from 'lucide-react';
import { onSiteWorkforce, remoteWorkforce } from '../../../data/tenant-today-productivity.data';

export const TotalEmployeeAttendancePanel: React.FC = () => {
  const totalEmployees = onSiteWorkforce.total + remoteWorkforce.total;
  const totalAttendance = onSiteWorkforce.attendedToday + remoteWorkforce.attendedToday;
  const attendanceRate = Math.round((totalAttendance / totalEmployees) * 100);

  return (
    <article className="tto-widget tto-total-emp tto-cell--total-emp" aria-label="Overall Today Attendance">
      <div className="tto-total-emp__container">
        <div className="tto-total-emp__header">
          <div className="tto-total-emp__title-row">
            <Users size={14} className="tto-total-emp__icon" aria-hidden="true" />
            <span className="tto-total-emp__title">Overall Today Attendance</span>
          </div>
          <div className="tto-total-emp__stats">
            <span className="tto-total-emp__count">{totalAttendance}</span>
            <span className="tto-total-emp__sep">/</span>
            <span className="tto-total-emp__total">{totalEmployees} employees</span>
            <span className="tto-total-emp__rate">({attendanceRate}%)</span>
          </div>
        </div>
        <div className="tto-total-emp__bar-track" role="progressbar" aria-valuenow={attendanceRate} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="tto-total-emp__bar-fill"
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
      </div>
    </article>
  );
};
