import type { LeaveTypeKey } from '../components/my-calendar/new-event-wizard.utils';

export type CalendarViewMode = 'day' | 'week' | 'month' | 'agenda';
export type CalendarEventType = 'meeting' | 'holiday' | 'leave' | 'shift' | 'reminder' | 'training' | 'out-of-office' | 'company-event';
export type CalendarEventCategory = 'hr' | 'project' | 'training' | 'review' | 'client' | 'compliance' | 'management';
export type CalendarEventPriority = 'low' | 'medium' | 'high' | 'critical';
export type CalendarEventStatus = 'confirmed' | 'pending' | 'needs-response' | 'rejected';
export type CalendarEventSource = 'company' | 'personal' | 'schedule' | 'leave';
export type SyncConnectionStatus = 'connected' | 'disconnected';

/** Whose calendar an event belongs to. 'Combined' is a view-time union, not a stored scope. */
export type CalendarScope = 'my' | 'team' | 'department' | 'organization';
export type CalendarScopeFilter = CalendarScope | 'combined';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  start?: string;
  end?: string;
  type: CalendarEventType;
  status: CalendarEventStatus;
  source: CalendarEventSource;
  scope: CalendarScope;
  ownerName?: string;
  allDay?: boolean;
  needsResponse?: boolean;
  note?: string;
  location?: string;
  attendees?: string[];
  reminderMinutesBefore?: number;
  attendeeRsvp?: Record<string, 'pending' | 'accepted' | 'declined' | 'tentative'>;
  category?: CalendarEventCategory;
  priority?: CalendarEventPriority;
  leaveType?: LeaveTypeKey;
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
