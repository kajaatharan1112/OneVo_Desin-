import type { EmployeeCalendarData } from '../types/employee-calendar.types';

/** Dabi · Software Developer · Product Engineering · Wed 12 Nov 2025 */
export const employeeCalendarData: EmployeeCalendarData = {
  summary: {
    totalEvents: 4,
    hasConflicts: false,
    nextEventTitle: 'Sprint Review',
    nextEventTime: '1:00 PM'
  },
  nextEvent: {
    title: 'Sprint Review',
    time: '1:00 PM',
    startsIn: '2h 15m',
    project: 'Employee Workspace',
    prepNote: 'Preparation needed before meeting',
    hasAgenda: true,
    hasMeetingLink: true
  },
  todayLoad: {
    events: 4,
    meetingHours: '2h 30m',
    focusBlocks: 1,
    reminders: 1,
    status: 'Balanced'
  },
  availability: {
    hasConflicts: false,
    statusLabel: 'No conflicts today',
    freeSlot: '2:00 PM – 3:00 PM',
    bestFocusSlot: '3:00 PM – 5:00 PM'
  },
  timeline: [
    {
      id: 'tl-1',
      time: '10:30 AM',
      title: 'Team Sync',
      type: 'Meeting',
      status: 'Completed',
      description: 'Daily team alignment'
    },
    {
      id: 'tl-2',
      time: '1:00 PM',
      title: 'Sprint Review',
      type: 'Meeting',
      status: 'Upcoming',
      description: 'Review Employee Dashboard progress',
      action: 'View agenda'
    },
    {
      id: 'tl-3',
      time: '3:00 PM',
      title: 'Focus Block',
      type: 'Focus',
      status: 'Focus time',
      description: 'Assigned work: Leave Approval Flow'
    },
    {
      id: 'tl-4',
      time: '5:00 PM',
      title: 'Submit Weekly Form',
      type: 'Reminder',
      status: 'Pending',
      description: 'Weekly progress form submission',
      action: 'Submit form'
    }
  ],
  meetingPrep: {
    title: 'Sprint Review',
    time: '1:00 PM',
    items: ['Update task estimates', 'Review sprint blockers', 'Add demo notes']
  },
  upcoming: [
    {
      id: 'up-1',
      day: 'Tomorrow',
      title: 'Project Demo',
      note: 'Prepare demo checklist'
    },
    {
      id: 'up-2',
      day: 'Thu',
      title: '1:1 with Manager',
      note: 'Add discussion points'
    },
    {
      id: 'up-3',
      day: 'Fri',
      title: 'Release Checkpoint',
      note: 'Confirm blocker status'
    }
  ],
  reminders: [
    {
      id: 'rem-1',
      title: 'Check pending request updates',
      due: 'Today',
      action: 'Open requests'
    },
    {
      id: 'rem-2',
      title: 'Update task estimates',
      due: 'Tomorrow',
      action: 'Open tasks'
    }
  ],
  focusSlots: [
    {
      id: 'fs-1',
      time: '2:00 PM – 3:00 PM',
      note: 'Good for deep work'
    },
    {
      id: 'fs-2',
      time: '3:00 PM – 5:00 PM',
      note: 'Assigned focus block'
    },
    {
      id: 'fs-3',
      time: 'Tomorrow 9:30 AM – 11:00 AM',
      note: 'Best slot for sprint demo prep'
    }
  ],
  sync: {
    google: 'Connected',
    outlook: 'Not connected',
    lastSynced: '10 min ago',
    note: 'Synced events are read-only'
  }
};
