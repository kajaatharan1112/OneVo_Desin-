export type WorkKpiTone = 'default' | 'danger' | 'warning' | 'success';

export type WorkPriority = 'high' | 'medium' | 'low';

export type WorkQueueSectionId = 'overdue' | 'due-today' | 'upcoming';

export type WorkTaskStatus = 'open' | 'in-progress' | 'review';

export type WorkBlockerKind = 'blocked' | 'dependency';

export type WorkYesterdayStatus = 'approved' | 'completed';

export interface WorkKpiTile {
  id: string;
  label: string;
  value: number;
  tone?: WorkKpiTone;
}

export interface WorkTaskCastStat {
  id: string;
  label: string;
  value: string;
}

export interface WorkTaskCast {
  completed: number;
  planned: number;
  percent: number;
  stats: WorkTaskCastStat[];
}

export interface WorkActiveFocusTask {
  title: string;
  sprint: string;
  due: string;
  initialElapsedSeconds: number;
}

export interface WorkCapacityCommitment {
  availableHours: number;
  committedHours: number;
  status: string;
  warning: string;
}

export interface WorkQueueItem {
  id: string;
  title: string;
  priority: WorkPriority;
  dueLabel: string;
}

export interface WorkQueueSection {
  id: WorkQueueSectionId;
  title: string;
  items: WorkQueueItem[];
}

export interface WorkMyTaskItem {
  id: string;
  title: string;
  status: WorkTaskStatus;
  priority: WorkPriority;
  dueLabel: string;
}

export interface WorkBlockerItem {
  id: string;
  title: string;
  kind: WorkBlockerKind;
  detail: string;
}

export interface WorkYesterdayItem {
  id: string;
  title: string;
  status: WorkYesterdayStatus;
}

export const workKpiTiles: WorkKpiTile[] = [
  { id: 'due-today', label: 'Due Today', value: 2 },
  { id: 'overdue', label: 'Overdue', value: 1, tone: 'danger' },
  { id: 'blocked', label: 'Blocked', value: 1, tone: 'warning' },
  { id: 'in-progress', label: 'In Progress', value: 3 },
  { id: 'done-today', label: 'Done Today', value: 4, tone: 'success' }
];

export const workPriorityQueue: WorkQueueSection[] = [
  {
    id: 'overdue',
    title: 'Overdue',
    items: [
      {
        id: 'pq-1',
        title: 'Client demo deck revisions',
        priority: 'high',
        dueLabel: '1 day overdue'
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
        priority: 'high',
        dueLabel: 'Today 5 PM'
      },
      {
        id: 'pq-3',
        title: 'Submit travel reimbursement receipt',
        priority: 'medium',
        dueLabel: 'Today EOD'
      }
    ]
  },
  {
    id: 'upcoming',
    title: 'Upcoming',
    items: [
      {
        id: 'pq-4',
        title: 'Prepare sprint review notes',
        priority: 'medium',
        dueLabel: 'Wed'
      },
      {
        id: 'pq-5',
        title: 'Review onboarding checklist updates',
        priority: 'low',
        dueLabel: 'Thu'
      },
      {
        id: 'pq-6',
        title: 'Sync with design on profile screens',
        priority: 'medium',
        dueLabel: 'Fri'
      },
      {
        id: 'pq-7',
        title: 'Update API error handling docs',
        priority: 'low',
        dueLabel: 'Next Mon'
      }
    ]
  }
];

export const workMyTasks: WorkMyTaskItem[] = [
  {
    id: 'mt-1',
    title: 'Update sprint board comments',
    status: 'open',
    priority: 'medium',
    dueLabel: 'Due tomorrow'
  },
  {
    id: 'mt-2',
    title: 'Review API contract draft',
    status: 'review',
    priority: 'high',
    dueLabel: 'Due today'
  },
  {
    id: 'mt-3',
    title: 'Fix leave balance widget spacing',
    status: 'in-progress',
    priority: 'medium',
    dueLabel: 'Due Wed'
  },
  {
    id: 'mt-4',
    title: 'Add unit tests for timer hook',
    status: 'open',
    priority: 'low',
    dueLabel: 'Due Thu'
  },
  {
    id: 'mt-5',
    title: 'Draft standup update for ONEVO-S4',
    status: 'open',
    priority: 'low',
    dueLabel: 'Due tomorrow'
  },
  {
    id: 'mt-6',
    title: 'Validate calendar sync badges in dark mode',
    status: 'in-progress',
    priority: 'medium',
    dueLabel: 'Due Fri'
  },
  {
    id: 'mt-7',
    title: 'Peer review attendance insight card',
    status: 'review',
    priority: 'high',
    dueLabel: 'Due today'
  }
];

export const workBlockers: WorkBlockerItem[] = [
  {
    id: 'bl-1',
    title: 'Dashboard export blocked',
    kind: 'blocked',
    detail: 'ETA tomorrow · waiting on PDF service quota'
  },
  {
    id: 'bl-2',
    title: 'Auth service dependency',
    kind: 'dependency',
    detail: 'Platform team rollout · no ETA yet'
  },
  {
    id: 'bl-3',
    title: 'Staging data refresh delayed',
    kind: 'dependency',
    detail: 'Blocks QA sign-off for profile flow'
  }
];

export const workYesterdayItems: WorkYesterdayItem[] = [
  {
    id: 'ys-1',
    title: 'PR #241 — Dashboard filters',
    status: 'approved'
  },
  {
    id: 'ys-2',
    title: 'Client demo deck',
    status: 'completed'
  },
  {
    id: 'ys-3',
    title: 'Attendance tab KPI alignment',
    status: 'completed'
  },
  {
    id: 'ys-4',
    title: 'Leave policy copy review',
    status: 'approved'
  }
];

export const workTaskCast: WorkTaskCast = {
  completed: 12,
  planned: 15,
  percent: 80,
  stats: [
    { id: 'story-pts', label: 'Story pts', value: '42/50' },
    { id: 'on-time', label: 'On-time', value: '92%' },
    { id: 'cycle-time', label: 'Cycle time', value: '1.4d' }
  ]
};

export const workActiveFocusTask: WorkActiveFocusTask = {
  title: 'Employee Profile UI',
  sprint: 'ONEVO-S4',
  due: 'Today',
  initialElapsedSeconds: 5070
};

export const workCapacityCommitment: WorkCapacityCommitment = {
  availableHours: 32,
  committedHours: 28,
  status: 'Balanced',
  warning: 'Thu leave clashes with 2 due tasks'
};

export const workQuickActions = [
  { id: 'open-board', label: 'Open Board' },
  { id: 'submit-update', label: 'Submit Update' },
  { id: 'log-time', label: 'Log Time' },
  { id: 'add-blocker', label: 'Add Blocker' }
] as const;
