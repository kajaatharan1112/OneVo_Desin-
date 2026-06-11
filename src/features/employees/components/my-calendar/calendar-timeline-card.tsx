import React from 'react';
import { Clock } from 'lucide-react';
import { EventStatusBadge } from './event-status-badge';
import type { CalendarTimelineEvent, TimelineEventStatus } from '../../types/employee-calendar.types';

interface CalendarTimelineCardProps {
  events: CalendarTimelineEvent[];
  className?: string;
}

const STATUS_SLUG: Record<TimelineEventStatus, string> = {
  Completed: 'completed',
  Upcoming: 'upcoming',
  'Focus time': 'focus-time',
  Pending: 'pending'
};

export const CalendarTimelineCard: React.FC<CalendarTimelineCardProps> = ({
  events,
  className = ''
}) => {
  return (
    <article
      className={`emc-widget emc-timeline ${className}`.trim()}
      aria-label="Today's timeline"
    >
      <header className="emc-widget__head">
        <Clock size={15} aria-hidden="true" />
        <h3 className="emc-widget__title">Today&apos;s Timeline</h3>
      </header>
      <div className="emc-widget__scroll">
        <ol className="emc-timeline__list">
          {events.map((event, index) => (
            <li
              key={event.id}
              className={`emc-timeline__item emc-timeline__item--${STATUS_SLUG[event.status]}`}
            >
              <div className="emc-timeline__rail" aria-hidden="true">
                <span className="emc-timeline__dot" />
                {index < events.length - 1 ? <span className="emc-timeline__line" /> : null}
              </div>
              <div className="emc-timeline__body">
                <div className="emc-timeline__row">
                  <time className="emc-timeline__time" dateTime={event.time}>
                    {event.time}
                  </time>
                  <EventStatusBadge status={event.status} />
                </div>
                <span className="emc-timeline__title">{event.title}</span>
                <span className="emc-timeline__desc">{event.description}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
};
