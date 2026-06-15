/* ─── Productivity Dashboard — Data & Types ─── */

export type PeriodMode = 'week' | 'month';

/* ── Pie / Stats ─────────────────────────────── */
export interface ProductivityHourBreakdown {
  clockInHours: number;
  taskHours: number;
  meetingHours: number;
  weeklyTarget: number;
}

export interface ProductivityStats {
  hours: ProductivityHourBreakdown;
  productivityPct: number; // taskHours / clockInHours * 100
}

/* ── Clock History ───────────────────────────── */
export interface ClockDayRecord {
  id: string;
  dayLabel: string;     // "Mon", "Tue" …
  date: string;         // "Jun 9"
  isToday: boolean;
  clockIn: string | null;
  clockOut: string | null;
  sessionTime: string | null;
  breakTime: string | null;
  status: 'present' | 'absent' | 'half-day' | 'holiday';
  /* ── New productivity fields ── */
  tasksDone: number | null;
  tasksTotal: number | null;
  productivityPct: number | null;  // 0-100
  meetingHours: string | null;     // "1h 30m"
  meetingCount: number | null;
}

/* ── Overtime ────────────────────────────────── */
export interface OvertimeTask {
  id: string;
  title: string;
  hours: number;
}

export interface OvertimeRecord {
  id: string;
  date: string;
  duration: string;   // "2h 30m"
  approvedBy: string;
  reason: string;
  tasks: OvertimeTask[];
}

/* ── Leave ───────────────────────────────────── */
export interface LeaveRecord {
  id: string;
  type: string;         // "Annual Leave", "Sick Leave"
  startDate: string;
  endDate: string;
  days: number;
  approvedBy: string | null;
  status: 'approved' | 'pending' | 'rejected' | 'cancelled';
  reason: string;
  isFuture: boolean;
}

export interface LeaveSummary {
  totalEntitlement: number;
  used: number;
  pending: number;
  remaining: number;
}

/* ── Warning ─────────────────────────────────── */
export type WarningType =
  | 'late-clock-in'
  | 'unauthorized-app'
  | 'offline-too-long'
  | 'multiple-warnings'
  | 'policy-breach';

export interface WarningRecord {
  id: string;
  type: WarningType;
  title: string;
  date: string;
  time: string;
  description: string;
  reportingManager: string;
  severity: 'low' | 'medium' | 'high';
}

/* ═══════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════ */

export const productivityStats: ProductivityStats = {
  hours: {
    clockInHours: 28,
    taskHours: 22,
    meetingHours: 6,
    weeklyTarget: 40
  },
  productivityPct: Math.round((22 / 28) * 100) // 79
};

export const clockHistory: ClockDayRecord[] = [
  {
    id: 'mon',
    dayLabel: 'Mon',
    date: 'Jun 9',
    isToday: false,
    clockIn: '09:02 AM',
    clockOut: '06:18 PM',
    sessionTime: '8h 46m',
    breakTime: '58m',
    status: 'present',
    tasksDone: 7,
    tasksTotal: 8,
    productivityPct: 88,
    meetingHours: '1h 30m',
    meetingCount: 2
  },
  {
    id: 'tue',
    dayLabel: 'Tue',
    date: 'Jun 10',
    isToday: false,
    clockIn: '09:15 AM',
    clockOut: '06:45 PM',
    sessionTime: '9h 02m',
    breakTime: '42m',
    status: 'present',
    tasksDone: 5,
    tasksTotal: 6,
    productivityPct: 83,
    meetingHours: '2h 00m',
    meetingCount: 3
  },
  {
    id: 'wed',
    dayLabel: 'Wed',
    date: 'Jun 11',
    isToday: true,
    clockIn: '08:58 AM',
    clockOut: null,
    sessionTime: '3h 40m',
    breakTime: '20m',
    status: 'present',
    tasksDone: 2,
    tasksTotal: 6,
    productivityPct: 62,
    meetingHours: '45m',
    meetingCount: 1
  },
  {
    id: 'thu',
    dayLabel: 'Thu',
    date: 'Jun 12',
    isToday: false,
    clockIn: null,
    clockOut: null,
    sessionTime: null,
    breakTime: null,
    status: 'absent',
    tasksDone: null,
    tasksTotal: null,
    productivityPct: null,
    meetingHours: null,
    meetingCount: null
  },
  {
    id: 'fri',
    dayLabel: 'Fri',
    date: 'Jun 13',
    isToday: false,
    clockIn: null,
    clockOut: null,
    sessionTime: null,
    breakTime: null,
    status: 'absent',
    tasksDone: null,
    tasksTotal: null,
    productivityPct: null,
    meetingHours: null,
    meetingCount: null
  }
];

export const overtimeRecords: OvertimeRecord[] = [
  {
    id: 'ot-1',
    date: 'Jun 11, 2026',
    duration: '2h 30m',
    approvedBy: 'Ravi Kumar',
    reason: 'Sprint deadline deliverable for client portal release',
    tasks: [
      { id: 't1', title: 'Fix auth middleware bug', hours: 1.5 },
      { id: 't2', title: 'API endpoint testing', hours: 1 }
    ]
  },
  {
    id: 'ot-2',
    date: 'Jun 10, 2026',
    duration: '1h 45m',
    approvedBy: 'Priya S.',
    reason: 'Urgent production hotfix deployment',
    tasks: [
      { id: 't3', title: 'Deploy hotfix v2.1.3', hours: 0.75 },
      { id: 't4', title: 'Post-deploy monitoring', hours: 1 }
    ]
  },
  {
    id: 'ot-3',
    date: 'Jun 9, 2026',
    duration: '1h 15m',
    approvedBy: 'Ravi Kumar',
    reason: 'Weekly sprint planning preparation and backlog grooming',
    tasks: [
      { id: 't5', title: 'Backlog grooming notes', hours: 0.75 },
      { id: 't6', title: 'Sprint capacity sheet', hours: 0.5 }
    ]
  },
  {
    id: 'ot-4',
    date: 'Jun 6, 2026',
    duration: '3h 00m',
    approvedBy: 'Ravi Kumar',
    reason: 'Quarterly report data migration and validation',
    tasks: [
      { id: 't7', title: 'Data migration scripts', hours: 2 },
      { id: 't8', title: 'Validation & reconciliation', hours: 1 }
    ]
  },
  {
    id: 'ot-5',
    date: 'Jun 5, 2026',
    duration: '2h 00m',
    approvedBy: 'Priya S.',
    reason: 'Client demo preparation and slide deck finalization',
    tasks: [
      { id: 't9', title: 'Demo slide deck', hours: 1.25 },
      { id: 't10', title: 'Live demo walkthrough rehearsal', hours: 0.75 }
    ]
  },
  {
    id: 'ot-6',
    date: 'Jun 4, 2026',
    duration: '1h 30m',
    approvedBy: 'Ravi Kumar',
    reason: 'Critical security patch review and sign-off',
    tasks: [
      { id: 't11', title: 'Security patch code review', hours: 1 },
      { id: 't12', title: 'Sign-off documentation', hours: 0.5 }
    ]
  }
];

export const leaveSummary: LeaveSummary = {
  totalEntitlement: 18,
  used: 13,   // 3+2+3+1+1+1+1+1 = 13 days across 8 leaves
  pending: 3, // 2+1 upcoming
  remaining: 2
};

export const leaveRecords: LeaveRecord[] = [
  /* ── 8 past leaves ────────────────────────── */
  {
    id: 'lv-1',
    type: 'Annual Leave',
    startDate: 'May 5, 2026',
    endDate: 'May 7, 2026',
    days: 3,
    approvedBy: 'Ravi Kumar',
    status: 'approved',
    reason: 'Family vacation — planned trip with family over the long weekend.',
    isFuture: false
  },
  {
    id: 'lv-2',
    type: 'Sick Leave',
    startDate: 'Apr 14, 2026',
    endDate: 'Apr 15, 2026',
    days: 2,
    approvedBy: 'Priya S.',
    status: 'approved',
    reason: 'Fever and rest recommended by doctor. Medical certificate submitted.',
    isFuture: false
  },
  {
    id: 'lv-3',
    type: 'Annual Leave',
    startDate: 'Mar 20, 2026',
    endDate: 'Mar 22, 2026',
    days: 3,
    approvedBy: 'Ravi Kumar',
    status: 'approved',
    reason: 'Personal trip — pre-approved and planned two weeks in advance.',
    isFuture: false
  },
  {
    id: 'lv-6',
    type: 'Casual Leave',
    startDate: 'Feb 28, 2026',
    endDate: 'Feb 28, 2026',
    days: 1,
    approvedBy: 'Priya S.',
    status: 'approved',
    reason: 'Attended sibling\'s graduation ceremony.',
    isFuture: false
  },
  {
    id: 'lv-7',
    type: 'Sick Leave',
    startDate: 'Feb 10, 2026',
    endDate: 'Feb 10, 2026',
    days: 1,
    approvedBy: 'Ravi Kumar',
    status: 'approved',
    reason: 'Migraine — unable to work, took medical rest for the day.',
    isFuture: false
  },
  {
    id: 'lv-8',
    type: 'Casual Leave',
    startDate: 'Jan 22, 2026',
    endDate: 'Jan 22, 2026',
    days: 1,
    approvedBy: 'Priya S.',
    status: 'approved',
    reason: 'Bank-related personal work that required in-person visit.',
    isFuture: false
  },
  {
    id: 'lv-9',
    type: 'Annual Leave',
    startDate: 'Jan 6, 2026',
    endDate: 'Jan 6, 2026',
    days: 1,
    approvedBy: 'Ravi Kumar',
    status: 'approved',
    reason: 'Extended New Year break — taken as part of annual leave balance.',
    isFuture: false
  },
  {
    id: 'lv-10',
    type: 'Casual Leave',
    startDate: 'Dec 26, 2025',
    endDate: 'Dec 26, 2025',
    days: 1,
    approvedBy: 'Ravi Kumar',
    status: 'approved',
    reason: 'Post-holiday personal errand. Requested and approved a day prior.',
    isFuture: false
  },
  /* ── 2 upcoming leaves ────────────────────── */
  {
    id: 'lv-4',
    type: 'Annual Leave',
    startDate: 'Jun 25, 2026',
    endDate: 'Jun 26, 2026',
    days: 2,
    approvedBy: null,
    status: 'pending',
    reason: 'Attending a close friend\'s wedding ceremony out of town.',
    isFuture: true
  },
  {
    id: 'lv-5',
    type: 'Casual Leave',
    startDate: 'Jul 4, 2026',
    endDate: 'Jul 4, 2026',
    days: 1,
    approvedBy: null,
    status: 'pending',
    reason: 'Personal appointment — dental check-up scheduled in advance.',
    isFuture: true
  }
];

export const warningRecords: WarningRecord[] = [
  {
    id: 'w-1',
    type: 'late-clock-in',
    title: 'Late Clock-In',
    date: 'Jun 5, 2026',
    time: '10:22 AM',
    description:
      'Employee clocked in 1h 22m past the scheduled start time (09:00 AM) without prior approval or notification.',
    reportingManager: 'Ravi Kumar',
    severity: 'low'
  },
  {
    id: 'w-2',
    type: 'unauthorized-app',
    title: 'Unauthorized App Usage',
    date: 'May 22, 2026',
    time: '03:14 PM',
    description:
      'Desktop agent detected 47 minutes of activity on a non-whitelisted social media application during core working hours.',
    reportingManager: 'Ravi Kumar',
    severity: 'medium'
  },
  {
    id: 'w-3',
    type: 'offline-too-long',
    title: 'Extended Offline Period',
    date: 'May 10, 2026',
    time: '02:00 PM',
    description:
      'No activity detected for 2h 15m during scheduled work hours. No approved break or leave on record for this period.',
    reportingManager: 'Priya S.',
    severity: 'medium'
  },
  {
    id: 'w-4',
    type: 'multiple-warnings',
    title: 'Multiple Violations',
    date: 'Apr 18, 2026',
    time: '11:45 AM',
    description:
      'Third occurrence of a policy violation within a 30-day window. A formal notice has been raised and escalated to HR.',
    reportingManager: 'Ravi Kumar',
    severity: 'high'
  },
  {
    id: 'w-5',
    type: 'policy-breach',
    title: 'Policy Breach',
    date: 'Apr 2, 2026',
    time: '04:30 PM',
    description:
      'Screen-sharing session initiated with an external party outside of approved collaboration tools, in violation of the data security policy.',
    reportingManager: 'Priya S.',
    severity: 'high'
  }
];

/* ── Monthly clock history (Jun 2026) ────────── */
export interface MonthClockRecord {
  id: string;
  date: string;
  dayLabel: string;
  clockIn: string | null;
  clockOut: string | null;
  sessionTime: string | null;
  status: 'present' | 'absent' | 'weekend' | 'holiday';
  tasksDone: number | null;
  tasksTotal: number | null;
  productivityPct: number | null;
  meetingHours: string | null;
  meetingCount: number | null;
}

type MP = Pick<MonthClockRecord, 'tasksDone'|'tasksTotal'|'productivityPct'|'meetingHours'|'meetingCount'>;
const empty: MP = { tasksDone: null, tasksTotal: null, productivityPct: null, meetingHours: null, meetingCount: null };

export const monthClockHistory: MonthClockRecord[] = [
  { id: 'm-1',  date: 'Jun 1',  dayLabel: 'Sun', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'weekend', ...empty },
  { id: 'm-2',  date: 'Jun 2',  dayLabel: 'Mon', clockIn: '09:05 AM', clockOut: '06:20 PM', sessionTime: '8h 55m', status: 'present', tasksDone: 6, tasksTotal: 7, productivityPct: 85, meetingHours: '1h 15m', meetingCount: 2 },
  { id: 'm-3',  date: 'Jun 3',  dayLabel: 'Tue', clockIn: '08:58 AM', clockOut: '06:10 PM', sessionTime: '8h 52m', status: 'present', tasksDone: 5, tasksTotal: 6, productivityPct: 83, meetingHours: '2h 00m', meetingCount: 3 },
  { id: 'm-4',  date: 'Jun 4',  dayLabel: 'Wed', clockIn: '09:22 AM', clockOut: '06:30 PM', sessionTime: '8h 28m', status: 'present', tasksDone: 4, tasksTotal: 5, productivityPct: 80, meetingHours: '45m',    meetingCount: 1 },
  { id: 'm-5',  date: 'Jun 5',  dayLabel: 'Thu', clockIn: '10:22 AM', clockOut: '06:45 PM', sessionTime: '7h 43m', status: 'present', tasksDone: 3, tasksTotal: 5, productivityPct: 60, meetingHours: '1h 30m', meetingCount: 2 },
  { id: 'm-6',  date: 'Jun 6',  dayLabel: 'Fri', clockIn: '09:00 AM', clockOut: '06:00 PM', sessionTime: '9h 00m', status: 'present', tasksDone: 7, tasksTotal: 8, productivityPct: 88, meetingHours: '30m',    meetingCount: 1 },
  { id: 'm-7',  date: 'Jun 7',  dayLabel: 'Sat', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'weekend', ...empty },
  { id: 'm-8',  date: 'Jun 8',  dayLabel: 'Sun', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'weekend', ...empty },
  { id: 'm-9',  date: 'Jun 9',  dayLabel: 'Mon', clockIn: '09:02 AM', clockOut: '06:18 PM', sessionTime: '8h 46m', status: 'present', tasksDone: 7, tasksTotal: 8, productivityPct: 88, meetingHours: '1h 30m', meetingCount: 2 },
  { id: 'm-10', date: 'Jun 10', dayLabel: 'Tue', clockIn: '09:15 AM', clockOut: '06:45 PM', sessionTime: '9h 02m', status: 'present', tasksDone: 5, tasksTotal: 6, productivityPct: 83, meetingHours: '2h 00m', meetingCount: 3 },
  { id: 'm-11', date: 'Jun 11', dayLabel: 'Wed', clockIn: '08:58 AM', clockOut: null,       sessionTime: '3h 40m', status: 'present', tasksDone: 2, tasksTotal: 6, productivityPct: 62, meetingHours: '45m',    meetingCount: 1 },
  { id: 'm-12', date: 'Jun 12', dayLabel: 'Thu', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'absent',  ...empty },
  { id: 'm-13', date: 'Jun 13', dayLabel: 'Fri', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'absent',  ...empty },
  { id: 'm-14', date: 'Jun 14', dayLabel: 'Sat', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'weekend', ...empty },
  { id: 'm-15', date: 'Jun 15', dayLabel: 'Sun', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'weekend', ...empty },
  { id: 'm-16', date: 'Jun 16', dayLabel: 'Mon', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'absent',  ...empty },
  { id: 'm-17', date: 'Jun 17', dayLabel: 'Tue', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'absent',  ...empty },
  { id: 'm-18', date: 'Jun 18', dayLabel: 'Wed', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'absent',  ...empty },
  { id: 'm-19', date: 'Jun 19', dayLabel: 'Thu', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'absent',  ...empty },
  { id: 'm-20', date: 'Jun 20', dayLabel: 'Fri', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'absent',  ...empty },
  { id: 'm-21', date: 'Jun 21', dayLabel: 'Sat', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'weekend', ...empty },
  { id: 'm-22', date: 'Jun 22', dayLabel: 'Sun', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'weekend', ...empty },
  { id: 'm-23', date: 'Jun 23', dayLabel: 'Mon', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'absent',  ...empty },
  { id: 'm-24', date: 'Jun 24', dayLabel: 'Tue', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'absent',  ...empty },
  { id: 'm-25', date: 'Jun 25', dayLabel: 'Wed', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'absent',  ...empty },
  { id: 'm-26', date: 'Jun 26', dayLabel: 'Thu', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'absent',  ...empty },
  { id: 'm-27', date: 'Jun 27', dayLabel: 'Fri', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'absent',  ...empty },
  { id: 'm-28', date: 'Jun 28', dayLabel: 'Sat', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'weekend', ...empty },
  { id: 'm-29', date: 'Jun 29', dayLabel: 'Sun', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'weekend', ...empty },
  { id: 'm-30', date: 'Jun 30', dayLabel: 'Mon', clockIn: null,       clockOut: null,       sessionTime: null,     status: 'absent',  ...empty }
];
