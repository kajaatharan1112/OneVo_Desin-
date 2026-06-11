import type {
  BlockerRiskItem,
  OpenTaskItem,
  PriorityQueueGroup,
  QuickWorkAction,
  TaskCompletionMetrics,
  WeeklyTaskDay,
  WorkHoursBreakdown,
  YesterdayStatusItem
} from '../types/employee-task-overview.types';

export const employeeTaskOverviewMetrics = {
  sprintFinished: 12,
  sprintTotal: 15,
  notificationsReceived: 8
};

/** Fixed navbar date (design reference: 12 Nov 2025, Wednesday). */
export const appNavDateLabel = 'Wednesday, 12 November 2025';

export const openTasks: OpenTaskItem[] = [
  {
    id: 'ot-1',
    title: 'Finish Q2 report section 2',
    status: 'in-progress',
    priority: 'high',
    dueLabel: 'Due today'
  },
  {
    id: 'ot-2',
    title: 'Peer review PR #248',
    status: 'review',
    priority: 'high',
    dueLabel: 'Due today'
  },
  {
    id: 'ot-3',
    title: 'Update sprint board comments',
    status: 'open',
    priority: 'medium',
    dueLabel: 'Due tomorrow'
  },
  {
    id: 'ot-4',
    title: 'Review API contract draft',
    status: 'open',
    priority: 'medium',
    dueLabel: 'Wed'
  },
  {
    id: 'ot-5',
    title: 'Send standup summary',
    status: 'open',
    priority: 'low',
    dueLabel: 'Fri'
  },
  {
    id: 'ot-6',
    title: 'Document auth flow changes',
    status: 'open',
    priority: 'low',
    dueLabel: 'Next sprint'
  }
];

export const workHoursBreakdown: WorkHoursBreakdown = {
  focus: 14,
  meeting: 5,
  break: 3,
  completed: 22,
  expected: 40
};

export const taskCompletionMetrics: TaskCompletionMetrics = {
  completed: 12,
  planned: 15
};

export const priorityWorkQueue: PriorityQueueGroup[] = [
  {
    id: 'overdue',
    title: 'Overdue',
    items: [
      {
        id: 'pq-1',
        title: 'Client demo deck revisions',
        dueLabel: '1 day overdue',
        priority: 'high'
      }
    ]
  },
  {
    id: 'due-today',
    title: 'Due Today',
    items: [
      {
        id: 'pq-2',
        title: 'Finish Q2 report section 2',
        dueLabel: 'Today · 5 PM',
        priority: 'high'
      },
      {
        id: 'pq-3',
        title: 'Peer review PR #248',
        dueLabel: 'Today · EOD',
        priority: 'high'
      }
    ]
  },
  {
    id: 'waiting-review',
    title: 'Waiting Review',
    items: [
      {
        id: 'pq-4',
        title: 'Sprint planning notes',
        dueLabel: 'Manager review',
        priority: 'medium'
      },
      {
        id: 'pq-5',
        title: 'API contract draft',
        dueLabel: 'Lead review',
        priority: 'medium'
      }
    ]
  },
  {
    id: 'blocked',
    title: 'Blocked',
    items: [
      {
        id: 'pq-6',
        title: 'Dashboard export module',
        dueLabel: 'Waiting on API fix',
        priority: 'high'
      }
    ]
  }
];

export const weeklyTaskTimeline: WeeklyTaskDay[] = [
  { day: 'Mon', finished: 3, pending: 1 },
  { day: 'Tue', finished: 2, pending: 2 },
  { day: 'Wed', finished: 4, pending: 0 },
  { day: 'Thu', finished: 2, pending: 2 },
  { day: 'Fri', finished: 1, pending: 3 }
];

export const yesterdayStatusItems: YesterdayStatusItem[] = [
  {
    id: 'ys-1',
    title: 'PR #241 — Dashboard filters',
    status: 'approved',
    detail: 'Merged to develop'
  },
  {
    id: 'ys-2',
    title: 'Client demo deck',
    status: 'completed',
    detail: 'Delivered on time'
  },
  {
    id: 'ys-3',
    title: 'Sprint retro action items',
    status: 'cleared',
    detail: '4 follow-ups closed'
  },
  {
    id: 'ys-4',
    title: 'API load test report',
    status: 'completed',
    detail: 'Metrics within SLA'
  },
  {
    id: 'ys-5',
    title: 'Timesheet correction',
    status: 'approved',
    detail: 'HR approved adjusted hours'
  }
];

export const blockerRiskItems: BlockerRiskItem[] = [
  {
    id: 'br-1',
    title: 'Dashboard export blocked',
    detail: 'API endpoint returns 503 · ETA tomorrow',
    kind: 'blocked',
    severity: 'high'
  },
  {
    id: 'br-2',
    title: 'Auth service dependency',
    detail: 'Waiting on platform team token refresh fix',
    kind: 'dependency',
    severity: 'high'
  },
  {
    id: 'br-3',
    title: 'PR #248 review pending',
    detail: '2 approvals needed before merge',
    kind: 'pr-review',
    severity: 'medium'
  },
  {
    id: 'br-4',
    title: 'Design tokens sync',
    detail: 'Blocked until UX publishes v2 spec',
    kind: 'dependency',
    severity: 'medium'
  }
];

export const quickWorkActions: QuickWorkAction[] = [
  { id: 'qa-1', label: 'Open Task Board' },
  { id: 'qa-2', label: 'Submit Work Update' },
  { id: 'qa-3', label: 'View Sprint Plan' },
  { id: 'qa-4', label: 'Add Blocker' }
];
