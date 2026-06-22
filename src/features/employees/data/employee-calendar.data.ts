import type { EmployeeCalendarData } from '../types/employee-calendar.types';

/** Dabi · Software Developer · Product Engineering · Jun 2026 */
export const employeeCalendarData: EmployeeCalendarData = {
  currentPeriod: 'June 2026',
  selectedDate: '2026-06-17',
  viewMode: 'month',
  syncStatus: {
    google: 'connected',
    outlook: 'disconnected',
    lastSynced: '10 min ago'
  },
  events: [
    // Morning Shifts — Mon–Fri Jun 15–19
    { id: 'sh-1', title: 'Morning Shift', date: '2026-06-15', start: '09:00', end: '17:00', type: 'shift', status: 'confirmed', source: 'schedule' },
    { id: 'sh-2', title: 'Morning Shift', date: '2026-06-16', start: '09:00', end: '17:00', type: 'shift', status: 'confirmed', source: 'schedule' },
    { id: 'sh-3', title: 'Morning Shift', date: '2026-06-17', start: '09:00', end: '17:00', type: 'shift', status: 'confirmed', source: 'schedule' },
    { id: 'sh-4', title: 'Morning Shift', date: '2026-06-18', start: '09:00', end: '17:00', type: 'shift', status: 'confirmed', source: 'schedule' },
    { id: 'sh-5', title: 'Morning Shift', date: '2026-06-19', start: '09:00', end: '17:00', type: 'shift', status: 'confirmed', source: 'schedule' },
    // Meetings
    { id: 'e-1', title: 'Team Sync',         date: '2026-06-17', start: '10:00', end: '10:30', type: 'meeting', status: 'confirmed',      source: 'personal' },
    { id: 'e-2', title: 'Sprint Review',      date: '2026-06-17', start: '13:00', end: '14:00', type: 'meeting', status: 'confirmed',      source: 'personal' },
    { id: 'e-3', title: '1:1 with Manager',  date: '2026-06-18', start: '14:00', end: '14:30', type: 'meeting', status: 'confirmed',      source: 'personal' },
    { id: 'e-4', title: 'Product Demo',       date: '2026-06-18', start: '15:00', end: '16:00', type: 'meeting', status: 'needs-response', source: 'personal', needsResponse: true },
    { id: 'e-5', title: 'Design Review',      date: '2026-06-19', start: '11:00', end: '11:30', type: 'meeting', status: 'needs-response', source: 'personal', needsResponse: true },
    { id: 'e-6', title: 'Release Checkpoint', date: '2026-06-20', start: '10:00', end: '10:30', type: 'meeting', status: 'confirmed',      source: 'personal' },
    { id: 'e-7', title: 'Department All-Hands', date: '2026-06-24', start: '09:30', end: '10:30', type: 'meeting', status: 'confirmed',    source: 'company' },
    // Leave (all-day)
    { id: 'lv-1', title: 'Annual Leave', date: '2026-06-25', type: 'leave', status: 'confirmed', source: 'leave', allDay: true },
    { id: 'lv-2', title: 'Annual Leave', date: '2026-06-26', type: 'leave', status: 'confirmed', source: 'leave', allDay: true },
    // Company holiday (all-day)
    { id: 'hd-1', title: 'Company Foundation Day', date: '2026-06-29', type: 'holiday', status: 'confirmed', source: 'company', allDay: true },
    // Reminders
    { id: 'rm-1', title: 'Submit Weekly Form',    date: '2026-06-20', start: '17:00', type: 'reminder', status: 'pending', source: 'personal' },
    { id: 'rm-2', title: 'Update task estimates', date: '2026-06-18', start: '16:00', type: 'reminder', status: 'pending', source: 'personal' }
  ]
};
