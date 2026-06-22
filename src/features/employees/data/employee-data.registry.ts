import type { EmployeeId } from '../types/employee.types';
import type {
  AchievementItem,
  DecisionItem,
  GoalItem,
  GoalPlanItem
} from './employee-goals.data';
interface TaskListItem {
  id: string;
  label: string;
  done: boolean;
}

interface TodayActionItem {
  id: string;
  label: string;
  time?: string;
  kind: 'birthday' | 'meeting' | 'reminder' | 'report';
}

interface NotificationSummaryItem {
  id: string;
  module: string;
  type: string;
  count: number;
}

interface WeeklyPlanDay {
  day: string;
  planned: number;
  finished: number;
  pending: number;
}

interface YesterdayWorkItem {
  id: string;
  title: string;
  status: 'approved' | 'pending' | 'issue' | 'cleared';
  detail: string;
}

export interface EmployeeTaskOverviewMetrics {
  sprintFinished: number;
  sprintTotal: number;
  notificationsReceived: number;
  targetWorkHours: number;
  completedWorkHours: number;
  targetTasks: number;
  completedTasks: number;
}

export interface EmployeeGoalsSummary {
  activePlans: number;
  activeGoals: number;
  achievementsCount: number;
  decisionsCount: number;
}

export interface EmployeeSummaryCardSnapshot {
  taskOverviewValue: string;
  taskOverviewDesc: string;
  requestsValue: string;
  requestsDesc: string;
  activityValue: string;
  activityDesc: string;
}

export interface CeoSummaryCardItem {
  id: 'workforce-availability' | 'company-performance' | 'productivity' | 'my-priorities' | 'project-health' | 'schedule';
  title: string;
  value: string;
  desc: string;
  delta: string;
  status: 'green' | 'amber' | 'red';
  color: string;
  actionLabel?: string;
  actionTab?: string;
}

export interface EmployeeDataBundle {
  taskOverviewMetrics: EmployeeTaskOverviewMetrics;
  pendingTasks: TaskListItem[];
  todayPlanTasks: TaskListItem[];
  todayActions: TodayActionItem[];
  notificationSummary: NotificationSummaryItem[];
  weeklyPlan: WeeklyPlanDay[];
  yesterdayWork: YesterdayWorkItem[];
  yesterdayAllClear: boolean;
  goalsSummary: EmployeeGoalsSummary;
  goalPlans: GoalPlanItem[];
  goals: GoalItem[];
  achievements: AchievementItem[];
  decisions: DecisionItem[];
  summaryCards: EmployeeSummaryCardSnapshot;
  ceoSummaryCards?: CeoSummaryCardItem[];
}

const alexData: EmployeeDataBundle = {
  taskOverviewMetrics: {
    sprintFinished: 12,
    sprintTotal: 15,
    notificationsReceived: 8,
    targetWorkHours: 40,
    completedWorkHours: 22,
    targetTasks: 15,
    completedTasks: 12
  },
  pendingTasks: [
    { id: 'p1', label: 'Review API contract draft', done: false },
    { id: 'p2', label: 'Update sprint board comments', done: false },
    { id: 'p3', label: 'Send standup summary', done: true }
  ],
  todayPlanTasks: [
    { id: 't1', label: 'Finish Q2 report section 2', done: false },
    { id: 't2', label: 'Client call prep notes', done: true },
    { id: 't3', label: 'Submit timesheet', done: false },
    { id: 't4', label: 'Peer review PR #248', done: false }
  ],
  todayActions: [
    { id: 'a1', label: "Priya's birthday", time: 'All day', kind: 'birthday' },
    { id: 'a2', label: 'Design sync', time: '10:30 AM', kind: 'meeting' },
    { id: 'a3', label: 'Submit weekly report', time: '5:00 PM', kind: 'report' },
    { id: 'a4', label: 'Renew security training', time: 'Reminder', kind: 'reminder' }
  ],
  notificationSummary: [
    { id: 'n1', module: 'Requests', type: 'Approval', count: 3 },
    { id: 'n2', module: 'Attendance', type: 'Alert', count: 2 },
    { id: 'n3', module: 'Tasks', type: 'Review', count: 4 },
    { id: 'n4', module: 'System', type: 'Warning', count: 1 },
    { id: 'n5', module: 'Calendar', type: 'Reminder', count: 2 }
  ],
  weeklyPlan: [
    { day: 'Mon', planned: 8, finished: 7, pending: 1 },
    { day: 'Tue', planned: 7, finished: 6, pending: 1 },
    { day: 'Wed', planned: 8, finished: 8, pending: 0 },
    { day: 'Thu', planned: 6, finished: 4, pending: 2 },
    { day: 'Fri', planned: 7, finished: 3, pending: 4 },
    { day: 'Sat', planned: 2, finished: 1, pending: 1 },
    { day: 'Sun', planned: 1, finished: 0, pending: 1 }
  ],
  yesterdayWork: [
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
  ],
  yesterdayAllClear: true,
  goalsSummary: {
    activePlans: 4,
    activeGoals: 6,
    achievementsCount: 3,
    decisionsCount: 2
  },
  goalPlans: [
    {
      id: 'pl1',
      title: 'Q4 delivery roadmap',
      progress: 72,
      dueLabel: 'Due 28 Nov',
      status: 'on-track'
    },
    {
      id: 'pl2',
      title: 'Skills uplift — React & system design',
      progress: 45,
      dueLabel: 'Due 15 Dec',
      status: 'at-risk'
    },
    {
      id: 'pl3',
      title: 'Client onboarding excellence',
      progress: 88,
      dueLabel: 'Due 10 Nov',
      status: 'on-track'
    },
    {
      id: 'pl4',
      title: 'Team mentorship program',
      progress: 100,
      dueLabel: 'Completed',
      status: 'completed'
    }
  ],
  goals: [
    { id: 'g1', label: 'Ship workspace v2 beta', planId: 'pl1', progress: 80 },
    { id: 'g2', label: 'Close 3 high-priority bugs', planId: 'pl1', progress: 65 },
    { id: 'g3', label: 'Complete advanced TypeScript course', planId: 'pl2', progress: 40 },
    { id: 'g4', label: 'Publish internal design doc', planId: 'pl2', progress: 50 },
    { id: 'g5', label: 'Run 2 client demo sessions', planId: 'pl3', progress: 90 },
    { id: 'g6', label: 'Mentor 2 junior developers', planId: 'pl4', progress: 100 }
  ],
  achievements: [
    {
      id: 'a1',
      title: 'Sprint MVP shipped on time',
      dateLabel: '8 Nov 2025',
      impact: 'Team velocity +18%'
    },
    {
      id: 'a2',
      title: 'Zero P1 incidents — 30 days',
      dateLabel: '1 Nov 2025',
      impact: 'Stability award'
    },
    {
      id: 'a3',
      title: 'Peer review champion',
      dateLabel: '25 Oct 2025',
      impact: '12 PRs reviewed'
    }
  ],
  decisions: [
    {
      id: 'd1',
      title: 'Adopt shared chart theme tokens',
      dateLabel: '6 Nov 2025',
      outcome: 'approved',
      note: 'Design + engineering aligned'
    },
    {
      id: 'd2',
      title: 'Defer mobile goals view to Q1',
      dateLabel: '3 Nov 2025',
      outcome: 'deferred',
      note: 'Focus desktop workspace first'
    }
  ],
  summaryCards: {
    taskOverviewValue: '12 / 15 ',
    taskOverviewDesc: 'Sprint completed · 8 notifications',
    requestsValue: '24 received',
    requestsDesc: '7 pending approval',
    activityValue: '8 leaves left',
    activityDesc: 'Clock in today: 9:15 AM'
  }
};

const marcusData: EmployeeDataBundle = {
  taskOverviewMetrics: {
    sprintFinished: 8,
    sprintTotal: 10,
    notificationsReceived: 12,
    targetWorkHours: 40,
    completedWorkHours: 28,
    targetTasks: 10,
    completedTasks: 8
  },
  pendingTasks: [
    { id: 'mp1', label: 'Review Q4 board presentation deck', done: false },
    { id: 'mp2', label: 'Approve department budget proposals', done: false },
    { id: 'mp3', label: 'Sign off investor relations update', done: true }
  ],
  todayPlanTasks: [
    { id: 'mt1', label: 'Leadership sync — quarterly priorities', done: true },
    { id: 'mt2', label: 'Finalize all-hands keynote outline', done: false },
    { id: 'mt3', label: 'Strategic partner call prep', done: false },
    { id: 'mt4', label: 'Review enterprise roadmap draft', done: false }
  ],
  todayActions: [
    { id: 'ma1', label: 'Board meeting prep', time: '9:00 AM', kind: 'meeting' },
    { id: 'ma2', label: 'Investor lunch', time: '12:30 PM', kind: 'meeting' },
    { id: 'ma3', label: 'Quarterly review submission', time: '4:00 PM', kind: 'report' },
    { id: 'ma4', label: 'Executive offsite reminder', time: 'Reminder', kind: 'reminder' }
  ],
  notificationSummary: [
    { id: 'mn1', module: 'Executive', type: 'Approval', count: 5 },
    { id: 'mn2', module: 'Board', type: 'Review', count: 2 },
    { id: 'mn3', module: 'Finance', type: 'Alert', count: 1 },
    { id: 'mn4', module: 'People', type: 'Update', count: 3 },
    { id: 'mn5', module: 'Calendar', type: 'Reminder', count: 4 }
  ],
  weeklyPlan: [
    { day: 'Mon', planned: 6, finished: 6, pending: 0 },
    { day: 'Tue', planned: 7, finished: 5, pending: 2 },
    { day: 'Wed', planned: 8, finished: 7, pending: 1 },
    { day: 'Thu', planned: 5, finished: 4, pending: 1 },
    { day: 'Fri', planned: 6, finished: 3, pending: 3 },
    { day: 'Sat', planned: 1, finished: 0, pending: 1 },
    { day: 'Sun', planned: 0, finished: 0, pending: 0 }
  ],
  yesterdayWork: [
    {
      id: 'my1',
      title: 'FY26 strategic plan — final draft',
      status: 'approved',
      detail: 'Executive committee aligned · ready for board review'
    },
    {
      id: 'my2',
      title: 'Enterprise expansion budget',
      status: 'approved',
      detail: 'CFO sign-off received · finance team notified'
    },
    {
      id: 'my3',
      title: 'Leadership offsite agenda',
      status: 'cleared',
      detail: 'All session owners confirmed · venue booked'
    },
    {
      id: 'my4',
      title: 'Customer advisory board invite',
      status: 'cleared',
      detail: '12 executives confirmed · materials distributed'
    },
    {
      id: 'my5',
      title: 'Head of Sales offer letter',
      status: 'approved',
      detail: 'Compensation approved · HR processing start date'
    }
  ],
  yesterdayAllClear: true,
  goalsSummary: {
    activePlans: 3,
    activeGoals: 5,
    achievementsCount: 5,
    decisionsCount: 4
  },
  goalPlans: [
    {
      id: 'mpl1',
      title: 'FY26 company OKRs',
      progress: 68,
      dueLabel: 'Due 31 Dec',
      status: 'on-track'
    },
    {
      id: 'mpl2',
      title: 'Enterprise revenue growth',
      progress: 82,
      dueLabel: 'Due 30 Nov',
      status: 'on-track'
    },
    {
      id: 'mpl3',
      title: 'Leadership team expansion',
      progress: 55,
      dueLabel: 'Due 15 Jan',
      status: 'at-risk'
    }
  ],
  goals: [
    { id: 'mg1', label: 'Reach $12M ARR milestone', planId: 'mpl2', progress: 85 },
    { id: 'mg2', label: 'Launch 2 new enterprise tiers', planId: 'mpl1', progress: 70 },
    { id: 'mg3', label: 'Improve NPS to 62+', planId: 'mpl1', progress: 60 },
    { id: 'mg4', label: 'Hire VP Sales & VP Product', planId: 'mpl3', progress: 50 },
    { id: 'mg5', label: 'Complete board Q4 review cycle', planId: 'mpl1', progress: 75 }
  ],
  achievements: [
    {
      id: 'ma1',
      title: 'Record Q3 revenue — $2.8M',
      dateLabel: '5 Nov 2025',
      impact: 'Beat forecast by 14%'
    },
    {
      id: 'ma2',
      title: 'Enterprise client win — Apex Corp',
      dateLabel: '28 Oct 2025',
      impact: '$480K annual contract'
    },
    {
      id: 'ma3',
      title: 'Team headcount growth +22%',
      dateLabel: '15 Oct 2025',
      impact: '45 new hires onboarded'
    },
    {
      id: 'ma4',
      title: 'ISO 27001 certification achieved',
      dateLabel: '1 Oct 2025',
      impact: 'Enterprise trust milestone'
    },
    {
      id: 'ma5',
      title: 'Best Workplace award — SaaS category',
      dateLabel: '20 Sep 2025',
      impact: 'Industry recognition'
    }
  ],
  decisions: [
    {
      id: 'md1',
      title: 'Approve APAC market entry',
      dateLabel: '7 Nov 2025',
      outcome: 'approved',
      note: 'Pilot launch scheduled for Q1 FY26'
    },
    {
      id: 'md2',
      title: 'Increase R&D allocation to 18%',
      dateLabel: '4 Nov 2025',
      outcome: 'approved',
      note: 'Board endorsed innovation roadmap'
    },
    {
      id: 'md3',
      title: 'Defer consumer tier sunset',
      dateLabel: '1 Nov 2025',
      outcome: 'deferred',
      note: 'Revisit after enterprise migration complete'
    },
    {
      id: 'md4',
      title: 'Executive compensation review',
      dateLabel: '29 Oct 2025',
      outcome: 'pending',
      note: 'Comp committee review in progress'
    }
  ],
  summaryCards: {
    taskOverviewValue: '8 / 10 ',
    taskOverviewDesc: 'Strategic initiatives · 12 notifications',
    requestsValue: '18 received',
    requestsDesc: '5 executive approvals pending',
    activityValue: '4 meetings today',
    activityDesc: 'Next: Board prep at 9:00 AM'
  },
  ceoSummaryCards: [
    {
      id: 'my-priorities',
      title: 'My Priorities',
      value: '14',
      desc: 'Meetings, approvals & escalations',
      delta: '4 approvals pending',
      status: 'amber',
      color: 'var(--ceo-performance-color, var(--accent))'
    },
    {
      id: 'productivity',
      title: 'Productivity',
      value: '82%',
      desc: 'Delivery & task output',
      delta: '+6% vs last week',
      status: 'green',
      color: 'var(--nexus-success)'
    },
    {
      id: 'workforce-availability',
      title: 'Availability',
      value: '1,248',
      desc: 'Workforce active today',
      delta: '+2.1% vs last week',
      status: 'green',
      color: 'var(--accent)',
      actionLabel: 'View People →',
      actionTab: 'People'
    },
    {
      id: 'company-performance',
      title: 'Performance',
      value: '86%',
      desc: 'Delivery, output & company health',
      delta: '+4% vs last month',
      status: 'green',
      color: 'var(--ceo-performance-color, var(--accent))'
    },
  ]
};

const employeeDataRegistry: Record<EmployeeId, EmployeeDataBundle> = {
  alex: alexData,
  marcus: marcusData,
  manager: {
    ...alexData,
    summaryCards: {
      taskOverviewValue: '5 / 8',
      taskOverviewDesc: 'Team approvals · 3 direct reports',
      requestsValue: '6 received',
      requestsDesc: '2 leave approvals pending',
      activityValue: '2 meetings today',
      activityDesc: 'Next: Team sync at 2:00 PM'
    }
  }
};

export function getEmployeeData(id: EmployeeId): EmployeeDataBundle {
  return employeeDataRegistry[id] ?? employeeDataRegistry.alex;
}

export function getSprintCompletedPercent(metrics: EmployeeTaskOverviewMetrics): number {
  const { sprintFinished, sprintTotal } = metrics;
  return sprintTotal > 0 ? Math.round((sprintFinished / sprintTotal) * 100) : 0;
}

export function getWorkWeekDaysRemaining(metrics: EmployeeTaskOverviewMetrics): number {
  const { completedWorkHours, targetWorkHours } = metrics;
  const hoursPerWorkDay = targetWorkHours / 5;
  const daysComplete = Math.min(5, Math.max(0, Math.round(completedWorkHours / hoursPerWorkDay)));
  return Math.max(0, 5 - daysComplete);
}
