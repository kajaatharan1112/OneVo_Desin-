import React from 'react';
import { ScheduleMeetingListPanel } from './widgets/schedule-meeting-list-panel';
import { ScheduleTimeBreakdownPanel } from './widgets/schedule-time-breakdown-panel';
import { ScheduleTimelinePanel } from './widgets/schedule-timeline-panel';

export const CeoScheduleDashboard: React.FC = () => {
  return (
    <div className="ceo-schedule-overview" aria-label="Today's schedule">
      <ScheduleTimelinePanel />
      <ScheduleMeetingListPanel />
      <ScheduleTimeBreakdownPanel />
    </div>
  );
};
