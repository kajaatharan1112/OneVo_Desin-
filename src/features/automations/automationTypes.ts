export type AutomationStatus = 'draft' | 'active' | 'paused';

export type AutomationArea =
  | 'Employee Lifecycle'
  | 'Leave'
  | 'Attendance'
  | 'Organization'
  | 'Documents'
  | 'Monitoring';

export type StepType =
  | 'trigger'
  | 'condition'
  | 'action'
  | 'approval'
  | 'notification'
  | 'alert'
  | 'delay'
  | 'end';

export type AddStepOption =
  | 'condition'
  | 'action'
  | 'approval'
  | 'notification'
  | 'alert'
  | 'delay'
  | 'branch';

export interface StepConfig {
  triggerKey?: string;
  field?: string;
  operator?: string;
  value?: string;
  actionKey?: string;
  approverType?: string;
  approverRole?: string;
  approverPositionId?: string;
  approverEmployeeId?: string;
  approvalTimeout?: string;
  onApproved?: string;
  onRejected?: string;
  recipientType?: string;
  recipientRole?: string;
  recipientPositionId?: string;
  recipientEmployeeId?: string;
  channel?: string;
  subject?: string;
  body?: string;
  alertTitle?: string;
  severity?: string;
  assignToType?: string;
  assignToRole?: string;
  assignToPositionId?: string;
  assignToEmployeeId?: string;
  sla?: string;
  escalate?: boolean;
  escalationTargetType?: string;
  escalationRole?: string;
  escalationPositionId?: string;
  escalationEmployeeId?: string;
  delayAmount?: string;
  delayUnit?: string;
  hasBranch?: boolean;
  [key: string]: unknown;
}

export interface AutomationStep {
  id: string;
  type: StepType;
  config: StepConfig;
  sectionId: string;
  sortOrder: number;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  summary: string;
  area: AutomationArea;
  trigger: string;
  status: AutomationStatus;
  steps: AutomationStep[];
  lastRunAt: string | null;
  runCount: number;
  failureCount: number;
  alertsCreated: number;
  openAlerts: number;
  createdAt: string;
  updatedAt: string;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'escalated';

export interface AutomationAlert {
  id: string;
  automationId: string;
  title: string;
  severity: AlertSeverity;
  area: string;
  assignedTo: string;
  status: AlertStatus;
  createdAt: string;
  slaRemaining: string;
}

export interface TemplateOption {
  id: string;
  name: string;
  description: string;
  area: AutomationArea;
  triggerKey: string;
  summary: string;
  steps: Omit<AutomationStep, 'id'>[];
}
