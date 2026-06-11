import React from 'react';
import { CalendarDays } from 'lucide-react';
import type { CalendarUpcomingEvent } from '../../types/employee-calendar.types';

interface CalendarUpcomingEventsCardProps {
  events: CalendarUpcomingEvent[];
  className?: string;
}

export const CalendarUpcomingEventsCard: React.FC<CalendarUpcomingEventsCardProps> = ({
  events,
  className = ''
}) => {
  return (
    <article
      className={`emc-widget emc-upcoming ${className}`.trim()}
      aria-label="Upcoming events"
    >
      <header className="emc-widget__head">
        <CalendarDays size={15} aria-hidden="true" />
        <h3 className="emc-widget__title">Upcoming Events</h3>
      </header>
      <ul className="emc-upcoming__list">
        {events.map((event) => (
          <li key={event.id} className="emc-upcoming__item">
            <span className="emc-upcoming__day">{event.day}</span>
            <div className="emc-upcoming__copy">
              <span className="emc-upcoming__title">{event.title}</span>
              <span className="emc-upcoming__note">{event.note}</span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};
