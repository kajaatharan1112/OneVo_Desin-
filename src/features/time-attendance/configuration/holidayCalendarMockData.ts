import type { HolidayCalendar, ScheduleHoliday } from './schedulesConfigTypes';

export const SEED_HOLIDAY_CALENDARS: HolidayCalendar[] = [
  {
    id: 'hcal-us',
    name: 'United States',
    countryCode: 'US',
    countryName: 'United States',
    source: 'public-manual',
    sourceLabel: 'Public calendar + manual',
    lastSynced: '2026-06-12',
    status: 'active',
    holidayCount: 0
  },
  {
    id: 'hcal-gb',
    name: 'United Kingdom',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    source: 'public',
    sourceLabel: 'Public calendar',
    lastSynced: '2026-06-10',
    status: 'active',
    holidayCount: 0
  },
  {
    id: 'hcal-lk',
    name: 'Sri Lanka',
    countryCode: 'LK',
    countryName: 'Sri Lanka',
    source: 'public-manual',
    sourceLabel: 'Manual + public calendar',
    lastSynced: null,
    status: 'active',
    holidayCount: 0
  }
];

const US_NAMED: ScheduleHoliday[] = [
  {
    id: 'hol-us-1',
    calendarId: 'hcal-us',
    title: "New Year's Day",
    type: 'single',
    startDate: '2026-01-01',
    endDate: '2026-01-01',
    uploadedBy: 'System'
  },
  {
    id: 'hol-us-2',
    calendarId: 'hcal-us',
    title: 'Independence Day',
    type: 'single',
    startDate: '2026-07-04',
    endDate: '2026-07-04',
    uploadedBy: 'System'
  },
  {
    id: 'hol-us-3',
    calendarId: 'hcal-us',
    title: 'Company Shutdown',
    type: 'multiple',
    startDate: '2026-06-23',
    endDate: '2026-06-25',
    uploadedBy: 'Manesh'
  }
];

const US_EXTRA_TITLES = [
  'Martin Luther King Jr. Day',
  'Presidents Day',
  'Memorial Day',
  'Juneteenth',
  'Labor Day',
  'Columbus Day',
  'Veterans Day',
  'Thanksgiving Day',
  'Christmas Day'
];

function buildExtras(
  calendarId: string,
  titles: string[],
  startIndex: number
): ScheduleHoliday[] {
  return titles.map((title, i) => ({
    id: `${calendarId}-hol-${startIndex + i}`,
    calendarId,
    title,
    type: 'single' as const,
    startDate: `2026-${String(((i + startIndex) % 12) + 1).padStart(2, '0')}-15`,
    endDate: `2026-${String(((i + startIndex) % 12) + 1).padStart(2, '0')}-15`,
    uploadedBy: 'System'
  }));
}

const GB_TITLES = [
  'New Year\'s Day',
  'Good Friday',
  'Early May Bank Holiday',
  'Spring Bank Holiday',
  'Summer Bank Holiday',
  'Christmas Day',
  'Boxing Day',
  'Bank Holiday'
];

const LK_TITLES = Array.from({ length: 24 }, (_, i) => `Public Holiday ${i + 1}`);

export const SEED_CALENDAR_HOLIDAYS: ScheduleHoliday[] = [
  ...US_NAMED,
  ...buildExtras('hcal-us', US_EXTRA_TITLES, 4),
  ...buildExtras('hcal-gb', GB_TITLES, 0),
  ...buildExtras('hcal-lk', LK_TITLES, 0)
];
