export type CalendarViewMode = 'day' | 'week' | 'month';
export type CalendarEventType = 'meeting' | 'holiday' | 'leave' | 'shift' | 'reminder';
export type CalendarEventStatus = 'confirmed' | 'pending' | 'needs-response';
export type CalendarEventSource = 'company' | 'personal' | 'schedule' | 'leave';
export type SyncConnectionStatus = 'connected' | 'disconnected';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  start?: string;
  end?: string;
  type: CalendarEventType;
  status: CalendarEventStatus;
  source: CalendarEventSource;
  allDay?: boolean;
  needsResponse?: boolean;
  note?: string;
}

export interface CalendarSyncStatus {
  google: SyncConnectionStatus;
  outlook: SyncConnectionStatus;
  lastSynced: string;
}

export interface EmployeeCalendarData {
  currentPeriod: string;
  selectedDate: string;
  viewMode: CalendarViewMode;
  events: CalendarEvent[];
  syncStatus: CalendarSyncStatus;
}
