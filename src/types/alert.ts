export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AlertRuleStatus = 'active' | 'paused' | 'draft';

export type AlertInstanceStatus = 'open' | 'acknowledged' | 'resolved' | 'escalated';

export type AlertCategory =
  | 'Attendance'
  | 'Leave'
  | 'Monitoring'
  | 'Compliance'
  | 'Employee Lifecycle'
  | 'Security'
  | 'System';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  category: AlertCategory;
  severity: AlertSeverity;
  status: AlertRuleStatus;
  triggerCondition: string;
  targetScope: string;
  notificationChannels: string[];
  escalationWorkflowId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlertInstance {
  id: string;
  title: string;
  severity: AlertSeverity;
  category: AlertCategory;
  source: string;
  target: string;
  assignedTo: string;
  status: AlertInstanceStatus;
  createdAt: string;
  slaRemaining: string;
  ruleId?: string;
}
