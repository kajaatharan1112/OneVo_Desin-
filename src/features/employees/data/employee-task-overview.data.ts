export interface TaskListItem {
  id: string;
  label: string;
  done: boolean;
}

export interface TodayActionItem {
  id: string;
  label: string;
  time?: string;
  kind: 'birthday' | 'meeting' | 'reminder' | 'report';
}

export interface NotificationSummaryItem {
  id: string;
  module: string;
  type: string;
  count: number;
}

export interface WeeklyPlanDay {
  day: string;
  planned: number;
  finished: number;
  pending: number;
}

export interface YesterdayWorkItem {
  id: string;
  title: string;
  status: 'approved' | 'pending' | 'issue' | 'cleared';
  detail: string;
}

export const employeeTaskOverviewMetrics = {
  sprintFinished: 12,
  sprintTotal: 15,
  notificationsReceived: 8,
  targetWorkHours: 40,
  completedWorkHours: 22,
  targetTasks: 15,
  completedTasks: 12
};

/** Fixed navbar date (design reference: 12 Nov 2025, Wednesday). */
export const appNavDateLabel = 'Wednesday, 12 November 2025';

/** Yesterday status panel date (day before navbar reference date). */
export const yesterdayStatusDateLabel = '11 November 2025';

export function getWorkWeekDaysRemaining(): number {
  const { completedWorkHours, targetWorkHours } = employeeTaskOverviewMetrics;
  const hoursPerWorkDay = targetWorkHours / 5;
  const daysComplete = Math.min(5, Math.max(0, Math.round(completedWorkHours / hoursPerWorkDay)));
  return Math.max(0, 5 - daysComplete);
}

export function getSprintCompletedPercent(): number {
  const { sprintFinished, sprintTotal } = employeeTaskOverviewMetrics;
  return sprintTotal > 0 ? Math.round((sprintFinished / sprintTotal) * 100) : 0;
}

export const pendingTasks: TaskListItem[] = [
  { id: 'p1', label: 'Review API contract draft', done: false },
  { id: 'p2', label: 'Update sprint board comments', done: false },
  { id: 'p3', label: 'Send standup summary', done: true }
];

export const todayPlanTasks: TaskListItem[] = [
  { id: 't1', label: 'Finish Q2 report section 2', done: false },
  { id: 't2', label: 'Client call prep notes', done: true },
  { id: 't3', label: 'Submit timesheet', done: false },
  { id: 't4', label: 'Peer review PR #248', done: false }
];

export const todayActions: TodayActionItem[] = [
  { id: 'a1', label: "Priya's birthday", time: 'All day', kind: 'birthday' },
  { id: 'a2', label: 'Design sync', time: '10:30 AM', kind: 'meeting' },
  { id: 'a3', label: 'Submit weekly report', time: '5:00 PM', kind: 'report' },
  { id: 'a4', label: 'Renew security training', time: 'Reminder', kind: 'reminder' }
];

export const notificationSummary: NotificationSummaryItem[] = [
  { id: 'n1', module: 'Requests', type: 'Approval', count: 3 },
  { id: 'n2', module: 'Attendance', type: 'Alert', count: 2 },
  { id: 'n3', module: 'Tasks', type: 'Review', count: 4 },
  { id: 'n4', module: 'System', type: 'Warning', count: 1 },
  { id: 'n5', module: 'Calendar', type: 'Reminder', count: 2 }
];

export const weeklyPlan: WeeklyPlanDay[] = [
  { day: 'Mon', planned: 8, finished: 7, pending: 1 },
  { day: 'Tue', planned: 7, finished: 6, pending: 1 },
  { day: 'Wed', planned: 8, finished: 8, pending: 0 },
  { day: 'Thu', planned: 6, finished: 4, pending: 2 },
  { day: 'Fri', planned: 7, finished: 3, pending: 4 },
  { day: 'Sat', planned: 2, finished: 1, pending: 1 },
  { day: 'Sun', planned: 1, finished: 0, pending: 1 }
];

export const yesterdayWork: YesterdayWorkItem[] = [
  {
    id: 'y1',
    title: 'PR #241 — Dashboard filters',
    status: 'approved',
    detail: 'Approved by lead · merged to develop'
  },
  {
    id: 'y2',
    title: 'PR #239 — Attendance export',
    status: 'approved',
    detail: 'Approved · no follow-up issues'
  },
  {
    id: 'y3',
    title: 'Client demo deck',
    status: 'cleared',
    detail: 'Delivered on time · stakeholder signed off'
  },
  {
    id: 'y4',
    title: 'Sprint retro action items',
    status: 'cleared',
    detail: 'All 4 follow-ups closed · documented in wiki'
  },
  {
    id: 'y5',
    title: 'PR #238 — Notification panel',
    status: 'approved',
    detail: 'Code review passed · ready for release branch'
  },
  {
    id: 'y6',
    title: 'Timesheet correction request',
    status: 'approved',
    detail: 'HR approved adjusted hours · payroll synced'
  },
  {
    id: 'y7',
    title: 'API load test report',
    status: 'cleared',
    detail: 'Metrics within SLA · no regressions flagged'
  }
];

export const yesterdayAllClear = true;
