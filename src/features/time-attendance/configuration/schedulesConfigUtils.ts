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

function timeToMinutes(time: string): number | null {
  const [h, m] = time.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function durationToMinutes(hours: string | number | undefined, minutes: string | number | undefined): number {
  return (Number(hours) || 0) * 60 + (Number(minutes) || 0);
}

export function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return 'No break';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (hours) parts.push(hours === 1 ? '1 hour' : `${hours} hours`);
  if (minutes) parts.push(minutes === 1 ? '1 minute' : `${minutes} minutes`);
  return parts.join(' ');
}

export function formatBreakTime(schedule: {
  workHourType: 'fixed' | 'flexible';
  breakPeriods?: Array<{ startTime: string; endTime: string }>;
  flexibleBreakHours?: number;
  flexibleBreakMinutes?: number;
}): string {
  if (schedule.workHourType === 'fixed') {
    const breaks = schedule.breakPeriods ?? [];
    if (breaks.length === 0) return 'No break';
    return breaks.map(period => `${period.startTime} - ${period.endTime}`).join(', ');
  }
  return formatDuration((schedule.flexibleBreakHours ?? 0) * 60 + (schedule.flexibleBreakMinutes ?? 0));
}

export function expectedWorkingMinutes(values: WorkScheduleFormValues): number | null {
  if (values.workHourType === 'fixed') {
    const start = timeToMinutes(values.startTime);
    const end = timeToMinutes(values.endTime);
    if (start === null || end === null || end <= start) return null;
    const breakMinutes = values.breakPeriods.reduce((total, period) => {
      const breakStart = timeToMinutes(period.startTime);
      const breakEnd = timeToMinutes(period.endTime);
      if (breakStart === null || breakEnd === null || breakEnd <= breakStart) return total;
      return total + breakEnd - breakStart;
    }, 0);
    return Math.max(0, end - start - breakMinutes);
  }

  return Math.max(
    0,
    durationToMinutes(values.flexibleHours, values.flexibleMinutes) -
      durationToMinutes(values.flexibleBreakHours, values.flexibleBreakMinutes)
  );
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
    const shiftStart = timeToMinutes(values.startTime);
    const shiftEnd = timeToMinutes(values.endTime);
    if (shiftStart === null || shiftEnd === null || shiftEnd <= shiftStart) {
      return 'End time must be after start time.';
    }
    for (const period of values.breakPeriods) {
      if (!period.name.trim()) return 'Break name is required.';
      if (!period.startTime) return 'Break start time is required.';
      if (!period.endTime) return 'Break end time is required.';
      const breakStart = timeToMinutes(period.startTime);
      const breakEnd = timeToMinutes(period.endTime);
      if (breakStart === null || breakEnd === null || breakEnd <= breakStart) {
        return 'Break end time must be after break start time.';
      }
      if (breakStart < shiftStart || breakEnd > shiftEnd) {
        return 'Break time must be within work time.';
      }
    }
    const breakMinutes = values.breakPeriods.reduce((total, period) => {
      const breakStart = timeToMinutes(period.startTime);
      const breakEnd = timeToMinutes(period.endTime);
      return breakStart !== null && breakEnd !== null ? total + breakEnd - breakStart : total;
    }, 0);
    if (breakMinutes >= shiftEnd - shiftStart) return 'Break time must be shorter than work time.';
  } else {
    const hours = Number(values.flexibleHours);
    const minutes = Number(values.flexibleMinutes);
    const breakHours = Number(values.flexibleBreakHours);
    const breakMinutes = Number(values.flexibleBreakMinutes);
    if (!Number.isFinite(hours) || hours < 0) return 'Enter valid hours for daily duration.';
    if (!Number.isFinite(minutes) || minutes < 0 || minutes >= 60) {
      return 'Enter valid minutes for daily duration.';
    }
    if (hours === 0 && minutes === 0) return 'Daily duration is required.';
    if (!Number.isFinite(breakHours) || breakHours < 0) return 'Enter valid hours for break duration.';
    if (!Number.isFinite(breakMinutes) || breakMinutes < 0 || breakMinutes >= 60) {
      return 'Enter valid minutes for break duration.';
    }
    if (breakHours * 60 + breakMinutes >= hours * 60 + minutes) {
      return 'Break duration must be shorter than daily duration.';
    }
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
