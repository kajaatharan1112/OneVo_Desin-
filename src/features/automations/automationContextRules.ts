import type { AddStepOption, Automation, AutomationArea, AutomationStep, StepType } from './automationTypes';
import type { ChecklistTemplateType } from '../people/checklist-templates/checklistTemplateTypes';
import type { TargetType } from './alertAssignmentUtils';
import type { PersonTargetType } from './personTargetUtils';
import { useChecklistTemplateStore } from '../../store/checklistTemplateStore';
import { isOneTimeTaskAction, validateOneTimeTaskConfig } from './oneTimeTaskUtils';
import {
  conditionClausesMatchTrigger,
  validateConditionClauses
} from './conditionFields';
import { isLateAttendanceLeaveAction } from './lateAttendanceLeaveTemplate';

function getMainChainSteps(steps: AutomationStep[]): AutomationStep[] {
  return steps.filter(s => s.sectionId === 'main').sort((a, b) => a.sortOrder - b.sortOrder);
}

function getBranchSteps(steps: AutomationStep[], conditionId: string, path: 'yes' | 'no'): AutomationStep[] {
  return steps
    .filter(s => s.sectionId === `branch-${conditionId}-${path}`)
    .sort((a, b) => a.sortOrder - b.sortOrder);
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

export interface CreateAutomationCard {
  id: TemplateId;
  name: string;
  description: string;
}

export interface AutomationTemplate {
  id: Exclude<TemplateId, 'blank'>;
  name: string;
  description: string;
  summary: string;
  area: AutomationArea;
  triggerKey: string;
  steps: Omit<AutomationStep, 'id'>[];
}

export const CREATE_AUTOMATION_CARDS: CreateAutomationCard[] = [
  { id: 'blank', name: 'Start from blank', description: 'Build a custom automation from scratch' },
  { id: 'new_employee_setup', name: 'New Employee Setup', description: 'Set up tasks, invite, access suggestions, and notifications when a new employee is created.' },
  { id: 'employee_offboarding', name: 'Employee Offboarding', description: 'Create offboarding checklist and notify managers when employee offboarding starts.' },
  { id: 'leave_request_approval', name: 'Leave Request Approval', description: 'Route leave requests for approval and notify the requester when a decision is made.' },
  { id: 'attendance_correction_approval', name: 'Attendance Correction Approval', description: 'Route attendance corrections for approval and notify the employee when a decision is made.' },
  { id: 'late_attendance_alert', name: 'Late Attendance Alert', description: 'Create an attendance alert when late check-ins exceed a threshold in a period.' },
  { id: 'late_attendance_leave_rule', name: 'Late Attendance Leave Rule', description: 'Deduct late time or convert late attendance to half-day/full-day leave based on thresholds.' },
  { id: 'position_change_check', name: 'Position Change Check', description: 'Check reporting manager and department head rules when an employee moves position.' },
  { id: 'monitoring_alert_escalation', name: 'Monitoring Alert Escalation', description: 'Assign and escalate monitoring alerts when severity is high or critical.' }
];

export const DEMO_TRIGGER_KEYS = [
  'employee_created',
  'employee_offboarding_started',
  'position_assignment_changed',
  'department_changed',
  'department_head_changed',
  'reporting_manager_missing',
  'leave_request_submitted',
  'employee_checked_in_late',
  'attendance_correction_submitted',
  'app_usage_violation_detected',
  'idle_time_exceeded_threshold',
  'device_offline_too_long',
  'location_mismatch_detected',
  'monitoring_alert_manually_created'
] as const;

export type DemoTriggerKey = (typeof DEMO_TRIGGER_KEYS)[number];

export const TRIGGER_GROUPS: Record<string, { label: string; triggers: { key: DemoTriggerKey; label: string }[] }> = {
  'Employee Lifecycle': {
    label: 'Employee Lifecycle',
    triggers: [
      { key: 'employee_created', label: 'Employee created' },
      { key: 'employee_offboarding_started', label: 'Employee offboarding started' }
    ]
  },
  Organization: {
    label: 'Organization',
    triggers: [
      { key: 'position_assignment_changed', label: 'Position assignment changed' },
      { key: 'department_changed', label: 'Department changed' },
      { key: 'department_head_changed', label: 'Department head changed' },
      { key: 'reporting_manager_missing', label: 'Reporting manager missing' }
    ]
  },
  Leave: {
    label: 'Leave',
    triggers: [{ key: 'leave_request_submitted', label: 'Leave request submitted' }]
  },
  Attendance: {
    label: 'Attendance',
    triggers: [
      { key: 'employee_checked_in_late', label: 'Employee checked in late' },
      { key: 'attendance_correction_submitted', label: 'Attendance correction submitted' }
    ]
  },
  Monitoring: {
    label: 'Monitoring',
    triggers: [
      { key: 'app_usage_violation_detected', label: 'App usage violation detected' },
      { key: 'idle_time_exceeded_threshold', label: 'Idle time exceeded threshold' },
      { key: 'device_offline_too_long', label: 'Device offline too long' },
      { key: 'location_mismatch_detected', label: 'Location mismatch detected' },
      { key: 'monitoring_alert_manually_created', label: 'Monitoring alert manually created' }
    ]
  }
};

/** Approval routing belongs in APPROVAL steps — never as ACTION steps. */
export const APPROVAL_CREATION_ACTION_KEYS = [
  'create_attendance_approval',
  'create_approval_request'
] as const;

export const REMOVED_INTERNAL_ACTION_KEYS = [
  'recalculate_reporting_manager',
  'flag_vacant_head',
  'mark_department_head_missing',
  ...APPROVAL_CREATION_ACTION_KEYS
] as const;

export function isApprovalCreationAction(actionKey: string): boolean {
  return (APPROVAL_CREATION_ACTION_KEYS as readonly string[]).includes(actionKey);
}

export function isRemovedInternalAction(actionKey: string): boolean {
  return (REMOVED_INTERNAL_ACTION_KEYS as readonly string[]).includes(actionKey);
}

export const ACTION_CATALOG: Record<string, { key: string; label: string }> = {
  create_onboarding_checklist_from_template: { key: 'create_onboarding_checklist_from_template', label: 'Create onboarding checklist from template' },
  create_offboarding_checklist_from_template: { key: 'create_offboarding_checklist_from_template', label: 'Create offboarding checklist from template' },
  create_one_time_task: { key: 'create_one_time_task', label: 'Create one-time task' },
  update_leave_status: { key: 'update_leave_status', label: 'Update leave request status' },
  send_webhook: { key: 'send_webhook', label: 'Send webhook' },
  convert_attendance_to_full_day_leave: { key: 'convert_attendance_to_full_day_leave', label: 'Convert attendance to full-day leave' },
  convert_attendance_to_half_day_leave: { key: 'convert_attendance_to_half_day_leave', label: 'Convert attendance to half-day leave' },
  deduct_late_time_from_leave_balance: { key: 'deduct_late_time_from_leave_balance', label: 'Deduct late time from leave balance' },
  create_attendance_alert: { key: 'create_attendance_alert', label: 'Create attendance alert' }
};

export const CHECKLIST_TEMPLATE_ACTIONS: Record<string, ChecklistTemplateType> = {
  create_onboarding_checklist_from_template: 'onboarding',
  create_offboarding_checklist_from_template: 'offboarding'
};

export function isChecklistTemplateAction(actionKey: string): boolean {
  return actionKey in CHECKLIST_TEMPLATE_ACTIONS;
}

export function getChecklistTemplateTypeForAction(actionKey: string): ChecklistTemplateType | null {
  return CHECKLIST_TEMPLATE_ACTIONS[actionKey] ?? null;
}

export function getActiveChecklistTemplatesForAction(actionKey: string) {
  const type = getChecklistTemplateTypeForAction(actionKey);
  if (!type) return [];
  return useChecklistTemplateStore.getState().getActiveTemplatesByType(type);
}

export function isValidChecklistTemplateForAction(actionKey: string, templateId: string): boolean {
  const type = getChecklistTemplateTypeForAction(actionKey);
  if (!type || !templateId) return false;
  const template = useChecklistTemplateStore.getState().getTemplateById(templateId);
  return Boolean(template && template.status === 'active' && template.type === type);
}

const EMPLOYEE_CREATED_CONDITION = ['department', 'position', 'reporting_manager'] as const;
const EMPLOYEE_OFFBOARDING_CONDITION = ['department', 'position', 'reporting_manager', 'department_head'] as const;
const ORG_POSITION_CONDITION = [
  'new_position',
  'previous_position',
  'new_department',
  'previous_department',
  'reporting_manager',
  'department_head'
] as const;
const ORG_DEPARTMENT_CONDITION = ['department', 'reporting_manager'] as const;
const ORG_HEAD_CONDITION = ['department', 'department_head'] as const;
const REPORTING_MANAGER_MISSING_CONDITION = ['department', 'position', 'reporting_manager'] as const;
const LEAVE_CONDITION = ['leave_type', 'leave_days', 'department', 'reporting_manager'] as const;
const ATTENDANCE_LATE_CONDITION = ['late_minutes', 'department', 'position', 'reporting_manager'] as const;
const ATTENDANCE_CORRECTION_CONDITION = ['department', 'employee_status', 'reporting_manager'] as const;
const MONITORING_CONDITION = ['severity', 'department', 'reporting_manager'] as const;

const TRIGGER_ACTIONS: Record<DemoTriggerKey, string[]> = {
  employee_created: ['create_onboarding_checklist_from_template', 'create_one_time_task'],
  employee_offboarding_started: ['create_offboarding_checklist_from_template', 'create_one_time_task'],
  position_assignment_changed: ['create_one_time_task'],
  department_changed: ['create_one_time_task'],
  department_head_changed: ['create_one_time_task'],
  reporting_manager_missing: ['create_one_time_task'],
  leave_request_submitted: ['update_leave_status', 'create_one_time_task'],
  attendance_correction_submitted: ['create_one_time_task'],
  employee_checked_in_late: [
    'convert_attendance_to_full_day_leave',
    'convert_attendance_to_half_day_leave',
    'deduct_late_time_from_leave_balance',
    'create_attendance_alert',
    'create_one_time_task'
  ],
  app_usage_violation_detected: ['create_one_time_task', 'send_webhook'],
  idle_time_exceeded_threshold: ['create_one_time_task', 'send_webhook'],
  device_offline_too_long: ['create_one_time_task', 'send_webhook'],
  location_mismatch_detected: ['create_one_time_task', 'send_webhook'],
  monitoring_alert_manually_created: ['create_one_time_task', 'send_webhook']
};

const TRIGGER_CONDITION_FIELDS: Record<DemoTriggerKey, readonly string[]> = {
  employee_created: EMPLOYEE_CREATED_CONDITION,
  employee_offboarding_started: EMPLOYEE_OFFBOARDING_CONDITION,
  position_assignment_changed: ORG_POSITION_CONDITION,
  department_changed: ORG_DEPARTMENT_CONDITION,
  department_head_changed: ORG_HEAD_CONDITION,
  reporting_manager_missing: REPORTING_MANAGER_MISSING_CONDITION,
  leave_request_submitted: LEAVE_CONDITION,
  attendance_correction_submitted: ATTENDANCE_CORRECTION_CONDITION,
  employee_checked_in_late: ATTENDANCE_LATE_CONDITION,
  app_usage_violation_detected: MONITORING_CONDITION,
  idle_time_exceeded_threshold: MONITORING_CONDITION,
  device_offline_too_long: MONITORING_CONDITION,
  location_mismatch_detected: MONITORING_CONDITION,
  monitoring_alert_manually_created: MONITORING_CONDITION
};

const APPROVAL_TRIGGERS: DemoTriggerKey[] = [
  'leave_request_submitted',
  'attendance_correction_submitted'
];

export const APPROVER_TARGET_TYPES: PersonTargetType[] = [
  'Reporting Manager',
  'Department Head',
  'Specific Position',
  'Specific Employee',
  'Role'
];

export const NOTIFICATION_TARGET_TYPES: PersonTargetType[] = [
  'Employee',
  'Reporting Manager',
  'Department Head',
  'Specific Position',
  'Specific Employee',
  'Role'
];

export const ALERT_TARGET_TYPES: TargetType[] = [
  'Reporting Manager',
  'Department Head',
  'Specific Position',
  'Specific Employee',
  'Role'
];

export const STEP_MISMATCH_MESSAGE = 'This step does not match the selected trigger. Update or remove it.';

const DELAY_AFTER_TYPES: StepType[] = ['notification', 'approval', 'alert', 'action'];

export function getTemplateLabel(templateId: TemplateId | string | undefined): string {
  return CREATE_AUTOMATION_CARDS.find(c => c.id === templateId)?.name ?? '—';
}

export function isDemoTrigger(key: string): key is DemoTriggerKey {
  return (DEMO_TRIGGER_KEYS as readonly string[]).includes(key);
}

export function triggerLabelForKey(key: string): string {
  for (const group of Object.values(TRIGGER_GROUPS)) {
    const match = group.triggers.find(t => t.key === key);
    if (match) return match.label;
  }
  return key || 'Choose a trigger';
}

export function getTriggerKeyFromSteps(steps: AutomationStep[]): string {
  return getMainChainSteps(steps).find(s => s.type === 'trigger')?.config.triggerKey ?? '';
}

export function isTriggerSelected(triggerKey: string): boolean {
  return Boolean(triggerKey && isDemoTrigger(triggerKey));
}

export function getAllowedActions(triggerKey: string): { key: string; label: string }[] {
  if (!isDemoTrigger(triggerKey)) return [];
  return TRIGGER_ACTIONS[triggerKey].map(key => ACTION_CATALOG[key]).filter(Boolean);
}

export function getFilteredActionGroups(triggerKey: string): Record<string, { key: string; label: string }[]> {
  const actions = getAllowedActions(triggerKey);
  if (actions.length === 0) return {};
  if (triggerKey === 'employee_checked_in_late') {
    const attendanceLeave = actions.filter(a =>
      [
        'convert_attendance_to_full_day_leave',
        'convert_attendance_to_half_day_leave',
        'deduct_late_time_from_leave_balance',
        'create_attendance_alert'
      ].includes(a.key)
    );
    const tasks = actions.filter(a => a.key === 'create_one_time_task');
    const groups: Record<string, { key: string; label: string }[]> = {};
    if (attendanceLeave.length > 0) groups['Attendance & Leave'] = attendanceLeave;
    if (tasks.length > 0) groups.Tasks = tasks;
    return groups;
  }
  return { Actions: actions };
}

export function isActionAllowedForTrigger(triggerKey: string, actionKey: string): boolean {
  if (!isDemoTrigger(triggerKey)) return false;
  return TRIGGER_ACTIONS[triggerKey].includes(actionKey);
}

export function getAllowedConditionFieldKeys(triggerKey: string): string[] {
  if (!isDemoTrigger(triggerKey)) return [];
  return [...TRIGGER_CONDITION_FIELDS[triggerKey]];
}

export function isConditionFieldAllowed(triggerKey: string, fieldKey: string): boolean {
  return getAllowedConditionFieldKeys(triggerKey).includes(fieldKey);
}

export function canShowApproval(triggerKey: string): boolean {
  return isDemoTrigger(triggerKey) && APPROVAL_TRIGGERS.includes(triggerKey);
}

function hasEndStep(steps: AutomationStep[]): boolean {
  return getMainChainSteps(steps).some(s => s.type === 'end');
}

function findAfterStep(steps: AutomationStep[], afterStepId: string | null): AutomationStep | undefined {
  const main = getMainChainSteps(steps);
  if (!afterStepId) return undefined;
  return main.find(s => s.id === afterStepId);
}

function hasAllowedActionsForTrigger(triggerKey: string): boolean {
  return getAllowedActions(triggerKey).length > 0;
}

function automationHasApprovalStep(steps: AutomationStep[]): boolean {
  return steps.some(s => s.type === 'approval');
}

function automationHasApprovalCreationAction(steps: AutomationStep[]): boolean {
  return steps.some(
    s => s.type === 'action' && isApprovalCreationAction(String(s.config.actionKey ?? ''))
  );
}

export function getAllowedAddStepOptions(
  triggerKey: string,
  steps: AutomationStep[],
  afterStepId: string | null
): AddStepOption[] {
  if (!isTriggerSelected(triggerKey)) return [];

  const afterStep = findAfterStep(steps, afterStepId);
  const options: AddStepOption[] = [];
  const canAddAction = hasAllowedActionsForTrigger(triggerKey);

  const addUnique = (opt: AddStepOption) => {
    if (!options.includes(opt)) options.push(opt);
  };

  if (!afterStep || afterStep.type === 'trigger') {
    addUnique('condition');
    if (canAddAction) addUnique('action');
    if (canShowApproval(triggerKey)) addUnique('approval');
    addUnique('notification');
    addUnique('alert');
    if (!hasEndStep(steps)) addUnique('end');
    return options;
  }

  if (afterStep.type === 'condition') {
    addUnique('condition');
    if (canAddAction) addUnique('action');
    if (canShowApproval(triggerKey)) addUnique('approval');
    addUnique('notification');
    addUnique('alert');
    if (!afterStep.config.hasBranch) addUnique('branch');
    if (!hasEndStep(steps)) addUnique('end');
    return options;
  }

  if (DELAY_AFTER_TYPES.includes(afterStep.type)) {
    addUnique('delay');
  }

  addUnique('condition');
  if (canAddAction) addUnique('action');
  if (canShowApproval(triggerKey)) addUnique('approval');
  addUnique('notification');
  addUnique('alert');
  if (!hasEndStep(steps)) addUnique('end');

  return options;
}

export function stepMatchesTrigger(step: AutomationStep, triggerKey: string): boolean {
  if (!isTriggerSelected(triggerKey)) {
    return step.type === 'trigger' || step.type === 'end';
  }

  switch (step.type) {
    case 'trigger':
      return step.config.triggerKey === triggerKey;
    case 'action': {
      const actionKey = String(step.config.actionKey ?? '');
      if (!actionKey) return true;
      if (isRemovedInternalAction(actionKey)) return false;
      if (!isActionAllowedForTrigger(triggerKey, actionKey)) return false;
      if (isChecklistTemplateAction(actionKey)) {
        const templateId = String(step.config.checklistTemplateId ?? '');
        if (!templateId) return true;
        return isValidChecklistTemplateForAction(actionKey, templateId);
      }
      return true;
    }
    case 'condition':
      return conditionClausesMatchTrigger(step.config, triggerKey, getAllowedConditionFieldKeys(triggerKey));
    case 'approval':
      return canShowApproval(triggerKey);
    case 'notification':
    case 'alert':
    case 'delay':
    case 'end':
      return true;
    default:
      return true;
  }
}

export interface ContextValidationIssue {
  id: string;
  message: string;
  stepId?: string;
}

export function validateStepForTrigger(step: AutomationStep, triggerKey: string): ContextValidationIssue[] {
  const issues: ContextValidationIssue[] = [];

  if (step.type === 'trigger') return issues;

  if (!isTriggerSelected(triggerKey)) {
    if (step.type !== 'end') {
      issues.push({ id: `step-no-trigger-${step.id}`, message: 'Choose a trigger first.', stepId: step.id });
    }
    return issues;
  }

  if (!stepMatchesTrigger(step, triggerKey)) {
    issues.push({ id: `step-mismatch-${step.id}`, message: STEP_MISMATCH_MESSAGE, stepId: step.id });
  }

  if (step.type === 'action') {
    if (!step.config.actionKey) {
      issues.push({ id: `action-empty-${step.id}`, message: 'Choose an action for this step.', stepId: step.id });
    } else if (isApprovalCreationAction(String(step.config.actionKey))) {
      issues.push({
        id: `action-approval-removed-${step.id}`,
        message: 'Approval routing belongs in an Approval step — remove this action and add an Approval step instead.',
        stepId: step.id
      });
    } else if (isRemovedInternalAction(String(step.config.actionKey))) {
      issues.push({ id: `action-removed-${step.id}`, message: 'This action is not available. Choose a business follow-up action instead.', stepId: step.id });
    } else if (isChecklistTemplateAction(String(step.config.actionKey))) {
      const templateId = String(step.config.checklistTemplateId ?? '');
      if (!templateId) {
        issues.push({ id: `checklist-template-${step.id}`, message: 'Choose an active checklist template.', stepId: step.id });
      } else if (!isValidChecklistTemplateForAction(String(step.config.actionKey), templateId)) {
        issues.push({ id: `checklist-template-invalid-${step.id}`, message: 'Choose an active template of the correct type.', stepId: step.id });
      }
    } else if (isLateAttendanceLeaveAction(String(step.config.actionKey))) {
      if (!step.config.leaveTypeId) {
        issues.push({
          id: `late-action-leave-${step.id}`,
          message: 'Leave type is required for this action.',
          stepId: step.id
        });
      }
      const workdayHours = Number(step.config.workdayHours ?? 0);
      if (!workdayHours || workdayHours <= 0) {
        issues.push({
          id: `late-action-hours-${step.id}`,
          message: 'Workday hours must be greater than 0.',
          stepId: step.id
        });
      }
    } else if (isOneTimeTaskAction(String(step.config.actionKey))) {
      issues.push(...validateOneTimeTaskConfig(step.id, step.config).map(i => ({ ...i, stepId: step.id })));
    }
  }

  if (step.type === 'condition') {
    issues.push(
      ...validateConditionClauses(step, triggerKey, getAllowedConditionFieldKeys(triggerKey)).map(i => ({
        ...i,
        stepId: step.id
      }))
    );
  }

  return issues;
}

export function validateAutomationContext(automation: Automation): ContextValidationIssue[] {
  const issues: ContextValidationIssue[] = [];
  const main = getMainChainSteps(automation.steps);
  const trigger = main.find(s => s.type === 'trigger');
  const triggerKey = trigger?.config.triggerKey ?? '';

  if (!trigger?.config.triggerKey) {
    issues.push({ id: 'no-trigger', message: 'Automation needs a trigger.' });
  } else if (!isDemoTrigger(triggerKey)) {
    issues.push({ id: 'invalid-trigger', message: 'Choose a valid trigger.' });
  }

  const usefulSteps = main.filter(s => s.type !== 'trigger' && s.type !== 'end');
  if (isTriggerSelected(triggerKey) && usefulSteps.length === 0) {
    issues.push({ id: 'no-steps', message: 'Add at least one step after the trigger.' });
  }

  if (isTriggerSelected(triggerKey) && !main.some(s => s.type === 'end')) {
    issues.push({ id: 'no-end', message: 'Automation should end clearly — add an End step.' });
  }

  if (automationHasApprovalStep(automation.steps) && automationHasApprovalCreationAction(automation.steps)) {
    issues.push({
      id: 'duplicate-approval-routing',
      message: 'Remove approval creation actions — the Approval step already handles routing for this request.'
    });
  }

  for (const step of automation.steps) {
    issues.push(...validateStepForTrigger(step, triggerKey));

    if (step.type === 'condition' && step.config.hasBranch) {
      const yesSteps = getBranchSteps(automation.steps, step.id, 'yes');
      const noSteps = getBranchSteps(automation.steps, step.id, 'no');
      if (yesSteps.length === 0) issues.push({ id: `yes-${step.id}`, message: 'Add at least one step to the YES path.', stepId: step.id });
      if (noSteps.length === 0) issues.push({ id: `no-${step.id}`, message: 'Add at least one step to the NO path.', stepId: step.id });
    }
  }

  return issues;
}
