import React from 'react';
import { CalendarCheck2, Clock3, Gauge, Sparkles } from 'lucide-react';
import type { CalendarAvailability, CalendarTodayLoad, WorkloadStatus } from '../../types/employee-calendar.types';

interface CalendarDayMetricsStripProps {
  load: CalendarTodayLoad;
  availability: CalendarAvailability;
  className?: string;
}

const LOAD_SLUG: Record<WorkloadStatus, string> = {
  Balanced: 'balanced',
  Heavy: 'heavy',
  Light: 'light'
};

export const CalendarDayMetricsStrip: React.FC<CalendarDayMetricsStripProps> = ({
  load,
  availability,
  className = ''
}) => {
  return (
    <section
      className={`emc-panel emc-metrics-strip ${className}`.trim()}
      aria-label="Today schedule overview"
    >
      <div className="emc-metric emc-metric--info">
        <span className="emc-metric__icon" aria-hidden="true">
          <CalendarCheck2 size={13} />
        </span>
        <div className="emc-metric__copy">
          <span className="emc-metric__value">{load.events}</span>
          <span className="emc-metric__label">Events today</span>
        </div>
      </div>
      <div className="emc-metric emc-metric--info">
        <span className="emc-metric__icon" aria-hidden="true">
          <Clock3 size={13} />
        </span>
        <div className="emc-metric__copy">
          <span className="emc-metric__value">{load.meetingHours}</span>
          <span className="emc-metric__label">In meetings</span>
        </div>
      </div>
      <div className={`emc-metric emc-metric--load emc-metric--${LOAD_SLUG[load.status]}`}>
        <span className="emc-metric__icon" aria-hidden="true">
          <Gauge size={13} />
        </span>
        <div className="emc-metric__copy">
          <span className="emc-metric__value">{load.status}</span>
          <span className="emc-metric__label">Day load</span>
        </div>
      </div>
      <div
        className={`emc-metric emc-metric--emphasis emc-metric--${availability.hasConflicts ? 'warn' : 'ok'}`}
      >
        <span className="emc-metric__icon" aria-hidden="true">
          <Sparkles size={13} />
        </span>
        <div className="emc-metric__copy">
          <span className="emc-metric__value">{availability.freeSlot}</span>
          <span className="emc-metric__label">{availability.statusLabel}</span>
        </div>
      </div>
    </section>
  );
};
