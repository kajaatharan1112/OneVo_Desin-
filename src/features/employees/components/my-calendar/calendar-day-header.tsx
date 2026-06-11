import React from 'react';
import type {
  CalendarAvailability,
  CalendarNextEvent,
  CalendarTodayLoad
} from '../../types/employee-calendar.types';
import { CalendarDayMetricsStrip } from './calendar-day-metrics-strip';
import { CalendarNextEventCard } from './calendar-next-event-card';

interface CalendarDayHeaderProps {
  nextEvent: CalendarNextEvent;
  load: CalendarTodayLoad;
  availability: CalendarAvailability;
  className?: string;
}

export const CalendarDayHeader: React.FC<CalendarDayHeaderProps> = ({
  nextEvent,
  load,
  availability,
  className = ''
}) => {
  return (
    <div className={`emc-day-header ${className}`.trim()}>
      <CalendarNextEventCard event={nextEvent} />
      <CalendarDayMetricsStrip load={load} availability={availability} />
    </div>
  );
};
