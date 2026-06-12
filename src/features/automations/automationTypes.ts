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

export interface ConditionClause {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export type AddStepOption =
  | 'condition'
  | 'action'
  | 'approval'
  | 'notification'
  | 'alert'
  | 'delay'
  | 'branch'
  | 'end';

export interface StepConfig {
  triggerKey?: string;
  field?: string;
  operator?: string;
  value?: string;
  conditions?: ConditionClause[];
  actionKey?: string;
  approverType?: string;
  approverRole?: string;
  approverPositionId?: string;
  approverEmployeeId?: string;
  approvalTimeout?: string;
  approvalTimeoutEnabled?: boolean;
  approvalTimeoutHours?: number;
  approvalTimeoutMinutes?: number;
  onApproved?: string;
  onRejected?: string;
  onTimeout?: string;
  timeoutAlertSeverity?: string;
  timeoutAlertAssignToType?: string;
  timeoutAlertAssignToRole?: string;
  timeoutAlertAssignToPositionId?: string;
  timeoutAlertAssignToEmployeeId?: string;
  timeoutNotifyType?: string;
  timeoutNotifyRole?: string;
  timeoutNotifyPositionId?: string;
  timeoutNotifyEmployeeId?: string;
  timeoutEscalationApproverType?: string;
  timeoutEscalationApproverRole?: string;
  timeoutEscalationApproverPositionId?: string;
  timeoutEscalationApproverEmployeeId?: string;
  rejectedAlertSeverity?: string;
  rejectedAlertAssignToType?: string;
  rejectedAlertAssignToRole?: string;
  rejectedAlertAssignToPositionId?: string;
  rejectedAlertAssignToEmployeeId?: string;
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
  assignTo?: string;
  hasBranch?: boolean;
  checklistTemplateId?: string;
  taskTitle?: string;
  taskDescription?: string;
  taskAssigneeType?: string;
  taskAssigneeRole?: string;
  taskAssigneePositionId?: string;
  taskAssigneeEmployeeId?: string;
  taskDueHours?: number;
  taskDueMinutes?: number;
  taskPriority?: string;
  taskRelatedEmployeeFromTrigger?: boolean;
  ruleLabel?: string;
  elseIf?: boolean;
  flowHint?: string;
  displaySentence?: string;
  leaveTypeId?: string;
  leaveTypeName?: string;
  workdayHours?: number;
  approvalMode?: string;
  deductionAmount?: number;
  deductionSource?: string;
  rounding?: string;
  [key: string]: unknown;
}

export interface AutomationStep {
  id: string;
  type: StepType;
  config: StepConfig;
  sectionId: string;
  sortOrder: number;
}

export type TemplateId =
  | 'blank'
  | 'new_employee_setup'
  | 'employee_offboarding'
  | 'leave_request_approval'
  | 'attendance_correction_approval'
  | 'late_attendance_alert'
  | 'late_attendance_leave_rule'
  | 'position_change_check'
  | 'monitoring_alert_escalation';

export interface Automation {
  id: string;
  templateId: TemplateId;
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

