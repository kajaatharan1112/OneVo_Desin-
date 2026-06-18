import type { WorkSchedule } from './schedulesConfigTypes';

export const SEED_WORK_SCHEDULES: WorkSchedule[] = [
  {
    id: 'ws-default',
    title: 'Default',
    countryCode: 'US',
    countryName: 'United States',
    workdays: [1, 2, 3, 4, 5],
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
    assignmentTarget: 'company',
    departmentIds: [],
    employeeIds: [],
    isDefault: true,
    holidayCount: 0,
    assignedCount: 0,
    createdAt: '2026-06-12'
  }
];
