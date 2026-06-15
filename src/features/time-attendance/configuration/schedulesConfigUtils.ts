import type { WorkScheduleFormValues, WeekdayIndex } from './schedulesConfigTypes';
import { COUNTRY_OPTIONS, WEEKDAY_FULL_NAMES } from './schedulesConfigTypes';

const DISPLAY_DAY_ORDER: WeekdayIndex[] = [1, 2, 3, 4, 5, 6, 0];

export function formatWorkdays(workdays: WeekdayIndex[]): string {
  return DISPLAY_DAY_ORDER.filter(day => workdays.includes(day))
    .map(day => WEEKDAY_FULL_NAMES[day])
    .join(', ');
}

export function formatWorkTime(schedule: {
  workHourType: 'fixed' | 'flexible';
  startTime?: string;
  endTime?: string;
  flexibleHours?: number;
  flexibleMinutes?: number;
}): string {
  if (schedule.workHourType === 'fixed') {
    return `${schedule.startTime ?? '—'} - ${schedule.endTime ?? '—'}`;
  }
  const hours = schedule.flexibleHours ?? 0;
  const minutes = schedule.flexibleMinutes ?? 0;
  if (minutes === 0) return `${hours} hours`;
  return `${hours} hours ${minutes} minutes`;
}

export function formatCreatedDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatAssignedCount(count: number): string {
  return count === 1 ? '1 person' : `${count} people`;
}

export function formatHolidayCount(count: number): string {
  return count === 1 ? '1 holiday' : `${count} holidays`;
}

export function formatHolidayFoundCount(count: number): string {
  return count === 1 ? '1 holiday found' : `${count} holidays found`;
}

export function countryNameForCode(code: string): string {
  return COUNTRY_OPTIONS.find(c => c.code === code)?.name ?? code;
}

export function validateWorkScheduleForm(values: WorkScheduleFormValues): string | null {
  if (!values.title.trim()) return 'Title is required.';
  if (!values.countryCode) return 'Public holiday calendar country is required.';
  if (values.workdays.length === 0) return 'Select at least one workday.';

  const assignmentError = validateScheduleAssignment({
    assignmentTarget: values.assignmentTarget,
    departmentIds: values.departmentIds,
    employeeIds: values.employeeIds
  });
  if (assignmentError) return assignmentError;

  if (values.workHourType === 'fixed') {
    if (!values.startTime.trim()) return 'Start time is required.';
    if (!values.endTime.trim()) return 'End time is required.';
    if (values.startTime === values.endTime) return 'Start and end time cannot be the same.';
  } else {
    const hours = Number(values.flexibleHours);
    const minutes = Number(values.flexibleMinutes);
    if (!Number.isFinite(hours) || hours < 0) return 'Enter valid hours for daily duration.';
    if (!Number.isFinite(minutes) || minutes < 0 || minutes >= 60) {
      return 'Enter valid minutes for daily duration.';
    }
    if (hours === 0 && minutes === 0) return 'Daily duration is required.';
  }

  return null;
}

export function validateScheduleAssignment(values: {
  assignmentTarget: 'company' | 'department' | 'employee';
  departmentIds: string[];
  employeeIds: string[];
}): string | null {
  if (values.assignmentTarget === 'department' && values.departmentIds.length === 0) {
    return 'Select at least one department.';
  }
  if (values.assignmentTarget === 'employee' && values.employeeIds.length === 0) {
    return 'Select at least one employee.';
  }
  return null;
}

export function assignmentScopeLabel(
  target: 'company' | 'department' | 'employee',
  departmentIds: string[],
  employeeIds: string[],
  departments: Array<{ id: string; name: string }>,
  employees: Array<{ id: string; firstName: string; lastName: string }>
): string {
  if (target === 'company') return 'Full company';
  if (target === 'department') {
    const names = departmentIds
      .map(id => departments.find(d => d.id === id)?.name)
      .filter(Boolean);
    return names.length ? names.join(', ') : 'Department';
  }
  const names = employeeIds
    .map(id => {
      const emp = employees.find(e => e.id === id);
      return emp ? `${emp.firstName} ${emp.lastName}` : null;
    })
    .filter(Boolean);
  return names.length ? names.join(', ') : 'Employee';
}

export function todayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatHolidayDisplayDate(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatHolidayDateRange(
  type: 'single' | 'multiple',
  startDate: string,
  endDate: string
): string {
  if (!startDate) return '—';
  if (type === 'single' || startDate === endDate) {
    return formatHolidayDisplayDate(startDate);
  }
  return `${formatHolidayDisplayDate(startDate)} - ${formatHolidayDisplayDate(endDate)}`;
}

export function holidayRangeDayCount(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  const lo = start <= end ? start : end;
  const hi = start <= end ? end : start;
  return Math.round((hi.getTime() - lo.getTime()) / 86400000) + 1;
}

export function isHolidayFormValid(values: {
  title: string;
  type: 'single' | 'multiple';
  startDate: string;
  endDate: string;
}): boolean {
  if (!values.title.trim()) return false;
  if (values.type === 'single') return Boolean(values.startDate);
  return Boolean(values.startDate && values.endDate && values.endDate >= values.startDate);
}

export function validateHolidayForm(
  values: {
    title: string;
    type: 'single' | 'multiple';
    startDate: string;
    endDate: string;
  },
  holidays: Array<{
    id: string;
    calendarId: string;
    title: string;
    startDate: string;
    endDate: string;
  }>,
  calendarId: string,
  excludeId?: string
): string | null {
  if (!values.title.trim()) return 'Holiday title is required.';

  if (values.type === 'single') {
    if (!values.startDate) return 'Date is required.';
  } else {
    if (!values.startDate || !values.endDate) return 'Date range is required.';
    if (values.endDate < values.startDate) return 'End date cannot be before start date.';
  }

  const start = values.startDate;
  const end = values.type === 'single' ? values.startDate : values.endDate;
  const duplicate = holidays.some(
    h =>
      h.calendarId === calendarId &&
      h.id !== excludeId &&
      h.title.trim().toLowerCase() === values.title.trim().toLowerCase() &&
      h.startDate === start &&
      h.endDate === end
  );
  if (duplicate) return 'A holiday with this title and date already exists.';

  return null;
}

export function validateHolidayCalendarForm(values: {
  name: string;
  countryCode: string;
  source: string;
  status: string;
}): string | null {
  if (!values.name.trim()) return 'Calendar name is required.';
  if (!values.countryCode) return 'Country is required.';
  if (!values.source) return 'Source is required.';
  if (!values.status) return 'Status is required.';
  return null;
}

export function formatLastSynced(iso: string | null): string {
  if (!iso) return 'Not synced';
  return formatCreatedDate(iso);
}
