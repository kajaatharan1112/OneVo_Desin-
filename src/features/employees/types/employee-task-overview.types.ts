export type TaskPriority = 'high' | 'medium' | 'low';

export type OpenTaskStatus = 'open' | 'in-progress' | 'review';

export type PriorityQueueGroupId = 'overdue' | 'due-today' | 'waiting-review' | 'blocked';

export type BlockerKind = 'blocked' | 'dependency' | 'pr-review';

export type BlockerSeverity = 'high' | 'medium';

export type YesterdayWorkStatus = 'completed' | 'approved' | 'cleared' | 'issue';

export interface OpenTaskItem {
  id: string;
  title: string;
  status: OpenTaskStatus;
  priority: TaskPriority;
  dueLabel: string;
}

export interface WorkHoursBreakdown {
  focus: number;
  meeting: number;
  break: number;
  completed: number;
  expected: number;
}

export interface TaskCompletionMetrics {
  completed: number;
  planned: number;
}

export interface PriorityQueueItem {
  id: string;
  title: string;
  dueLabel: string;
  priority: TaskPriority;
}

export interface PriorityQueueGroup {
  id: PriorityQueueGroupId;
  title: string;
  items: PriorityQueueItem[];
}

export interface WeeklyTaskDay {
  day: string;
  finished: number;
  pending: number;
}

export interface YesterdayStatusItem {
  id: string;
  title: string;
  status: YesterdayWorkStatus;
  detail: string;
}

export interface BlockerRiskItem {
  id: string;
  title: string;
  detail: string;
  kind: BlockerKind;
  severity: BlockerSeverity;
}

export interface QuickWorkAction {
  id: string;
  label: string;
}
