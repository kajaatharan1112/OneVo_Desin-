export interface WorkDashboardSummary {
  totalTasks: number;
  pendingTasks: number;
  sprintCompletedPercent: number;
}

export interface WorkDashboardTodayTask {
  id: string;
  title: string;
  description: string;
  dueLabel: string;
  workplace: string;
  assignedBy: string;
  allocatedTime: string;
}

export interface WorkDashboardHourMetric {
  target: number;
  actual: number;
}

export type WorkDashboardReminderType =
  | 'meeting'
  | 'birthday'
  | 'report'
  | 'knowledge'
  | 'update';

export interface WorkDashboardReminder {
  id: string;
  title: string;
  timeLabel: string;
  type: WorkDashboardReminderType;
}

export type WorkDashboardWorkMode = 'onsite' | 'wfh';

export interface WorkDashboardProfileWeekDay {
  id: string;
  dayLabel: string;
  mode: WorkDashboardWorkMode;
  clockInTime?: string;
  isToday?: boolean;
}

export interface WorkDashboardProfileSnapshot {
  agentConnected: boolean;
  agentOnline: boolean;
  role: string;
  department: string;
  sessionDuration: string;
  weekSchedule: WorkDashboardProfileWeekDay[];
}

export type WorkDashboardYesterdayCategory =
  | 'task-approved'
  | 'task-pending'
  | 'meeting-completed';

export interface WorkDashboardYesterdayItem {
  id: string;
  title: string;
  category: WorkDashboardYesterdayCategory;
  statusLabel: string;
  reviewedBy: string;
  duration: string;
  completedAt: string;
  description: string;
  comments: string;
}

export interface WorkDashboardSprintDay {
  day: string;
  planned: number;
  finished: number;
}

export const workDashboardSummary: WorkDashboardSummary = {
  totalTasks: 21,
  pendingTasks: 13,
  sprintCompletedPercent: 68
};

export const workDashboardTodayTasks: WorkDashboardTodayTask[] = [
  {
    id: 'wt-1',
    title: 'Finish Q2 report section 2',
    description: 'Complete analytics section with updated KPI charts and executive summary notes.',
    dueLabel: 'Due today · 5:00 PM',
    workplace: 'OneVo Design',
    assignedBy: 'Arjun M.',
    allocatedTime: '3h'
  },
  {
    id: 'wt-2',
    title: 'Review API contract draft',
    description: 'Validate endpoint changes with platform team before sprint review.',
    dueLabel: 'Due today · 3:30 PM',
    workplace: 'Platform Team',
    assignedBy: 'Priya R.',
    allocatedTime: '1h 30m'
  },
  {
    id: 'wt-3',
    title: 'Update sprint board comments',
    description: 'Sync blockers and carry-over tasks for ONEVO-S4 standup.',
    dueLabel: 'Due today · EOD',
    workplace: 'OneVo Design',
    assignedBy: 'Self',
    allocatedTime: '45m'
  },
  {
    id: 'wt-4',
    title: 'Peer review attendance insight card',
    description: 'Check responsive layout and chart token usage in light theme.',
    dueLabel: 'Due today · 4:15 PM',
    workplace: 'Product Design',
    assignedBy: 'Kiran S.',
    allocatedTime: '2h'
  },
  {
    id: 'wt-5',
    title: 'Prepare demo talking points',
    description: 'Outline workspace dashboard flow for internal product review.',
    dueLabel: 'Due today · 6:00 PM',
    workplace: 'OneVo Design',
    assignedBy: 'Arjun M.',
    allocatedTime: '1h'
  }
];

export const workDashboardWorkHours: WorkDashboardHourMetric = {
  target: 40,
  actual: 28
};

export const workDashboardTaskHours: WorkDashboardHourMetric = {
  target: 32,
  actual: 21
};

export const workDashboardReminders: WorkDashboardReminder[] = [
  {
    id: 'rm-1',
    title: 'Sprint review with product',
    timeLabel: '10:30 AM',
    type: 'meeting'
  },
  {
    id: 'rm-2',
    title: 'Design sync — profile screens',
    timeLabel: '1:00 PM',
    type: 'meeting'
  },
  {
    id: 'rm-3',
    title: 'Sarah Kumar — birthday',
    timeLabel: 'All day',
    type: 'birthday'
  },
  {
    id: 'rm-4',
    title: 'Weekly status report submission',
    timeLabel: '4:00 PM',
    type: 'report'
  },
  {
    id: 'rm-5',
    title: 'Knowledge transfer — API gateway',
    timeLabel: '5:30 PM',
    type: 'knowledge'
  },
  {
    id: 'rm-6',
    title: 'Policy update published in workspace',
    timeLabel: 'Today',
    type: 'update'
  }
];

export const workDashboardProfileSnapshot: WorkDashboardProfileSnapshot = {
  agentConnected: true,
  agentOnline: true,
  role: 'UI Engineer',
  department: 'Product Design',
  sessionDuration: '3h 40m',
  weekSchedule: [
    { id: 'mon', dayLabel: 'Mon', mode: 'onsite', clockInTime: '9:02 AM' },
    { id: 'tue', dayLabel: 'Tue', mode: 'wfh', clockInTime: '9:08 AM' },
    { id: 'wed', dayLabel: 'Wed', mode: 'wfh', clockInTime: '9:15 AM', isToday: true },
    { id: 'thu', dayLabel: 'Thu', mode: 'wfh' },
    { id: 'fri', dayLabel: 'Fri', mode: 'onsite' }
  ]
};

export const workDashboardTodayHighlight = {
  label: '5 open tasks',
  detail: '2 pending · 4 today plan'
};

export const workDashboardYesterdayHighlight = {
  label: 'All clear',
  detail: '7 works completed · PRs approved · no open complaints'
};

export const workDashboardYesterdayItems: WorkDashboardYesterdayItem[] = [
  {
    id: 'ys-1',
    title: 'PR #241 — Dashboard filters',
    category: 'task-approved',
    statusLabel: 'Approved',
    reviewedBy: 'Arjun M.',
    duration: '1h 20m',
    completedAt: '5:30 PM',
    description: 'Implemented dynamic filter controls for the main dashboard with debounce and URL sync.',
    comments: 'Arjun M.: "Looks good, merged to main. Minor style tweak applied on review."'
  },
  {
    id: 'ys-2',
    title: 'Leave policy copy review',
    category: 'task-pending',
    statusLabel: 'Pending approval',
    reviewedBy: 'Priya R.',
    duration: '45m',
    completedAt: '3:15 PM',
    description: 'Reviewed updated leave policy document and added inline comments for HR team.',
    comments: 'Priya R.: "Needs final sign-off from manager before publishing."'
  },
  {
    id: 'ys-3',
    title: 'Client demo deck',
    category: 'task-approved',
    statusLabel: 'Approved',
    reviewedBy: 'Kiran S.',
    duration: '2h',
    completedAt: '4:00 PM',
    description: 'Prepared 12-slide presentation deck covering product roadmap and live demo walkthrough.',
    comments: 'Kiran S.: "Excellent work. Deck sent to client. No revisions needed."'
  },
  {
    id: 'ys-4',
    title: 'Sprint planning workshop',
    category: 'meeting-completed',
    statusLabel: 'Completed',
    reviewedBy: 'Arjun M. (host)',
    duration: '45 min',
    completedAt: '11:45 AM',
    description: 'Participated in S4 sprint planning. Allocated 38 story points across 6 members.',
    comments: 'Notes shared on Confluence. Next sprint starts Monday.'
  },
  {
    id: 'ys-5',
    title: 'Attendance tab KPI alignment',
    category: 'task-approved',
    statusLabel: 'Approved',
    reviewedBy: 'Priya R.',
    duration: '1h 10m',
    completedAt: '6:00 PM',
    description: 'Aligned attendance KPI metrics with design tokens and verified data accuracy.',
    comments: 'Priya R.: "Approved. Deploy in next release cycle."'
  },
  {
    id: 'ys-6',
    title: 'Vendor contract review notes',
    category: 'task-pending',
    statusLabel: 'Awaiting manager',
    reviewedBy: 'Rahul D.',
    duration: '30m',
    completedAt: '2:45 PM',
    description: 'Documented key clauses and risk areas in the vendor SLA for legal team review.',
    comments: 'Rahul D.: "Escalated to Anand for final review. Awaiting response."'
  }
];

export const workDashboardSprintPlan: WorkDashboardSprintDay[] = [
  { day: 'Mon', planned: 7, finished: 6 },
  { day: 'Tue', planned: 8, finished: 7 },
  { day: 'Wed', planned: 6, finished: 5 },
  { day: 'Thu', planned: 7, finished: 5 },
  { day: 'Fri', planned: 5, finished: 2 },
  { day: 'Sat', planned: 3, finished: 1 },
  { day: 'Sun', planned: 2, finished: 0 }
];
