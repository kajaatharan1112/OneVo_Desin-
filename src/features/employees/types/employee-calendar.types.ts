export type EventType = 'Meeting' | 'Focus' | 'Reminder';

export type TimelineEventStatus = 'Completed' | 'Upcoming' | 'Focus time' | 'Pending';

export type WorkloadStatus = 'Balanced' | 'Heavy' | 'Light';

export type SyncConnectionStatus = 'Connected' | 'Not connected';

export interface CalendarSummary {
  totalEvents: number;
  hasConflicts: boolean;
  nextEventTitle: string;
  nextEventTime: string;
}

export interface CalendarNextEvent {
  title: string;
  time: string;
  startsIn: string;
  project: string;
  prepNote: string;
  hasAgenda: boolean;
  hasMeetingLink: boolean;
}

export interface CalendarTodayLoad {
  events: number;
  meetingHours: string;
  focusBlocks: number;
  reminders: number;
  status: WorkloadStatus;
}

export interface CalendarAvailability {
  hasConflicts: boolean;
  statusLabel: string;
  freeSlot: string;
  bestFocusSlot: string;
}

export interface CalendarTimelineEvent {
  id: string;
  time: string;
  title: string;
  type: EventType;
  status: TimelineEventStatus;
  description: string;
  action?: string;
}

export interface CalendarMeetingPrep {
  title: string;
  time: string;
  items: string[];
}

export interface CalendarUpcomingEvent {
  id: string;
  day: string;
  title: string;
  note: string;
}

export interface CalendarReminder {
  id: string;
  title: string;
  due: string;
  action: string;
}

export interface CalendarFocusSlot {
  id: string;
  time: string;
  note: string;
}

export interface CalendarSyncStatus {
  google: SyncConnectionStatus;
  outlook: SyncConnectionStatus;
  lastSynced: string;
  note: string;
}

export interface EmployeeCalendarData {
  summary: CalendarSummary;
  nextEvent: CalendarNextEvent;
  todayLoad: CalendarTodayLoad;
  availability: CalendarAvailability;
  timeline: CalendarTimelineEvent[];
  meetingPrep: CalendarMeetingPrep;
  upcoming: CalendarUpcomingEvent[];
  reminders: CalendarReminder[];
  focusSlots: CalendarFocusSlot[];
  sync: CalendarSyncStatus;
}
