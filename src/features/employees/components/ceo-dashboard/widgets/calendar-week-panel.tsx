import React from 'react';
import { CalendarRange } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

export const CalendarWeekPanel: React.FC = () => {
  const { dateLabel, calendarWeek } = ceoDashboardData.schedule;

  return (
    <article className="eto-widget ceo-calendar-week mprio-cell--calendar-week">
      <header className="eto-widget__head">
        <CalendarRange size={16} aria-hidden="true" />
        <h3 className="eto-widget__title">This Week</h3>
        <span className="eto-widget__tab">Jun 2026</span>
      </header>

      <p className="ceo-calendar-week__date">{dateLabel}</p>

      <ul className="ceo-calendar-week__days" aria-label="Week overview">
        {calendarWeek.map((day) => (
          <li
            key={day.id}
            className={`ceo-calendar-week__day${day.isToday ? ' ceo-calendar-week__day--today' : ''}`}
          >
            <span className="ceo-calendar-week__day-label">{day.label}</span>
            <span className="ceo-calendar-week__day-date">{day.date}</span>
            <span className="ceo-calendar-week__day-meta">
              {day.meetings > 0 ? `${day.meetings} mtg` : '—'}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
};
