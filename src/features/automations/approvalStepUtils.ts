import type { AutomationStep, StepConfig } from './automationTypes';
import type { EmployeeOption, PositionOption } from './alertAssignmentUtils';
import { formatPersonTargetPhrase, type PersonTargetType } from './personTargetUtils';
import {
  clampTaskHours,
  formatDurationHHMM,
  normalizeTaskMinutes,
  TASK_DEFAULT_HOURS,
  TASK_DEFAULT_MINUTES
} from './oneTimeTaskUtils';
function getMainChainSteps(steps: AutomationStep[]): AutomationStep[] {
  return steps.filter(s => s.sectionId === 'main').sort((a, b) => a.sortOrder - b.sortOrder);
}

export const ON_TIMEOUT_OPTIONS = [
  'Do nothing',
  'Create alert',
  'Notify role/person',
  'Escalate to another approver'
] as const;

export const ON_REJECTED_OPTIONS = [
  'Stop automation',
  'Notify employee',
  'Create alert'
] as const;

export type OnTimeoutOption = (typeof ON_TIMEOUT_OPTIONS)[number];
export type OnRejectedOption = (typeof ON_REJECTED_OPTIONS)[number];

export const ALERT_AFTER_APPROVAL_WARNING =
  'Alerts after approval run immediately unless you add a delay or condition.';

export function getDefaultApprovalStepConfig(): Partial<StepConfig> {
  return {
    approverType: 'Reporting Manager',
    approvalTimeoutEnabled: false,
    approvalTimeoutHours: 24,
    approvalTimeoutMinutes: 0,
    onApproved: 'Continue',
    onRejected: 'Notify employee',
    onTimeout: 'Do nothing',
    timeoutAlertSeverity: 'medium'
  };
}

export function isApprovalTimeoutEnabled(config: StepConfig): boolean {
  if (typeof config.approvalTimeoutEnabled === 'boolean') {
    return config.approvalTimeoutEnabled;
  }
  const legacy = String(config.approvalTimeout ?? '');
  return Boolean(legacy && legacy !== 'No timeout');
}

export function getApprovalTimeoutDuration(config: StepConfig): { hours: number; minutes: number } {
  if (config.approvalTimeoutHours != null) {
    return {
      hours: clampTaskHours(Number(config.approvalTimeoutHours)),
      minutes: normalizeTaskMinutes(Number(config.approvalTimeoutMinutes ?? 0))
    };
  }

  const legacy = String(config.approvalTimeout ?? '');
  if (legacy === '24 hours') return { hours: 24, minutes: 0 };
  if (legacy === '48 hours') return { hours: 48, minutes: 0 };
  if (legacy === '3 days') return { hours: 72, minutes: 0 };
  if (legacy === 'Custom') return { hours: 24, minutes: 0 };
  return { hours: TASK_DEFAULT_HOURS, minutes: TASK_DEFAULT_MINUTES };
}

function formatTargetFromKeys(
  config: StepConfig,
  typeKey: keyof StepConfig,
  roleKey: keyof StepConfig,
  positionKey: keyof StepConfig,
  employeeKey: keyof StepConfig,
  positions: PositionOption[],
  employees: EmployeeOption[]
): string {
  const type = config[typeKey] as PersonTargetType | undefined;
  const pseudoConfig: StepConfig = {
    approverType: type,
    approverRole: config[roleKey] as string,
    approverPositionId: config[positionKey] as string,
    approverEmployeeId: config[employeeKey] as string
  };
  return formatPersonTargetPhrase(type, pseudoConfig, 'approver', positions, employees);
}

function formatTimeoutOutcome(
  config: StepConfig,
  positions: PositionOption[],
  employees: EmployeeOption[]
): string | null {
  const action = String(config.onTimeout ?? 'Do nothing') as OnTimeoutOption;
  if (action === 'Do nothing') return null;

  if (action === 'Create alert') {
    const who = formatTargetFromKeys(
      config,
      'timeoutAlertAssignToType',
      'timeoutAlertAssignToRole',
      'timeoutAlertAssignToPositionId',
      'timeoutAlertAssignToEmployeeId',
      positions,
      employees
    );
    return `if timeout: create alert and assign to ${who}`;
  }

  if (action === 'Notify role/person') {
    const who = formatTargetFromKeys(
      config,
      'timeoutNotifyType',
      'timeoutNotifyRole',
      'timeoutNotifyPositionId',
      'timeoutNotifyEmployeeId',
      positions,
      employees
    );
    return `if timeout: notify ${who}`;
  }

  const who = formatTargetFromKeys(
    config,
    'timeoutEscalationApproverType',
    'timeoutEscalationApproverRole',
    'timeoutEscalationApproverPositionId',
    'timeoutEscalationApproverEmployeeId',
    positions,
    employees
  );
  return `if timeout: escalate to ${who}`;
}

function formatRejectedOutcome(config: StepConfig): string | null {
  const rejected = normalizeRejectedOption(config.onRejected);
  if (rejected === 'Stop automation') return 'if rejected: stop automation';
  if (rejected === 'Notify employee') return 'if rejected: notify employee';
  return 'if rejected: create alert';
}

export function normalizeRejectedOption(value: string | undefined): OnRejectedOption {
  if (value === 'Notify requester') return 'Notify employee';
  if (ON_REJECTED_OPTIONS.includes(value as OnRejectedOption)) {
    return value as OnRejectedOption;
  }
  return 'Stop automation';
}

export function approvalStepPreview(
  config: StepConfig,
  positions: PositionOption[],
  employees: EmployeeOption[]
): string {
  const who = formatPersonTargetPhrase(
    config.approverType as PersonTargetType,
    config,
    'approver',
    positions,
    employees
  );

  const parts = [`Ask ${who} to approve`];

  if (isApprovalTimeoutEnabled(config)) {
    const { hours, minutes } = getApprovalTimeoutDuration(config);
    parts.push(`timeout ${formatDurationHHMM(hours, minutes)}`);
    const timeoutPart = formatTimeoutOutcome(config, positions, employees);
    if (timeoutPart) parts.push(timeoutPart);
  }

  const rejectedPart = formatRejectedOutcome(config);
  if (rejectedPart && normalizeRejectedOption(config.onRejected) !== 'Stop automation') {
    parts.push(rejectedPart);
  }

  return parts.join(' · ');
}

export function isAlertImmediatelyAfterApproval(
  steps: AutomationStep[],
  alertStepId: string
): boolean {
  const main = getMainChainSteps(steps);
  const index = main.findIndex(s => s.id === alertStepId);
  if (index <= 0) return false;
  return main[index - 1]?.type === 'approval';
}

export function getAlertAfterApprovalWarnings(
  steps: AutomationStep[]
): { id: string; message: string; stepId: string }[] {
  const main = getMainChainSteps(steps);
  const warnings: { id: string; message: string; stepId: string }[] = [];

  for (let i = 1; i < main.length; i++) {
    if (main[i - 1].type === 'approval' && main[i].type === 'alert') {
      warnings.push({
        id: `alert-after-approval-${main[i].id}`,
        message: ALERT_AFTER_APPROVAL_WARNING,
        stepId: main[i].id
      });
    }
  }

  return warnings;
}

export function validateApprovalStep(
  stepId: string,
  config: StepConfig
): { id: string; message: string; severity?: 'error' | 'warning' }[] {
  const issues: { id: string; message: string; severity?: 'error' | 'warning' }[] = [];

  if (!isApprovalTimeoutEnabled(config)) return issues;

  const action = String(config.onTimeout ?? 'Do nothing') as OnTimeoutOption;

  if (action === 'Create alert' && !config.timeoutAlertAssignToType) {
    issues.push({
      id: `approval-timeout-alert-${stepId}`,
      message: 'Choose who receives the timeout alert.',
      severity: 'error'
    });
  }

  if (action === 'Notify role/person' && !config.timeoutNotifyType) {
    issues.push({
      id: `approval-timeout-notify-${stepId}`,
      message: 'Choose who to notify on timeout.',
      severity: 'error'
    });
  }

  if (action === 'Escalate to another approver' && !config.timeoutEscalationApproverType) {
    issues.push({
      id: `approval-timeout-escalate-${stepId}`,
      message: 'Choose who approves after timeout escalation.',
      severity: 'error'
    });
  }

  return issues;
}
