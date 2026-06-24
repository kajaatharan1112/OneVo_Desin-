import type {
  CalendarEvent,
  CalendarEventType,
  CalendarEventStatus,
  CalendarEventSource,
} from '../../types/employee-calendar.types';

export type NewEventType = 'leave' | 'meeting' | 'holiday';
export type RsvpStatus = 'pending' | 'accepted' | 'declined' | 'tentative';

export interface NewEventFormState {
  title: string;
  type: NewEventType;
  allDay: boolean;
  date: string;
  endDate: string;
  start: string;
  end: string;
  location: string;
  notes: string;
  attendees: string[];
  reminderMinutesBefore: number;
  recurring: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  occurrences: number;
}

export const EMPTY_NEW_EVENT_FORM: NewEventFormState = {
  title: '',
  type: 'leave',
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

export const MOCK_ATTENDEES = ['Priya Nair', 'Arun Kumar', 'Sara Lee'];

const CONFLICT_TYPES: CalendarEventType[] = ['shift', 'meeting', 'leave'];

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
  holiday: { calendarType: 'holiday', source: 'company' },
};

export function buildEventsFromForm(form: NewEventFormState): CalendarEvent[] {
  const dates = buildOccurrenceDates(form);
  const ts = Date.now();
  const { calendarType, source } = TYPE_META[form.type];
  const status: CalendarEventStatus = form.type === 'holiday' ? 'pending' : 'confirmed';

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
    };

    if (form.location.trim()) event.location = form.location.trim();
    if (form.notes.trim()) event.note = form.notes.trim();
    if (!form.allDay) {
      event.start = form.start;
      event.end = form.end;
    }
    if (form.type === 'meeting' && form.attendees.length > 0) {
      event.attendees = form.attendees;
      event.attendeeRsvp = form.attendees.reduce<Record<string, RsvpStatus>>((acc, name) => {
        acc[name] = 'pending';
        return acc;
      }, {});
    }
    if (form.reminderMinutesBefore > 0) {
      event.reminderMinutesBefore = form.reminderMinutesBefore;
    }

    return event;
  });
}
