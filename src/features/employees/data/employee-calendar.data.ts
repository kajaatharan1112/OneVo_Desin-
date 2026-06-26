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
    { id: 'sh-1', title: 'Morning Shift', date: '2026-06-15', start: '09:00', end: '17:00', type: 'shift', status: 'confirmed', source: 'schedule', scope: 'my' },
    { id: 'sh-2', title: 'Morning Shift', date: '2026-06-16', start: '09:00', end: '17:00', type: 'shift', status: 'confirmed', source: 'schedule', scope: 'my' },
    { id: 'sh-3', title: 'Morning Shift', date: '2026-06-17', start: '09:00', end: '17:00', type: 'shift', status: 'confirmed', source: 'schedule', scope: 'my' },
    { id: 'sh-4', title: 'Morning Shift', date: '2026-06-18', start: '09:00', end: '17:00', type: 'shift', status: 'confirmed', source: 'schedule', scope: 'my' },
    { id: 'sh-5', title: 'Morning Shift', date: '2026-06-19', start: '09:00', end: '17:00', type: 'shift', status: 'confirmed', source: 'schedule', scope: 'my' },
    // Meetings
    { id: 'e-1', title: 'Team Sync',         date: '2026-06-17', start: '10:00', end: '10:30', type: 'meeting', status: 'confirmed',      source: 'personal', scope: 'my', location: 'Zoom', attendees: ['Priya Nair', 'Arun Kumar', 'Sara Lee'] },
    { id: 'e-2', title: 'Sprint Review',      date: '2026-06-17', start: '13:00', end: '14:00', type: 'meeting', status: 'confirmed',      source: 'personal', scope: 'my', location: 'Conference Room B', attendees: ['Priya Nair', 'Product Team'] },
    { id: 'e-3', title: '1:1 with Manager',  date: '2026-06-18', start: '14:00', end: '14:30', type: 'meeting', status: 'confirmed',      source: 'personal', scope: 'my', location: 'Zoom', attendees: ['Priya Nair'] },
    { id: 'e-4', title: 'Product Demo',       date: '2026-06-18', start: '15:00', end: '16:00', type: 'meeting', status: 'needs-response', source: 'personal', scope: 'my', needsResponse: true, location: 'Main Auditorium', attendees: ['Product Team', 'Leadership'] },
    { id: 'e-5', title: 'Design Review',      date: '2026-06-19', start: '11:00', end: '11:30', type: 'meeting', status: 'needs-response', source: 'personal', scope: 'my', needsResponse: true, location: 'Conference Room A', attendees: ['Design Team'] },
    { id: 'e-6', title: 'Release Checkpoint', date: '2026-06-20', start: '10:00', end: '10:30', type: 'meeting', status: 'confirmed',      source: 'personal', scope: 'my', location: 'Zoom', attendees: ['Arun Kumar'] },
    { id: 'e-7', title: 'Department All-Hands', date: '2026-06-24', start: '09:30', end: '10:30', type: 'meeting', status: 'confirmed',    source: 'company', scope: 'my', location: 'Main Auditorium', attendees: ['Product Engineering'] },
    // Leave (all-day)
    { id: 'lv-1', title: 'Annual Leave', date: '2026-06-25', type: 'leave', status: 'confirmed', source: 'leave', scope: 'my', allDay: true },
    { id: 'lv-2', title: 'Annual Leave', date: '2026-06-26', type: 'leave', status: 'confirmed', source: 'leave', scope: 'my', allDay: true },
    // Company holiday (all-day)
    { id: 'hd-1', title: 'Company Foundation Day', date: '2026-06-29', type: 'holiday', status: 'confirmed', source: 'company', scope: 'my', allDay: true, location: 'Company-wide' },
    // Reminders
    { id: 'rm-1', title: 'Submit Weekly Form',    date: '2026-06-20', start: '17:00', type: 'reminder', status: 'pending', source: 'personal', scope: 'my' },
    { id: 'rm-2', title: 'Update task estimates', date: '2026-06-18', start: '16:00', type: 'reminder', status: 'pending', source: 'personal', scope: 'my' },

    // ── Team scope (Product Engineering squad) ───────────────────────────────
    { id: 'tm-1', title: 'Standup',            date: '2026-06-17', start: '09:00', end: '09:15', type: 'meeting', status: 'confirmed', source: 'personal', scope: 'team', ownerName: 'Priya Nair' },
    { id: 'tm-2', title: 'Pairing Session',    date: '2026-06-18', start: '11:00', end: '12:00', type: 'meeting', status: 'confirmed', source: 'personal', scope: 'team', ownerName: 'Arun Kumar' },
    { id: 'tm-3', title: 'On-call Shift',      date: '2026-06-19', start: '09:00', end: '17:00', type: 'shift',   status: 'confirmed', source: 'schedule', scope: 'team', ownerName: 'Priya Nair' },
    { id: 'tm-4', title: 'Annual Leave',       date: '2026-06-22', type: 'leave', status: 'confirmed', source: 'leave', scope: 'team', ownerName: 'Arun Kumar', allDay: true },
    { id: 'tm-5', title: 'Backlog Grooming',   date: '2026-06-24', start: '15:00', end: '16:00', type: 'meeting', status: 'confirmed', source: 'personal', scope: 'team', ownerName: 'Sara Lee' },

    // ── Department scope (Product Engineering) ───────────────────────────────
    { id: 'dp-1', title: 'Engineering Town Hall',   date: '2026-06-18', start: '16:00', end: '17:00', type: 'meeting', status: 'confirmed', source: 'company', scope: 'department', ownerName: 'Product Engineering' },
    { id: 'dp-2', title: 'Hiring Panel',             date: '2026-06-19', start: '13:00', end: '14:00', type: 'meeting', status: 'confirmed', source: 'company', scope: 'department', ownerName: 'Engineering Mgmt' },
    { id: 'dp-3', title: 'Quarterly Planning',       date: '2026-06-23', start: '10:00', end: '12:00', type: 'meeting', status: 'confirmed', source: 'company', scope: 'department', ownerName: 'Product Engineering' },

    // ── Organization scope (company-wide) ────────────────────────────────────
    { id: 'or-1', title: 'All-Company Townhall', date: '2026-06-22', start: '09:00', end: '10:00', type: 'meeting', status: 'confirmed', source: 'company', scope: 'organization', ownerName: 'Company' },
    { id: 'or-2', title: 'Company Foundation Day', date: '2026-06-29', type: 'holiday', status: 'confirmed', source: 'company', scope: 'organization', ownerName: 'Company', allDay: true },
    { id: 'or-3', title: 'Benefits Open Enrollment', date: '2026-06-26', start: '12:00', end: '13:00', type: 'reminder', status: 'pending', source: 'company', scope: 'organization', ownerName: 'Company' }
  ]
};
