import { CALENDAR_DIRECTORY } from './new-event-wizard.utils';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function getOffsetMinutes(timeZone: string, atUtc: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const parts = dtf.formatToParts(atUtc).reduce<Record<string, string>>((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const asUtc = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour), Number(parts.minute), Number(parts.second)
  );
  return Math.round((asUtc - atUtc.getTime()) / 60000);
}

export function formatOffsetLabel(timeZone: string, atUtc: Date = new Date()): string {
  const minutes = getOffsetMinutes(timeZone, atUtc);
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}:${pad2(m)}`;
}

export function convertWallTime(
  date: string, time: string, fromZone: string, toZone: string
): { date: string; time: string } {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const naiveUtcMs = Date.UTC(y, mo - 1, d, h, mi);
  const fromOffset = getOffsetMinutes(fromZone, new Date(naiveUtcMs));
  const trueUtcMs = naiveUtcMs - fromOffset * 60000;
  const toOffset = getOffsetMinutes(toZone, new Date(trueUtcMs));
  const targetMs = trueUtcMs + toOffset * 60000;
  const t = new Date(targetMs);
  return {
    date: `${t.getUTCFullYear()}-${pad2(t.getUTCMonth() + 1)}-${pad2(t.getUTCDate())}`,
    time: `${pad2(t.getUTCHours())}:${pad2(t.getUTCMinutes())}`,
  };
}

export interface AttendeeTimeRow {
  name: string;
  country: string;
  start: string;
  end: string;
}

export function getAttendeeTimeRows(
  attendeeNames: string[],
  date: string,
  start: string,
  end: string,
  viewerTimeZone: string
): AttendeeTimeRow[] {
  if (!date || !start || !end) return [];
  const rows: AttendeeTimeRow[] = [];
  for (const name of attendeeNames) {
    const person = CALENDAR_DIRECTORY.find(p => p.name === name);
    if (!person || person.timezone === viewerTimeZone) continue;
    const startConv = convertWallTime(date, start, viewerTimeZone, person.timezone);
    const endConv = convertWallTime(date, end, viewerTimeZone, person.timezone);
    rows.push({ name: person.name, country: person.country, start: startConv.time, end: endConv.time });
  }
  return rows;
}
