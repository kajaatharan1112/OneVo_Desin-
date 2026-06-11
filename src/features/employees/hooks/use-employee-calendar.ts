import { useMemo } from 'react';
import { employeeCalendarData } from '../data/employee-calendar.data';

const TIMELINE_VISIBLE_MAX = 4;
const MEETING_PREP_ITEMS_MAX = 3;
const UPCOMING_VISIBLE_MAX = 3;
const REMINDERS_VISIBLE_MAX = 3;
const FOCUS_SLOTS_VISIBLE_MAX = 3;

export function useEmployeeCalendar() {
  const { summary, nextEvent, todayLoad, availability, timeline, meetingPrep, upcoming, reminders, focusSlots, sync } =
    employeeCalendarData;

  const visibleTimeline = useMemo(() => timeline.slice(0, TIMELINE_VISIBLE_MAX), [timeline]);

  const visibleMeetingPrep = useMemo(
    () => ({
      ...meetingPrep,
      items: meetingPrep.items.slice(0, MEETING_PREP_ITEMS_MAX)
    }),
    [meetingPrep]
  );

  const visibleUpcoming = useMemo(() => upcoming.slice(0, UPCOMING_VISIBLE_MAX), [upcoming]);

  const visibleReminders = useMemo(() => reminders.slice(0, REMINDERS_VISIBLE_MAX), [reminders]);

  const visibleFocusSlots = useMemo(() => focusSlots.slice(0, FOCUS_SLOTS_VISIBLE_MAX), [focusSlots]);

  return {
    summary,
    nextEvent,
    todayLoad,
    availability,
    timeline: visibleTimeline,
    meetingPrep: visibleMeetingPrep,
    upcoming: visibleUpcoming,
    reminders: visibleReminders,
    focusSlots: visibleFocusSlots,
    sync
  };
};
