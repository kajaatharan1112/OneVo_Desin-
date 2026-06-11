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
  createEmptyConditionClause,
  type ConditionOrgContext
} from './conditionFields';
import {
  ACTION_CATALOG,
  TRIGGER_GROUPS,
  getAllowedConditionFieldKeys,
  getFilteredActionGroups,
  isChecklistTemplateAction,
  isDemoTrigger,
  isRemovedInternalAction,
  triggerLabelForKey,
  validateAutomationContext
} from './automationContextRules';
import { useChecklistTemplateStore } from '../../store/checklistTemplateStore';
import {
  approvalStepPreview,
  getAlertAfterApprovalWarnings,
  getDefaultApprovalStepConfig,
  validateApprovalStep
} from './approvalStepUtils';
import { isOneTimeTaskAction, oneTimeTaskStepPreview, validateOneTimeTaskConfig } from './oneTimeTaskUtils';
import {
  isLateAttendanceLeaveAction,
  lateAttendanceActionLabel
} from './lateAttendanceLeaveTemplate';

export { TRIGGER_GROUPS, getFilteredActionGroups };

export const ACTION_GROUPS: Record<string, { key: string; label: string }[]> = {
  Checklists: [
    ACTION_CATALOG.create_onboarding_checklist_from_template,
    ACTION_CATALOG.create_offboarding_checklist_from_template
  ],
  Tasks: [
    ACTION_CATALOG.create_one_time_task
  ],
  Leave: [
    ACTION_CATALOG.update_leave_status
  ],
  Integration: [
    ACTION_CATALOG.send_webhook
  ]
};

export function triggerLabel(key: string): string {
  if (isDemoTrigger(key)) return triggerLabelForKey(key);
  return key || 'Choose a trigger';
}

export function actionLabel(key: string): string {
  if (ACTION_CATALOG[key]) return ACTION_CATALOG[key].label;
  if (isLateAttendanceLeaveAction(key)) return lateAttendanceActionLabel(key);
  if (key === 'create_attendance_approval') return 'Create attendance correction approval';
  if (key === 'create_approval_request') return 'Create approval request';
  if (isRemovedInternalAction(key)) return 'Unavailable action';
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
  if (c.displaySentence) return String(c.displaySentence);
  switch (step.type) {
    case 'trigger':
      return triggerLabel(c.triggerKey ?? '') === 'Choose a trigger'
        ? 'Choose a trigger'
        : `When ${triggerLabel(c.triggerKey ?? '')}`;
    case 'condition': {
      const triggerKey = context?.triggerKey ?? '';
      const condOrg: ConditionOrgContext = {
        positions: context?.positions ?? [],
        employees: context?.employees ?? [],
        departments: context?.departments ?? []
      };
      const allowed = triggerKey ? getAllowedConditionFieldKeys(triggerKey) : undefined;
      const preview = conditionStepPreview(c, triggerKey, condOrg, allowed);
      if (c.elseIf) return preview.replace(/^If /, 'Else if ');
      return preview;
    }
    case 'action': {
      const key = c.actionKey ?? '';
      if (isLateAttendanceLeaveAction(key)) {
        const leave = c.leaveTypeName ? ` (${c.leaveTypeName})` : '';
        return `${lateAttendanceActionLabel(key)}${leave}`;
      }
      if (isChecklistTemplateAction(key)) {
        const template = useChecklistTemplateStore.getState().getTemplateById(c.checklistTemplateId ?? '');
        const label = actionLabel(key);
        return template ? `${label}: ${template.name}` : label;
      }
      if (isOneTimeTaskAction(key) && context) {
        return oneTimeTaskStepPreview(c, context.positions, context.employees);
      }
      return actionLabel(key);
    }
    case 'approval':
      if (!context) return 'Ask someone to approve';
      return approvalStepPreview(c, context.positions, context.employees);
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
  if (!trigger?.config.triggerKey) return automation.summary || 'No trigger configured';
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
  stepId?: string;
  severity?: 'error' | 'warning';
}

export function validateAutomation(automation: Automation): ValidationIssue[] {
  const issues: ValidationIssue[] = [
    ...validateAutomationContext(automation).map(i => ({ ...i, severity: 'error' as const })),
    ...getAlertAfterApprovalWarnings(automation.steps).map(w => ({
      ...w,
      severity: 'warning' as const
    }))
  ];

  for (const step of automation.steps) {
    if (step.type === 'approval') {
      issues.push(...validatePersonTarget(step.id, step.config, 'approver', 'Approver'));
      issues.push(...validateApprovalStep(step.id, step.config));
    }
    if (step.type === 'notification') {
      issues.push(...validatePersonTarget(step.id, step.config, 'recipient', 'Recipient'));
      if (!step.config.channel) issues.push({ id: `notif-c-${step.id}`, message: 'Choose a notification channel.', stepId: step.id });
    }
    if (step.type === 'alert') {
      if (!step.config.alertTitle) issues.push({ id: `alert-t-${step.id}`, message: 'Alert needs a title.', stepId: step.id });
      if (!step.config.severity) issues.push({ id: `alert-s-${step.id}`, message: 'Alert needs a severity.', stepId: step.id });
      issues.push(...validateAlertAssignment(step.id, step.config));
    }
    if (step.type === 'action' && isOneTimeTaskAction(step.config.actionKey)) {
      issues.push(...validateOneTimeTaskConfig(step.id, step.config).map(i => ({ ...i, stepId: step.id })));
    }
  }

  return issues;
}

export function canActivate(automation: Automation): boolean {
  return validateAutomation(automation).filter(i => i.severity !== 'warning').length === 0;
}

export function defaultConfigForType(type: StepType): StepConfig {
  switch (type) {
    case 'trigger': return { triggerKey: '' };
    case 'condition': return { conditions: [createEmptyConditionClause()], hasBranch: false };
    case 'action': return { actionKey: '' };
    case 'approval': return getDefaultApprovalStepConfig();
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

export function stepTypeLabel(type: StepType, config?: StepConfig): string {
  if (type === 'condition' && config?.elseIf) return 'ELSE IF CONDITION';
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
