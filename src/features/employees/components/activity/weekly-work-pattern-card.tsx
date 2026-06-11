import React from 'react';
import { CalendarRange } from 'lucide-react';
import { WeeklyStatusBadge } from './activity-status-badge';
import type { WeeklyPatternDay } from '../../types/employee-activity.types';

interface WeeklyWorkPatternCardProps {
  days: WeeklyPatternDay[];
  insight: string;
  className?: string;
}

export const WeeklyWorkPatternCard: React.FC<WeeklyWorkPatternCardProps> = ({
  days,
  insight,
  className = ''
}) => {
  return (
    <article
      className={`eac-widget eac-weekly-pattern ${className}`.trim()}
      aria-label="Weekly work pattern"
    >
      <header className="eac-widget__head">
        <CalendarRange size={15} aria-hidden="true" />
        <h3 className="eac-widget__title">Weekly Work Pattern</h3>
      </header>
      <div className="eac-widget__scroll">
        <ul className="eac-weekly-pattern__list">
        {days.map((day) => (
          <li key={day.day} className="eac-weekly-pattern__item">
            <span className="eac-weekly-pattern__day">{day.day}</span>
            <WeeklyStatusBadge status={day.status} />
          </li>
        ))}
        </ul>
      </div>
      <p className="eac-weekly-pattern__insight">{insight}</p>
    </article>
  );
};
