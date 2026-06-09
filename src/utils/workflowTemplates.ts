import type { PaletteItem } from '../types/workflow';

export const PALETTE_SECTIONS = [
  'Triggers',
  'Conditions',
  'Actions',
  'Approvals',
  'Alerts',
  'Notifications',
  'Timing'
] as const;

export const PALETTE_ITEMS: PaletteItem[] = [
  // Triggers
  { id: 'trg-emp-created', label: 'Employee Created', nodeType: 'trigger', section: 'Triggers', defaultConfig: { triggerType: 'Employee Created' } },
  { id: 'trg-emp-updated', label: 'Employee Updated', nodeType: 'trigger', section: 'Triggers', defaultConfig: { triggerType: 'Employee Updated' } },
  { id: 'trg-emp-terminated', label: 'Employee Terminated', nodeType: 'trigger', section: 'Triggers', defaultConfig: { triggerType: 'Employee Terminated' } },
  { id: 'trg-pos-changed', label: 'Position Assignment Changed', nodeType: 'trigger', section: 'Triggers', defaultConfig: { triggerType: 'Position Assignment Changed' } },
  { id: 'trg-leave-submitted', label: 'Leave Request Submitted', nodeType: 'trigger', section: 'Triggers', defaultConfig: { triggerType: 'Leave Request Submitted' } },
  { id: 'trg-att-corr', label: 'Attendance Correction Submitted', nodeType: 'trigger', section: 'Triggers', defaultConfig: { triggerType: 'Attendance Correction Submitted' } },
  { id: 'trg-overtime', label: 'Overtime Request Submitted', nodeType: 'trigger', section: 'Triggers', defaultConfig: { triggerType: 'Overtime Request Submitted' } },
  { id: 'trg-mon-alert', label: 'Monitoring Alert Created', nodeType: 'trigger', section: 'Triggers', defaultConfig: { triggerType: 'Monitoring Alert Created' } },
  { id: 'trg-doc-exp', label: 'Document Expiring', nodeType: 'trigger', section: 'Triggers', defaultConfig: { triggerType: 'Document Expiring' } },
  { id: 'trg-manual', label: 'Manual Trigger', nodeType: 'trigger', section: 'Triggers', defaultConfig: { triggerType: 'Manual Trigger' } },

  // Conditions
  { id: 'cond-dept', label: 'If Department Is', nodeType: 'condition', section: 'Conditions', defaultConfig: { field: 'department', operator: 'equals', value: '', yesBranchLabel: 'Yes', noBranchLabel: 'No' } },
  { id: 'cond-pos', label: 'If Position Is', nodeType: 'condition', section: 'Conditions', defaultConfig: { field: 'position', operator: 'equals', value: '' } },
  { id: 'cond-status', label: 'If Employee Status Is', nodeType: 'condition', section: 'Conditions', defaultConfig: { field: 'status', operator: 'equals', value: 'active' } },
  { id: 'cond-leave', label: 'If Leave Type Is', nodeType: 'condition', section: 'Conditions', defaultConfig: { field: 'leaveType', operator: 'equals', value: '' } },
  { id: 'cond-amount', label: 'If Amount / Days Exceeds', nodeType: 'condition', section: 'Conditions', defaultConfig: { field: 'days', operator: 'greater_than', value: '3' } },
  { id: 'cond-severity', label: 'If Severity Is', nodeType: 'condition', section: 'Conditions', defaultConfig: { field: 'severity', operator: 'equals', value: 'high' } },
  { id: 'cond-mgr', label: 'If Manager Exists', nodeType: 'condition', section: 'Conditions', defaultConfig: { field: 'manager', operator: 'exists', value: '' } },
  { id: 'cond-hours', label: 'If Within Working Hours', nodeType: 'condition', section: 'Conditions', defaultConfig: { field: 'workingHours', operator: 'within', value: '' } },
  { id: 'cond-policy', label: 'If Policy Matches', nodeType: 'condition', section: 'Conditions', defaultConfig: { field: 'policy', operator: 'matches', value: '' } },

  // Actions
  { id: 'act-task', label: 'Create Task', nodeType: 'action', section: 'Actions', defaultConfig: { actionType: 'Create Task', assignee: 'Employee' } },
  { id: 'act-checklist', label: 'Assign Checklist', nodeType: 'action', section: 'Actions', defaultConfig: { actionType: 'Assign Checklist' } },
  { id: 'act-status', label: 'Update Employee Status', nodeType: 'action', section: 'Actions', defaultConfig: { actionType: 'Update Employee Status' } },
  { id: 'act-approval-req', label: 'Create Approval Request', nodeType: 'action', section: 'Actions', defaultConfig: { actionType: 'Create Approval Request' } },
  { id: 'act-role', label: 'Assign Role', nodeType: 'action', section: 'Actions', defaultConfig: { actionType: 'Assign Role' } },
  { id: 'act-invite', label: 'Send Invite', nodeType: 'action', section: 'Actions', defaultConfig: { actionType: 'Send Invite' } },
  { id: 'act-notif', label: 'Add Notification', nodeType: 'action', section: 'Actions', defaultConfig: { actionType: 'Add Notification' } },
  { id: 'act-alert', label: 'Create Alert', nodeType: 'action', section: 'Actions', defaultConfig: { actionType: 'Create Alert' } },
  { id: 'act-esc-alert', label: 'Escalate Alert', nodeType: 'action', section: 'Actions', defaultConfig: { actionType: 'Escalate Alert' } },
  { id: 'act-webhook', label: 'Call Webhook', nodeType: 'action', section: 'Actions', defaultConfig: { actionType: 'Call Webhook' } },
  { id: 'act-end', label: 'End Workflow', nodeType: 'end', section: 'Actions', defaultConfig: { actionType: 'End Workflow' } },

  // Approvals
  { id: 'appr-mgr', label: 'Manager Approval', nodeType: 'approval', section: 'Approvals', defaultConfig: { approverType: 'Reporting Manager', approvalMode: 'Single approver', timeout: '48h' } },
  { id: 'appr-dept', label: 'Department Head Approval', nodeType: 'approval', section: 'Approvals', defaultConfig: { approverType: 'Department Head', approvalMode: 'Single approver' } },
  { id: 'appr-hr', label: 'HR Approval', nodeType: 'approval', section: 'Approvals', defaultConfig: { approverType: 'HR Admin', approvalMode: 'Single approver' } },
  { id: 'appr-fin', label: 'Finance Approval', nodeType: 'approval', section: 'Approvals', defaultConfig: { approverType: 'Finance Admin', approvalMode: 'Single approver' } },
  { id: 'appr-multi', label: 'Multi-step Approval', nodeType: 'approval', section: 'Approvals', defaultConfig: { approverType: 'Multi-step', approvalMode: 'All approvers' } },
  { id: 'appr-parallel', label: 'Parallel Approval', nodeType: 'approval', section: 'Approvals', defaultConfig: { approverType: 'Parallel', approvalMode: 'Any approver' } },

  // Alerts
  { id: 'alrt-low', label: 'Create Low Alert', nodeType: 'alert', section: 'Alerts', defaultConfig: { severity: 'low', alertTitle: 'Low priority alert' } },
  { id: 'alrt-med', label: 'Create Medium Alert', nodeType: 'alert', section: 'Alerts', defaultConfig: { severity: 'medium', alertTitle: 'Medium priority alert' } },
  { id: 'alrt-high', label: 'Create High Alert', nodeType: 'alert', section: 'Alerts', defaultConfig: { severity: 'high', alertTitle: 'High priority alert' } },
  { id: 'alrt-crit', label: 'Create Critical Alert', nodeType: 'alert', section: 'Alerts', defaultConfig: { severity: 'critical', alertTitle: 'Critical alert' } },
  { id: 'alrt-esc-hr', label: 'Escalate To HR', nodeType: 'alert', section: 'Alerts', defaultConfig: { escalationRule: 'Escalate to HR', severity: 'high' } },
  { id: 'alrt-esc-mgr', label: 'Escalate To Manager', nodeType: 'alert', section: 'Alerts', defaultConfig: { escalationRule: 'Escalate to Manager', severity: 'medium' } },
  { id: 'alrt-esc-admin', label: 'Escalate To Admin', nodeType: 'alert', section: 'Alerts', defaultConfig: { escalationRule: 'Escalate to Admin', severity: 'critical' } },

  // Notifications
  { id: 'notif-inapp', label: 'Send In-App Notification', nodeType: 'notification', section: 'Notifications', defaultConfig: { actionType: 'In-App' } },
  { id: 'notif-email', label: 'Send Email', nodeType: 'notification', section: 'Notifications', defaultConfig: { actionType: 'Email' } },
  { id: 'notif-slack', label: 'Send Slack/Teams Message', nodeType: 'notification', section: 'Notifications', defaultConfig: { actionType: 'Slack/Teams' } },
  { id: 'notif-mgr', label: 'Notify Reporting Manager', nodeType: 'notification', section: 'Notifications', defaultConfig: { assignee: 'Reporting Manager' } },
  { id: 'notif-dept', label: 'Notify Department Head', nodeType: 'notification', section: 'Notifications', defaultConfig: { assignee: 'Department Head' } },
  { id: 'notif-hr', label: 'Notify HR Admin', nodeType: 'notification', section: 'Notifications', defaultConfig: { assignee: 'HR Admin' } },

  // Timing
  { id: 'delay-dur', label: 'Wait Duration', nodeType: 'delay', section: 'Timing', defaultConfig: { duration: '24h' } },
  { id: 'delay-date', label: 'Wait Until Date', nodeType: 'delay', section: 'Timing', defaultConfig: { duration: 'specific_date' } },
  { id: 'delay-biz', label: 'Business Hours Delay', nodeType: 'delay', section: 'Timing', defaultConfig: { duration: 'business_hours' } },
  { id: 'delay-esc', label: 'Escalation Timeout', nodeType: 'delay', section: 'Timing', defaultConfig: { duration: '48h', escalationRule: 'Escalate on timeout' } },
];

export const WORKFLOW_CATEGORIES = [
  'Employee Lifecycle',
  'Leave Management',
  'Attendance',
  'Workforce Monitoring',
  'Approvals',
  'Notifications',
  'Compliance',
  'Work Management'
] as const;
