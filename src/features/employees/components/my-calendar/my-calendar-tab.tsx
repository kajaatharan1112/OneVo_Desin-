import React from 'react';
import { useEmployeeCalendar } from '../../hooks/use-employee-calendar';
import { CalendarDayHeader } from './calendar-day-header';
import { CalendarFocusSlotsCard } from './calendar-focus-slots-card';
import { CalendarRemindersCard } from './calendar-reminders-card';
import { CalendarTimelineCard } from './calendar-timeline-card';
import { CalendarUpcomingEventsCard } from './calendar-upcoming-events-card';
import { MeetingPrepCard } from './meeting-prep-card';

export const MyCalendarTab: React.FC = () => {
  const {
    nextEvent,
    todayLoad,
    availability,
    timeline,
    meetingPrep,
    upcoming,
    reminders,
    focusSlots,
    sync
  } = useEmployeeCalendar();

  return (
    <div
      className="employee-my-calendar employee-my-calendar-grid"
      aria-label="My calendar planner"
    >
      <CalendarDayHeader
        nextEvent={nextEvent}
        load={todayLoad}
        availability={availability}
        className="emc-span-12"
      />
      <CalendarTimelineCard events={timeline} className="emc-span-7" />
      <MeetingPrepCard prep={meetingPrep} className="emc-span-5" />
      <CalendarUpcomingEventsCard events={upcoming} className="emc-span-4" />
      <CalendarRemindersCard reminders={reminders} className="emc-span-4" />
      <CalendarFocusSlotsCard
        slots={focusSlots}
        bestFocusSlot={availability.bestFocusSlot}
        sync={sync}
        className="emc-span-4"
      />
    </div>
  );
};
