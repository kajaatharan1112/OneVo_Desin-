import type { Automation, AutomationStep, StepConfig, StepType } from './automationTypes';
import {
  alertStepPreview,
  validateAlertAssignment,
  type EmployeeOption,
  type PositionOption
} from './alertAssignmentUtils';
import { formatPersonTargetPhrase, validatePersonTarget } from './personTargetUtils';
import {
  conditionStepPreview,
  validateConditionStep,
  type ConditionOrgContext
} from './conditionFields';

export const TRIGGER_GROUPS: Record<string, { label: string; triggers: { key: string; label: string }[] }> = {
  Employee: {
    label: 'Employee',
    triggers: [
      { key: 'employee_created', label: 'Employee created' },
      { key: 'employee_updated', label: 'Employee updated' },
      { key: 'employee_terminated', label: 'Employee terminated' },
      { key: 'employee_status_changed', label: 'Employee status changed' },
      { key: 'employee_onboarding_started', label: 'Employee onboarding started' },
      { key: 'employee_offboarding_started', label: 'Employee offboarding started' }
    ]
  },
  Organization: {
    label: 'Organization',
    triggers: [
      { key: 'department_created', label: 'Department created' },
      { key: 'department_head_changed', label: 'Department head changed' },
      { key: 'position_created', label: 'Position created' },
      { key: 'position_changed', label: 'Position changed' },
      { key: 'position_assignment_changed', label: 'Position assignment changed' },
      { key: 'reporting_manager_changed', label: 'Reporting manager changed' }
    ]
  },
  Leave: {
    label: 'Leave',
    triggers: [
      { key: 'leave_request_submitted', label: 'Leave request submitted' },
      { key: 'leave_request_approved', label: 'Leave request approved' },
      { key: 'leave_request_rejected', label: 'Leave request rejected' },
      { key: 'leave_balance_below_limit', label: 'Leave balance below limit' }
    ]
  },
  Attendance: {
    label: 'Attendance',
    triggers: [
      { key: 'employee_checked_in_late', label: 'Employee checked in late' },
      { key: 'employee_missed_checkin', label: 'Employee missed check-in' },
      { key: 'attendance_correction_submitted', label: 'Attendance correction submitted' },
      { key: 'overtime_request_submitted', label: 'Overtime request submitted' }
    ]
  },
  Monitoring: {
    label: 'Monitoring',
    triggers: [
      { key: 'monitoring_alert_created', label: 'Monitoring alert created' },
      { key: 'idle_activity_exceeds', label: 'Idle activity exceeds threshold' },
      { key: 'app_usage_violation', label: 'App usage violation detected' },
      { key: 'device_offline', label: 'Device offline for too long' }
    ]
  },
  Documents: {
    label: 'Documents',
    triggers: [
      { key: 'document_uploaded', label: 'Document uploaded' },
      { key: 'document_missing', label: 'Document missing' },
      { key: 'document_expiring_soon', label: 'Document expiring soon' },
      { key: 'document_expired', label: 'Document expired' }
    ]
  }
};

export const ACTION_GROUPS: Record<string, { key: string; label: string }[]> = {
  Employee: [
    { key: 'create_onboarding_checklist', label: 'Create onboarding checklist' },
    { key: 'create_offboarding_checklist', label: 'Create offboarding checklist' },
    { key: 'update_employee_status', label: 'Update employee status' },
    { key: 'assign_employee_task', label: 'Assign employee task' },
    { key: 'suggest_access_roles', label: 'Suggest access roles from position' },
    { key: 'send_invite', label: 'Send invite' }
  ],
  Organization: [
    { key: 'recalculate_reporting_manager', label: 'Recalculate reporting manager' },
    { key: 'flag_vacant_head', label: 'Flag vacant head position' },
    { key: 'update_position_assignment', label: 'Update position assignment' },
    { key: 'mark_department_head_missing', label: 'Mark department head missing' }
  ],
  Leave: [
    { key: 'create_approval_request', label: 'Create approval request' },
    { key: 'update_leave_status', label: 'Update leave request status' }
  ],
  Attendance: [
    { key: 'create_attendance_approval', label: 'Create attendance correction approval' }
  ],
  Documents: [
    { key: 'request_missing_document', label: 'Request missing document' },
    { key: 'mark_document_reminder_sent', label: 'Mark document reminder sent' }
  ],
  Integration: [
    { key: 'send_webhook', label: 'Send webhook' }
  ]
};

export function triggerLabel(key: string): string {
  for (const group of Object.values(TRIGGER_GROUPS)) {
    const t = group.triggers.find(tr => tr.key === key);
    if (t) return t.label;
  }
  return key || 'Choose a trigger';
}

export function actionLabel(key: string): string {
  for (const actions of Object.values(ACTION_GROUPS)) {
    const a = actions.find(ac => ac.key === key);
    if (a) return a.label;
  }
  return key || 'Choose an action';
}

export function stepToSentence(
  step: AutomationStep,
  context?: {
    positions: PositionOption[];
    employees: EmployeeOption[];
    departments?: { id: string; name: string }[];
    triggerKey?: string;
  }
): string {
  const c = step.config;
  switch (step.type) {
    case 'trigger':
      return `When ${triggerLabel(c.triggerKey ?? '').toLowerCase()}`;
    case 'condition': {
      const triggerKey = context?.triggerKey ?? '';
      const condOrg: ConditionOrgContext = {
        positions: context?.positions ?? [],
        employees: context?.employees ?? [],
        departments: context?.departments ?? []
      };
      return conditionStepPreview(c, triggerKey, condOrg);
    }
    case 'action':
      return actionLabel(c.actionKey ?? '');
    case 'approval': {
      if (!context) return 'Ask someone to approve';
      const who = formatPersonTargetPhrase(
        c.approverType as import('./personTargetUtils').PersonTargetType,
        c,
        'approver',
        context.positions,
        context.employees
      );
      return `Ask ${who} to approve`;
    }
    case 'notification': {
      if (!context) return 'Send notification';
      const who = formatPersonTargetPhrase(
        c.recipientType as import('./personTargetUtils').PersonTargetType,
        c,
        'recipient',
        context.positions,
        context.employees
      );
      const ch = (c.channel ?? 'in-app').toLowerCase();
      return `Notify ${who} by ${ch}`;
    }
    case 'alert':
      if (context) {
        return alertStepPreview(step, context.positions, context.employees);
      }
      return `Create ${c.severity ?? 'medium'} alert${c.alertTitle ? `: ${c.alertTitle}` : ''}`.trim();
    case 'delay':
      return `Wait ${c.delayAmount ?? '1'} ${c.delayUnit ?? 'hours'}`;
    case 'end':
      return 'End automation';
    default:
      return step.type;
  }
}

export function buildAutomationSummary(automation: Automation): string {
  const main = getMainChainSteps(automation.steps);
  const trigger = main.find(s => s.type === 'trigger');
  const actions = main.filter(s => ['action', 'approval', 'notification', 'alert'].includes(s.type));
  if (!trigger) return automation.summary || 'No trigger configured';
  const triggerText = triggerLabel(trigger.config.triggerKey ?? '').toLowerCase();
  if (actions.length === 0) return `When ${triggerText}`;
  const actionText = actions.map(s => stepToSentence(s).toLowerCase()).join(', then ');
  return `When ${triggerText}, then ${actionText}`;
}

export function getMainChainSteps(steps: AutomationStep[]): AutomationStep[] {
  return steps
    .filter(s => s.sectionId === 'main')
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getBranchSteps(steps: AutomationStep[], conditionId: string, path: 'yes' | 'no'): AutomationStep[] {
  return steps
    .filter(s => s.sectionId === `branch-${conditionId}-${path}`)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function hasBranch(steps: AutomationStep[], conditionId: string): boolean {
  return steps.some(s => s.sectionId.startsWith(`branch-${conditionId}-`));
}

export interface ValidationIssue {
  id: string;
  message: string;
}

export function validateAutomation(automation: Automation): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const main = getMainChainSteps(automation.steps);
  const trigger = main.find(s => s.type === 'trigger');

  if (!trigger?.config.triggerKey) {
    issues.push({ id: 'no-trigger', message: 'Automation needs a trigger.' });
  }

  const nonTrigger = main.filter(s => s.type !== 'trigger');
  if (nonTrigger.length === 0) {
    issues.push({ id: 'no-steps', message: 'Add at least one step after the trigger.' });
  }

  const triggerKey = trigger?.config.triggerKey ?? '';

  for (const step of automation.steps) {
    if (step.type === 'condition') {
      issues.push(...validateConditionStep(step, triggerKey));
      if (step.config.hasBranch) {
        const yesSteps = getBranchSteps(automation.steps, step.id, 'yes');
        const noSteps = getBranchSteps(automation.steps, step.id, 'no');
        if (yesSteps.length === 0) issues.push({ id: `yes-${step.id}`, message: 'Add at least one step to the YES path.' });
        if (noSteps.length === 0) issues.push({ id: `no-${step.id}`, message: 'Add at least one step to the NO path.' });
      }
    }
    if (step.type === 'approval') {
      issues.push(...validatePersonTarget(step.id, step.config, 'approver', 'Approver'));
    }
    if (step.type === 'notification') {
      issues.push(...validatePersonTarget(step.id, step.config, 'recipient', 'Recipient'));
      if (!step.config.channel) issues.push({ id: `notif-c-${step.id}`, message: 'Choose a notification channel.' });
    }
    if (step.type === 'alert') {
      if (!step.config.alertTitle) issues.push({ id: `alert-t-${step.id}`, message: 'Alert needs a title.' });
      if (!step.config.severity) issues.push({ id: `alert-s-${step.id}`, message: 'Alert needs a severity.' });
      issues.push(...validateAlertAssignment(step.id, step.config));
    }
  }

  const hasEnd = main.some(s => s.type === 'end');
  if (!hasEnd) {
    issues.push({ id: 'no-end', message: 'Automation should end clearly — add an End step.' });
  }

  return issues;
}

export function canActivate(automation: Automation): boolean {
  return validateAutomation(automation).length === 0;
}

export function defaultConfigForType(type: StepType): StepConfig {
  switch (type) {
    case 'trigger': return { triggerKey: '' };
    case 'condition': return { field: '', operator: '', value: '', hasBranch: false };
    case 'action': return { actionKey: '' };
    case 'approval': return { approverType: 'Reporting Manager', approvalTimeout: '48 hours', onApproved: 'Continue', onRejected: 'Stop automation' };
    case 'notification': return { recipientType: 'Employee', channel: 'In-app', subject: '', body: '' };
    case 'alert': return {
      alertTitle: '',
      severity: 'medium',
      assignToType: '',
      assignToRole: '',
      assignToPositionId: '',
      assignToEmployeeId: '',
      sla: '24 hours',
      escalate: false,
      escalationTargetType: '',
      escalationRole: '',
      escalationPositionId: '',
      escalationEmployeeId: ''
    };
    case 'delay': return { delayAmount: '1', delayUnit: 'hours' };
    case 'end': return {};
    default: return {};
  }
}

export function stepTypeLabel(type: StepType): string {
  const labels: Record<StepType, string> = {
    trigger: 'WHEN',
    condition: 'IF CONDITION',
    action: 'ACTION',
    approval: 'APPROVAL',
    notification: 'NOTIFICATION',
    alert: 'ALERT',
    delay: 'DELAY',
    end: 'END'
  };
  return labels[type];
}
