import type { CalendarEvent, SyncProvider } from '../../types/employee-calendar.types';

export const MOCK_PULLED_EVENTS: Record<SyncProvider, Omit<CalendarEvent, 'id'>[]> = {
  google: [
    { title: 'Client Call — Acme Corp', date: '2026-06-19', start: '14:00', end: '14:30', type: 'meeting', status: 'confirmed', source: 'personal', scope: 'my', allDay: false },
    { title: 'Dentist Appointment', date: '2026-06-22', start: '09:00', end: '10:00', type: 'reminder', status: 'confirmed', source: 'personal', scope: 'my', allDay: false },
    { title: 'Quarterly Tax Review', date: '2026-06-23', start: '11:00', end: '12:00', type: 'meeting', status: 'confirmed', source: 'personal', scope: 'my', allDay: false },
    { title: 'Lunch with Mentor', date: '2026-06-25', start: '12:30', end: '13:30', type: 'meeting', status: 'confirmed', source: 'personal', scope: 'my', allDay: false },
  ],
  outlook: [
    { title: 'Vendor Sync — Northwind', date: '2026-06-18', start: '15:00', end: '15:30', type: 'meeting', status: 'confirmed', source: 'personal', scope: 'my', allDay: false },
    { title: 'Car Service Reminder', date: '2026-06-20', start: '08:30', end: '09:00', type: 'reminder', status: 'confirmed', source: 'personal', scope: 'my', allDay: false },
    { title: 'Budget Walkthrough', date: '2026-06-24', start: '14:00', end: '15:00', type: 'meeting', status: 'confirmed', source: 'personal', scope: 'my', allDay: false },
  ],
};

export function pullEvents(provider: SyncProvider): CalendarEvent[] {
  const ts = Date.now();
  return MOCK_PULLED_EVENTS[provider].map((ev, i) => ({
    ...ev,
    id: `pulled-${provider}-${ts}-${i}`,
    syncProvider: provider,
    syncOrigin: 'pulled',
  }));
}

export interface SyncConflict {
  eventId: string;
  eventTitle: string;
  mineStart: string;
  mineEnd: string;
  theirsStart: string;
  theirsEnd: string;
}

function shiftTimeByMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const wrapped = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
  const hh = Math.floor(wrapped / 60);
  const mm = wrapped % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function detectConflict(pushedEvents: CalendarEvent[], provider: SyncProvider): SyncConflict | null {
  const target = pushedEvents.find(ev => ev.syncProvider === provider && ev.syncOrigin === 'pushed');
  if (!target || !target.start || !target.end) return null;

  return {
    eventId: target.id,
    eventTitle: target.title,
    mineStart: target.start,
    mineEnd: target.end,
    theirsStart: shiftTimeByMinutes(target.start, 60),
    theirsEnd: shiftTimeByMinutes(target.end, 60),
  };
}
