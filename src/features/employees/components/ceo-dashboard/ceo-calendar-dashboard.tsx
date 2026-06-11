import React from 'react';
import { CalendarWeekPanel } from './widgets/calendar-week-panel';
import { PrioritiesMeetingsPanel } from './widgets/priorities-meetings-panel';

export const CeoCalendarDashboard: React.FC = () => {
  return (
    <div className="ceo-calendar-overview" aria-label="Calendar and schedule">
      <CalendarWeekPanel />
      <PrioritiesMeetingsPanel cellClass="mprio-cell--calendar-schedule" />
    </div>
  );
};
