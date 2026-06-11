export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';

export type WorkflowNodeType =
  | 'trigger'
  | 'condition'
  | 'action'
  | 'approval'
  | 'delay'
  | 'alert'
  | 'notification'
  | 'end';

export type EdgeConditionType =
  | 'success'
  | 'failure'
  | 'yes'
  | 'no'
  | 'timeout'
  | 'default'
  | 'approved'
  | 'rejected';

export type WorkflowCategory =
  | 'Employee Lifecycle'
  | 'Leave Management'
  | 'Attendance'
  | 'Workforce Monitoring'
  | 'Approvals'
  | 'Notifications'
  | 'Compliance'
  | 'Work Management';

export interface WorkflowNodeConfig {
  triggerType?: string;
  scope?: string;
  filters?: string;
  field?: string;
  operator?: string;
  value?: string;
  yesBranchLabel?: string;
  noBranchLabel?: string;
  actionType?: string;
  assignee?: string;
  dueDateRule?: string;
  message?: string;
  approverType?: string;
  approvalMode?: string;
  timeout?: string;
  rejectionBehavior?: string;
  alertTitle?: string;
  severity?: string;
  alertCategory?: string;
  target?: string;
  escalationRule?: string;
  notificationChannels?: string[];
  duration?: string;
  [key: string]: unknown;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  config: WorkflowNodeConfig;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  conditionType: EdgeConditionType;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  triggerType: string;
  status: WorkflowStatus;
  version: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  lastRunAt: string | null;
  runCount: number;
  failureCount: number;
}

export type WorkflowRunStatus = 'success' | 'failed' | 'running' | 'skipped';

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: WorkflowRunStatus;
  startedAt: string;
  completedAt: string | null;
  triggeredBy: string;
  summary: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  event: string;
  channel: 'In-app' | 'Email' | 'Slack' | 'Microsoft Teams';
  recipient: string;
  status: 'active' | 'paused' | 'draft';
  template?: string;
}

export interface ApprovalStep {
  id: string;
  approverType: string;
  label: string;
}

export interface ApprovalRule {
  id: string;
  name: string;
  appliesTo: string;
  steps: ApprovalStep[];
  timeout: string;
  escalationTarget: string;
  rejectionBehavior: string;
  status: 'active' | 'paused' | 'draft';
}

export interface PaletteItem {
  id: string;
  label: string;
  nodeType: WorkflowNodeType;
  section: string;
  defaultConfig?: WorkflowNodeConfig;
}
