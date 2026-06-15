import { create } from 'zustand';
import type {
  AssignmentTarget,
  AssignmentModalState,
  HolidayCalendar,
  HolidayCalendarFormState,
  HolidayCalendarFormValues,
  HolidayDeleteModalState,
  HolidayFormModalState,
  HolidayFormValues,
  HolidayListModalState,
  ScheduleAssignmentValues,
  ScheduleHoliday,
  WorkSchedule,
  WorkScheduleFormState,
  WeekdayIndex
} from '../features/time-attendance/configuration/schedulesConfigTypes';
import { HOLIDAY_UPLOADED_BY, holidaySourceLabel } from '../features/time-attendance/configuration/schedulesConfigTypes';
import { SEED_WORK_SCHEDULES } from '../features/time-attendance/configuration/schedulesConfigMockData';
import {
  SEED_CALENDAR_HOLIDAYS,
  SEED_HOLIDAY_CALENDARS
} from '../features/time-attendance/configuration/holidayCalendarMockData';
import {
  countryNameForCode,
  todayIsoDate,
  validateHolidayCalendarForm,
  validateHolidayForm,
  validateScheduleAssignment,
  validateWorkScheduleForm
} from '../features/time-attendance/configuration/schedulesConfigUtils';
import type { WorkScheduleFormValues } from '../features/time-attendance/configuration/schedulesConfigTypes';
import { useOrganizationStore } from './organizationStore';

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const closedForm = (): WorkScheduleFormState => ({ open: false, mode: 'create', scheduleId: null });
const closedHolidayList = (): HolidayListModalState => ({
  open: false,
  calendarId: null,
  scheduleId: null
});
const closedHolidayForm = (): HolidayFormModalState => ({
  open: false,
  mode: 'create',
  holidayId: null
});
const closedHolidayDelete = (): HolidayDeleteModalState => ({ open: false, holidayId: null });
const closedAssignmentModal = (): AssignmentModalState => ({ open: false, scheduleId: null });
const closedCalendarForm = (): HolidayCalendarFormState => ({
  open: false,
  mode: 'create',
  calendarId: null
});

function computeAssignedCount(
  target: AssignmentTarget,
  departmentIds: string[],
  employeeIds: string[]
): number {
  const { employees, assignments, positions } = useOrganizationStore.getState();
  const activeEmployees = employees.filter(e => e.status === 'active');

  if (target === 'company') return activeEmployees.length;
  if (target === 'employee') return employeeIds.length;
  if (target === 'department') {
    const posIds = new Set(
      positions.filter(p => departmentIds.includes(p.departmentId)).map(p => p.id)
    );
    const empIds = new Set(
      assignments
        .filter(a => posIds.has(a.positionId) && a.status === 'active' && !a.effectiveTo)
        .map(a => a.employeeId)
    );
    return activeEmployees.filter(e => empIds.has(e.id)).length;
  }
  return 0;
}

function syncCalendarCounts(
  calendars: HolidayCalendar[],
  holidays: ScheduleHoliday[]
): HolidayCalendar[] {
  return calendars.map(calendar => ({
    ...calendar,
    holidayCount: holidays.filter(h => h.calendarId === calendar.id).length
  }));
}

function syncScheduleHolidayCounts(
  schedules: WorkSchedule[],
  calendars: HolidayCalendar[],
  holidays: ScheduleHoliday[]
): WorkSchedule[] {
  return schedules.map(schedule => {
    const calendar = calendars.find(c => c.countryCode === schedule.countryCode);
    const holidayCount = calendar
      ? holidays.filter(h => h.calendarId === calendar.id).length
      : 0;
    return { ...schedule, holidayCount };
  });
}

function syncAssignedCounts(schedules: WorkSchedule[]): WorkSchedule[] {
  return schedules.map(schedule => ({
    ...schedule,
    assignedCount: computeAssignedCount(
      schedule.assignmentTarget,
      schedule.departmentIds,
      schedule.employeeIds
    )
  }));
}

function findCalendarForSchedule(
  calendars: HolidayCalendar[],
  schedule: WorkSchedule
): HolidayCalendar | undefined {
  return calendars.find(c => c.countryCode === schedule.countryCode);
}

interface SchedulesConfigState {
  schedules: WorkSchedule[];
  holidayCalendars: HolidayCalendar[];
  holidays: ScheduleHoliday[];
  form: WorkScheduleFormState;
  holidayListModal: HolidayListModalState;
  holidayFormModal: HolidayFormModalState;
  holidayDeleteModal: HolidayDeleteModalState;
  calendarForm: HolidayCalendarFormState;
  assignmentModal: AssignmentModalState;
  selectedHolidayIds: string[];
  toast: string | null;

  openCreateSchedule: () => void;
  openEditSchedule: (id: string) => void;
  closeForm: () => void;
  saveSchedule: (values: WorkScheduleFormValues) => { ok: boolean; error?: string };
  deleteSchedule: (id: string) => void;

  openAssignmentModal: (scheduleId: string) => void;
  closeAssignmentModal: () => void;
  saveAssignment: (scheduleId: string, values: ScheduleAssignmentValues) => { ok: boolean; error?: string };

  openHolidayList: (scheduleId: string) => void;
  openHolidayListByCalendar: (calendarId: string) => void;
  closeHolidayList: () => void;
  openAddHoliday: () => void;
  openEditHoliday: (holidayId: string) => void;
  closeHolidayForm: () => void;
  saveHoliday: (values: HolidayFormValues) => { ok: boolean; error?: string };
  openDeleteHoliday: (holidayId: string) => void;
  closeDeleteHoliday: () => void;
  confirmDeleteHoliday: () => void;
  toggleHolidaySelection: (holidayId: string) => void;
  toggleAllHolidaySelection: (holidayIds: string[]) => void;

  openCreateCalendar: () => void;
  openEditCalendar: (calendarId: string) => void;
  closeCalendarForm: () => void;
  saveCalendar: (values: HolidayCalendarFormValues) => { ok: boolean; error?: string };
  syncCalendarHolidays: (calendarId: string) => void;

  clearToast: () => void;
}

const initialCalendars = syncCalendarCounts(SEED_HOLIDAY_CALENDARS, SEED_CALENDAR_HOLIDAYS);
const initialSchedules = syncScheduleHolidayCounts(
  syncAssignedCounts(SEED_WORK_SCHEDULES),
  initialCalendars,
  SEED_CALENDAR_HOLIDAYS
);

export const useSchedulesConfigStore = create<SchedulesConfigState>((set, get) => ({
  schedules: initialSchedules,
  holidayCalendars: initialCalendars,
  holidays: SEED_CALENDAR_HOLIDAYS,
  form: closedForm(),
  holidayListModal: closedHolidayList(),
  holidayFormModal: closedHolidayForm(),
  holidayDeleteModal: closedHolidayDelete(),
  calendarForm: closedCalendarForm(),
  assignmentModal: closedAssignmentModal(),
  selectedHolidayIds: [],
  toast: null,

  openCreateSchedule: () => set({ form: { open: true, mode: 'create', scheduleId: null } }),
  openEditSchedule: (id) => set({ form: { open: true, mode: 'edit', scheduleId: id } }),
  closeForm: () => set({ form: closedForm() }),

  saveSchedule: (values) => {
    const error = validateWorkScheduleForm(values);
    if (error) return { ok: false, error };

    const { schedules, form, holidays, holidayCalendars } = get();
    const existing = form.scheduleId ? schedules.find(s => s.id === form.scheduleId) : undefined;
    const calendar = holidayCalendars.find(c => c.countryCode === values.countryCode);

    const nextSchedule: WorkSchedule = {
      id: existing?.id ?? createId('ws'),
      title: values.title.trim(),
      countryCode: values.countryCode,
      countryName: countryNameForCode(values.countryCode),
      workdays: [...values.workdays].sort((a, b) => a - b) as WeekdayIndex[],
      workHourType: values.workHourType,
      startTime: values.workHourType === 'fixed' ? values.startTime : undefined,
      endTime: values.workHourType === 'fixed' ? values.endTime : undefined,
      flexibleHours:
        values.workHourType === 'flexible' ? Number(values.flexibleHours) || 0 : undefined,
      flexibleMinutes:
        values.workHourType === 'flexible' ? Number(values.flexibleMinutes) || 0 : undefined,
      assignmentTarget: values.assignmentTarget,
      departmentIds:
        values.assignmentTarget === 'department' ? [...values.departmentIds] : [],
      employeeIds: values.assignmentTarget === 'employee' ? [...values.employeeIds] : [],
      isDefault: values.isDefault,
      holidayCount: calendar
        ? holidays.filter(h => h.calendarId === calendar.id).length
        : 0,
      assignedCount: computeAssignedCount(
        values.assignmentTarget,
        values.departmentIds,
        values.employeeIds
      ),
      createdAt: existing?.createdAt ?? todayIsoDate()
    };

    let nextSchedules = existing
      ? schedules.map(s => (s.id === existing.id ? nextSchedule : s))
      : [...schedules, nextSchedule];

    if (values.isDefault) {
      nextSchedules = nextSchedules.map(s =>
        s.id === nextSchedule.id ? s : { ...s, isDefault: false }
      );
    }

    set({
      schedules: syncScheduleHolidayCounts(nextSchedules, holidayCalendars, holidays),
      form: closedForm(),
      toast: existing ? 'Work schedule updated.' : 'Work schedule created.'
    });
    return { ok: true };
  },

  deleteSchedule: (id) => {
    const { schedules } = get();
    const target = schedules.find(s => s.id === id);
    if (!target) return;
    if (target.isDefault && schedules.length === 1) {
      set({ toast: 'Cannot delete the only default schedule.' });
      return;
    }
    set({
      schedules: schedules.filter(s => s.id !== id),
      toast: 'Work schedule deleted.'
    });
  },

  openAssignmentModal: (scheduleId) =>
    set({ assignmentModal: { open: true, scheduleId } }),

  closeAssignmentModal: () => set({ assignmentModal: closedAssignmentModal() }),

  saveAssignment: (scheduleId, values) => {
    const error = validateScheduleAssignment(values);
    if (error) return { ok: false, error };

    const { schedules } = get();
    const existing = schedules.find(s => s.id === scheduleId);
    if (!existing) return { ok: false, error: 'Schedule not found.' };

    const nextSchedule: WorkSchedule = {
      ...existing,
      assignmentTarget: values.assignmentTarget,
      departmentIds:
        values.assignmentTarget === 'department' ? [...values.departmentIds] : [],
      employeeIds: values.assignmentTarget === 'employee' ? [...values.employeeIds] : [],
      assignedCount: computeAssignedCount(
        values.assignmentTarget,
        values.departmentIds,
        values.employeeIds
      )
    };

    set({
      schedules: schedules.map(s => (s.id === scheduleId ? nextSchedule : s)),
      assignmentModal: closedAssignmentModal(),
      toast: 'Schedule assignment updated.'
    });
    return { ok: true };
  },

  openHolidayList: (scheduleId) => {
    const { schedules, holidayCalendars } = get();
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;
    const calendar = findCalendarForSchedule(holidayCalendars, schedule);
    set({
      holidayListModal: {
        open: true,
        calendarId: calendar?.id ?? null,
        scheduleId
      },
      selectedHolidayIds: [],
      holidayFormModal: closedHolidayForm(),
      holidayDeleteModal: closedHolidayDelete()
    });
  },

  openHolidayListByCalendar: (calendarId) =>
    set({
      holidayListModal: { open: true, calendarId, scheduleId: null },
      selectedHolidayIds: [],
      holidayFormModal: closedHolidayForm(),
      holidayDeleteModal: closedHolidayDelete()
    }),

  closeHolidayList: () =>
    set({
      holidayListModal: closedHolidayList(),
      holidayFormModal: closedHolidayForm(),
      holidayDeleteModal: closedHolidayDelete(),
      selectedHolidayIds: []
    }),

  openAddHoliday: () =>
    set({
      holidayFormModal: { open: true, mode: 'create', holidayId: null },
      holidayDeleteModal: closedHolidayDelete()
    }),

  openEditHoliday: (holidayId) =>
    set({
      holidayFormModal: { open: true, mode: 'edit', holidayId },
      holidayDeleteModal: closedHolidayDelete()
    }),

  closeHolidayForm: () => set({ holidayFormModal: closedHolidayForm() }),

  saveHoliday: (values) => {
    const { holidayListModal, holidayFormModal, holidays, schedules, holidayCalendars } = get();
    const calendarId = holidayListModal.calendarId;
    if (!calendarId) return { ok: false, error: 'Holiday calendar not found.' };

    const error = validateHolidayForm(
      values,
      holidays,
      calendarId,
      holidayFormModal.holidayId ?? undefined
    );
    if (error) return { ok: false, error };

    const startDate = values.startDate;
    const endDate = values.type === 'single' ? values.startDate : values.endDate;

    const existing = holidayFormModal.holidayId
      ? holidays.find(h => h.id === holidayFormModal.holidayId)
      : undefined;

    const nextHoliday: ScheduleHoliday = {
      id: existing?.id ?? createId('hol'),
      calendarId,
      title: values.title.trim(),
      type: values.type,
      startDate,
      endDate,
      uploadedBy: existing?.uploadedBy ?? HOLIDAY_UPLOADED_BY
    };

    const nextHolidays = existing
      ? holidays.map(h => (h.id === existing.id ? nextHoliday : h))
      : [...holidays, nextHoliday];

    const nextCalendars = syncCalendarCounts(holidayCalendars, nextHolidays);

    set({
      holidays: nextHolidays,
      holidayCalendars: nextCalendars,
      schedules: syncScheduleHolidayCounts(schedules, nextCalendars, nextHolidays),
      holidayFormModal: closedHolidayForm(),
      toast: existing ? 'Holiday updated.' : 'Holiday added.'
    });
    return { ok: true };
  },

  openDeleteHoliday: (holidayId) =>
    set({
      holidayDeleteModal: { open: true, holidayId },
      holidayFormModal: closedHolidayForm()
    }),

  closeDeleteHoliday: () => set({ holidayDeleteModal: closedHolidayDelete() }),

  confirmDeleteHoliday: () => {
    const { holidayDeleteModal, holidays, schedules, holidayCalendars, selectedHolidayIds } = get();
    if (!holidayDeleteModal.holidayId) return;

    const nextHolidays = holidays.filter(h => h.id !== holidayDeleteModal.holidayId);
    const nextCalendars = syncCalendarCounts(holidayCalendars, nextHolidays);

    set({
      holidays: nextHolidays,
      holidayCalendars: nextCalendars,
      schedules: syncScheduleHolidayCounts(schedules, nextCalendars, nextHolidays),
      holidayDeleteModal: closedHolidayDelete(),
      selectedHolidayIds: selectedHolidayIds.filter(id => id !== holidayDeleteModal.holidayId),
      toast: 'Holiday deleted.'
    });
  },

  toggleHolidaySelection: (holidayId) => {
    const { selectedHolidayIds } = get();
    set({
      selectedHolidayIds: selectedHolidayIds.includes(holidayId)
        ? selectedHolidayIds.filter(id => id !== holidayId)
        : [...selectedHolidayIds, holidayId]
    });
  },

  toggleAllHolidaySelection: (holidayIds) => {
    const { selectedHolidayIds } = get();
    const allSelected = holidayIds.length > 0 && holidayIds.every(id => selectedHolidayIds.includes(id));
    set({
      selectedHolidayIds: allSelected
        ? selectedHolidayIds.filter(id => !holidayIds.includes(id))
        : [...new Set([...selectedHolidayIds, ...holidayIds])]
    });
  },

  openCreateCalendar: () => set({ calendarForm: { open: true, mode: 'create', calendarId: null } }),

  openEditCalendar: (calendarId) =>
    set({ calendarForm: { open: true, mode: 'edit', calendarId } }),

  closeCalendarForm: () => set({ calendarForm: closedCalendarForm() }),

  saveCalendar: (values) => {
    const error = validateHolidayCalendarForm(values);
    if (error) return { ok: false, error };

    const { holidayCalendars, calendarForm, holidays, schedules } = get();
    const existing = calendarForm.calendarId
      ? holidayCalendars.find(c => c.id === calendarForm.calendarId)
      : undefined;

    const countryName = countryNameForCode(values.countryCode);
    const nextCalendar: HolidayCalendar = {
      id: existing?.id ?? createId('hcal'),
      name: values.name.trim(),
      countryCode: values.countryCode,
      countryName,
      source: values.source,
      sourceLabel: holidaySourceLabel(values.source),
      lastSynced: existing?.lastSynced ?? null,
      status: values.status,
      holidayCount: existing?.holidayCount ?? 0
    };

    const nextCalendars = existing
      ? holidayCalendars.map(c => (c.id === existing.id ? nextCalendar : c))
      : [...holidayCalendars, nextCalendar];

    set({
      holidayCalendars: syncCalendarCounts(nextCalendars, holidays),
      schedules: syncScheduleHolidayCounts(schedules, nextCalendars, holidays),
      calendarForm: closedCalendarForm(),
      toast: existing ? 'Holiday calendar updated.' : 'Holiday calendar created.'
    });
    return { ok: true };
  },

  syncCalendarHolidays: (calendarId) => {
    const { holidayCalendars, schedules, holidays } = get();
    const nextCalendars = holidayCalendars.map(c =>
      c.id === calendarId ? { ...c, lastSynced: todayIsoDate() } : c
    );
    set({
      holidayCalendars: nextCalendars,
      schedules: syncScheduleHolidayCounts(schedules, nextCalendars, holidays),
      toast: 'Public holidays synced.'
    });
  },

  clearToast: () => set({ toast: null })
}));
