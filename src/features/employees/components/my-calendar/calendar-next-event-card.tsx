import React from 'react';
import { Video } from 'lucide-react';
import type { CalendarNextEvent } from '../../types/employee-calendar.types';

interface CalendarNextEventCardProps {
  event: CalendarNextEvent;
  className?: string;
}

export const CalendarNextEventCard: React.FC<CalendarNextEventCardProps> = ({
  event,
  className = ''
}) => {
  return (
    <section
      className={`emc-hero-banner emc-next-event-hero ${className}`.trim()}
      aria-label="Next event"
    >
      <div className="emc-hero-banner__content">
        <span className="emc-hero-banner__icon" aria-hidden="true">
          <Video size={16} />
        </span>
        <div className="emc-hero-banner__copy">
          <span className="emc-hero-banner__label">Next up · in {event.startsIn}</span>
          <p className="emc-hero-banner__title">{event.title}</p>
          <p className="emc-hero-banner__helper">
            {event.time} · {event.project}
          </p>
        </div>
      </div>
      <div className="emc-hero-banner__actions">
        {event.hasMeetingLink ? (
          <button type="button" className="emc-btn emc-btn--primary emc-btn--compact">
            Join meeting
          </button>
        ) : null}
        {event.hasAgenda ? (
          <button type="button" className="emc-btn emc-btn--ghost emc-btn--compact">
            View agenda
          </button>
        ) : null}
      </div>
    </section>
  );
};
