export type WorkHourType = 'fixed' | 'flexible';
export type AssignmentTarget = 'company' | 'department' | 'employee';

/** 0 = Sunday … 6 = Saturday */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface WorkSchedule {
  id: string;
  title: string;
  countryCode: string;
  countryName: string;
  workdays: WeekdayIndex[];
  workHourType: WorkHourType;
  startTime?: string;
  endTime?: string;
  breakPeriods?: BreakPeriod[];
  flexibleHours?: number;
  flexibleMinutes?: number;
  flexibleBreakHours?: number;
  flexibleBreakMinutes?: number;
  assignmentTarget: AssignmentTarget;
  departmentIds: string[];
  employeeIds: string[];
  isDefault: boolean;
  holidayCount: number;
  assignedCount: number;
  createdAt: string;
}

export interface BreakPeriod {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface WorkScheduleFormState {
  open: boolean;
  mode: 'create' | 'edit';
  scheduleId: string | null;
}

export interface AssignmentModalState {
  open: boolean;
  scheduleId: string | null;
}

export interface ScheduleAssignmentValues {
  assignmentTarget: AssignmentTarget;
  departmentIds: string[];
  employeeIds: string[];
}

export const EMPTY_ASSIGNMENT_VALUES = (): ScheduleAssignmentValues => ({
  assignmentTarget: 'company',
  departmentIds: [],
  employeeIds: []
});

export const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export const WEEKDAY_FULL_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const;

export const DEFAULT_WORKDAYS: WeekdayIndex[] = [1, 2, 3, 4, 5];

export const COUNTRY_OPTIONS = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'IN', name: 'India' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'LK', name: 'Sri Lanka' }
] as const;

export interface WorkScheduleFormValues {
  title: string;
  countryCode: string;
  workdays: WeekdayIndex[];
  workHourType: WorkHourType;
  startTime: string;
  endTime: string;
  breakPeriods: BreakPeriod[];
  flexibleHours: string;
  flexibleMinutes: string;
  flexibleBreakHours: string;
  flexibleBreakMinutes: string;
  assignmentTarget: AssignmentTarget;
  departmentIds: string[];
  employeeIds: string[];
  isDefault: boolean;
}

export const EMPTY_FORM_VALUES = (): WorkScheduleFormValues => ({
  title: '',
  countryCode: '',
  workdays: [...DEFAULT_WORKDAYS],
  workHourType: 'fixed',
  startTime: '09:00',
  endTime: '17:00',
  breakPeriods: [
    {
      id: 'break-lunch',
      name: 'Lunch break',
      startTime: '13:00',
      endTime: '14:00'
    }
  ],
  flexibleHours: '7',
  flexibleMinutes: '30',
  flexibleBreakHours: '0',
  flexibleBreakMinutes: '0',
  assignmentTarget: 'company',
  departmentIds: [],
  employeeIds: [],
  isDefault: false
});

export type HolidayType = 'single' | 'multiple';

export type HolidayCalendarSource = 'public' | 'manual' | 'public-manual';

export type ConfigStatus = 'active' | 'inactive';

export interface HolidayCalendar {
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
  source: HolidayCalendarSource;
  sourceLabel: string;
  lastSynced: string | null;
  status: ConfigStatus;
  holidayCount: number;
}

export interface ScheduleHoliday {
  id: string;
  calendarId: string;
  title: string;
  type: HolidayType;
  startDate: string;
  endDate: string;
  uploadedBy: string;
}

export interface HolidayListModalState {
  open: boolean;
  calendarId: string | null;
  scheduleId: string | null;
}

export interface HolidayCalendarFormState {
  open: boolean;
  mode: 'create' | 'edit';
  calendarId: string | null;
}

export interface HolidayCalendarFormValues {
  name: string;
  countryCode: string;
  source: HolidayCalendarSource;
  status: ConfigStatus;
}

export const EMPTY_HOLIDAY_CALENDAR_FORM = (): HolidayCalendarFormValues => ({
  name: '',
  countryCode: '',
  source: 'public-manual',
  status: 'active'
});

export const HOLIDAY_SOURCE_OPTIONS: Array<{ value: HolidayCalendarSource; label: string }> = [
  { value: 'public', label: 'Public calendar' },
  { value: 'manual', label: 'Manual' },
  { value: 'public-manual', label: 'Public calendar + manual' }
];

export function holidaySourceLabel(source: HolidayCalendarSource): string {
  return HOLIDAY_SOURCE_OPTIONS.find(o => o.value === source)?.label ?? source;
}

export interface HolidayFormModalState {
  open: boolean;
  mode: 'create' | 'edit';
  holidayId: string | null;
}

export interface HolidayDeleteModalState {
  open: boolean;
  holidayId: string | null;
}

export interface HolidayFormValues {
  title: string;
  type: HolidayType;
  startDate: string;
  endDate: string;
}

export const EMPTY_HOLIDAY_FORM = (): HolidayFormValues => ({
  title: '',
  type: 'single',
  startDate: '',
  endDate: ''
});

export const HOLIDAY_UPLOADED_BY = 'Manesh';
