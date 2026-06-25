import type {
  CalendarEvent,
  CalendarEventType,
  CalendarEventStatus,
  CalendarEventSource,
  CalendarEventCategory,
  CalendarEventPriority,
} from '../../types/employee-calendar.types';

export type NewEventType = 'leave' | 'meeting' | 'company-event' | 'training' | 'holiday';
export type RsvpStatus = 'pending' | 'accepted' | 'declined' | 'tentative';
export type LeaveTypeKey = 'Annual' | 'Sick' | 'Casual';

export interface TypeFieldConfig {
  showCategoryPriority: boolean;
  showLeaveType: boolean;
  allowTimedSchedule: boolean;
  locationLabel: string | null;
  notesLabel: string | null;
  showAttendees: boolean;
  showReminder: boolean;
  showRecurring: boolean;
}

export const TYPE_FIELD_CONFIG: Record<NewEventType, TypeFieldConfig> = {
  meeting: {
    showCategoryPriority: true, showLeaveType: false, allowTimedSchedule: true,
    locationLabel: 'Meeting link / Room', notesLabel: 'Agenda',
    showAttendees: true, showReminder: true, showRecurring: true,
  },
  training: {
    showCategoryPriority: true, showLeaveType: false, allowTimedSchedule: true,
    locationLabel: 'Location', notesLabel: 'Notes',
    showAttendees: true, showReminder: true, showRecurring: true,
  },
  'company-event': {
    showCategoryPriority: false, showLeaveType: false, allowTimedSchedule: true,
    locationLabel: 'Location', notesLabel: 'Notes',
    showAttendees: false, showReminder: false, showRecurring: false,
  },
  holiday: {
    showCategoryPriority: false, showLeaveType: false, allowTimedSchedule: false,
    locationLabel: null, notesLabel: null,
    showAttendees: false, showReminder: false, showRecurring: false,
  },
  leave: {
    showCategoryPriority: false, showLeaveType: true, allowTimedSchedule: false,
    locationLabel: null, notesLabel: 'Reason',
    showAttendees: false, showReminder: false, showRecurring: false,
  },
};

export interface NewEventFormState {
  title: string;
  type: NewEventType;
  category: CalendarEventCategory | '';
  priority: CalendarEventPriority;
  leaveType: LeaveTypeKey;
  allDay: boolean;
  date: string;
  endDate: string;
  start: string;
  end: string;
  location: string;
  notes: string;
  attendees: AttendeeRef[];
  reminderMinutesBefore: number;
  recurring: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  occurrences: number;
}

export const EMPTY_NEW_EVENT_FORM: NewEventFormState = {
  title: '',
  type: 'leave',
  category: '',
  priority: 'medium',
  leaveType: 'Annual',
  allDay: true,
  date: '',
  endDate: '',
  start: '09:00',
  end: '10:00',
  location: '',
  notes: '',
  attendees: [],
  reminderMinutesBefore: 0,
  recurring: false,
  frequency: 'weekly',
  occurrences: 8,
};

export interface DirectoryPerson {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export const CALENDAR_DIRECTORY: DirectoryPerson[] = [
  { id: 'd-1', name: 'Priya Nair', role: 'Product Manager', avatar: 'PN' },
  { id: 'd-2', name: 'Arun Kumar', role: 'Backend Developer', avatar: 'AK' },
  { id: 'd-3', name: 'Sara Lee', role: 'UX Designer', avatar: 'SL' },
  { id: 'd-4', name: 'Marcus Chen', role: 'Chief Executive Officer', avatar: 'MC' },
  { id: 'd-5', name: 'Dana Brooks', role: 'Manager', avatar: 'DB' },
  { id: 'd-6', name: 'Alexander Pierce', role: 'Back End Developer', avatar: 'AP' },
  { id: 'd-7', name: 'Riya Sharma', role: 'QA Engineer', avatar: 'RS' },
  { id: 'd-8', name: 'James Wilson', role: 'DevOps Engineer', avatar: 'JW' },
  { id: 'd-9', name: 'Meera Iyer', role: 'HR Business Partner', avatar: 'MI' },
  { id: 'd-10', name: 'Tom Becker', role: 'Sales Lead', avatar: 'TB' },
  { id: 'd-11', name: 'Lakshmi Rao', role: 'Finance Analyst', avatar: 'LR' },
  { id: 'd-12', name: 'Carlos Diaz', role: 'Frontend Developer', avatar: 'CD' },
];

export type AttendeeRef =
  | { kind: 'user'; id: string; name: string; role: string }
  | { kind: 'external'; email: string };

export function attendeeKey(a: AttendeeRef): string {
  return a.kind === 'user' ? a.name : a.email;
}

const TYPE_DEFAULT_DURATION_MINUTES: Record<NewEventType, number> = {
  leave: 60,
  meeting: 30,
  'company-event': 60,
  training: 60,
  holiday: 60,
};

export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const wrapped = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
  const hh = Math.floor(wrapped / 60);
  const mm = wrapped % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function getDefaultEndTime(start: string, type: NewEventType): string {
  return addMinutesToTime(start, TYPE_DEFAULT_DURATION_MINUTES[type]);
}

const CONFLICT_TYPES: CalendarEventType[] = ['shift', 'meeting', 'leave', 'holiday'];

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function buildOccurrenceDates(form: NewEventFormState): string[] {
  if (!form.date) return [];
  const start = parseLocalDate(form.date);

  if (form.recurring) {
    const dates: string[] = [];
    for (let i = 0; i < form.occurrences; i++) {
      const d = new Date(start);
      if (form.frequency === 'daily') d.setDate(d.getDate() + i);
      else if (form.frequency === 'weekly') d.setDate(d.getDate() + i * 7);
      else d.setMonth(d.getMonth() + i);
      dates.push(toDateKey(d));
    }
    return dates;
  }

  if (form.allDay && form.endDate && form.endDate > form.date) {
    const dates: string[] = [];
    const end = parseLocalDate(form.endDate);
    const cursor = new Date(start);
    while (cursor <= end) {
      dates.push(toDateKey(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }

  return [form.date];
}

export function findConflicts(form: NewEventFormState, existingMyEvents: CalendarEvent[]): CalendarEvent[] {
  const occurrenceDates = buildOccurrenceDates(form);
  if (occurrenceDates.length === 0) return [];
  const firstDate = occurrenceDates[0];

  const sameDay = existingMyEvents.filter(
    ev => ev.date === firstDate && CONFLICT_TYPES.includes(ev.type)
  );

  if (form.allDay) return sameDay;

  const newStart = timeToMinutes(form.start);
  const newEnd = timeToMinutes(form.end);

  return sameDay.filter(ev => {
    if (ev.allDay || !ev.start) return true;
    const evStart = timeToMinutes(ev.start);
    const evEnd = ev.end ? timeToMinutes(ev.end) : evStart + 1;
    return newStart < evEnd && evStart < newEnd;
  });
}

const TYPE_META: Record<NewEventType, { calendarType: CalendarEventType; source: CalendarEventSource }> = {
  leave: { calendarType: 'leave', source: 'leave' },
  meeting: { calendarType: 'meeting', source: 'personal' },
  training: { calendarType: 'training', source: 'personal' },
  'company-event': { calendarType: 'company-event', source: 'company' },
  holiday: { calendarType: 'holiday', source: 'company' },
};

export function buildEventsFromForm(form: NewEventFormState): CalendarEvent[] {
  const dates = buildOccurrenceDates(form);
  const ts = Date.now();
  const { calendarType, source } = TYPE_META[form.type];
  const status: CalendarEventStatus = form.type === 'company-event' ? 'pending' : 'confirmed';
  const needsAttendees = form.type === 'meeting' || form.type === 'training';

  return dates.map((date, i) => {
    const event: CalendarEvent = {
      id: `${form.type}-${ts}-${i}`,
      title: form.title.trim(),
      date,
      type: calendarType,
      status,
      source,
      scope: 'my',
      allDay: form.allDay,
      priority: form.priority,
    };

    if (form.category) event.category = form.category;
    if (form.location.trim()) event.location = form.location.trim();
    if (form.notes.trim()) event.note = form.notes.trim();
    if (form.type === 'leave') event.leaveType = form.leaveType;
    if (!form.allDay) {
      event.start = form.start;
      event.end = form.end;
    }
    if (needsAttendees && form.attendees.length > 0) {
      event.attendees = form.attendees.map(attendeeKey);
      event.attendeeRsvp = form.attendees.reduce<Record<string, RsvpStatus>>((acc, a) => {
        acc[attendeeKey(a)] = 'pending';
        return acc;
      }, {});
    }
    if (form.reminderMinutesBefore > 0) {
      event.reminderMinutesBefore = form.reminderMinutesBefore;
    }

    return event;
  });
}
