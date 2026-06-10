import type { AutomationStep, StepConfig } from './automationTypes';

export type TargetType =
  | 'Reporting Manager'
  | 'Department Head'
  | 'Specific Position'
  | 'Specific Employee'
  | 'Role';

export const TARGET_TYPE_OPTIONS: TargetType[] = [
  'Reporting Manager',
  'Department Head',
  'Specific Position',
  'Specific Employee',
  'Role'
];

import { ROLE_OPTIONS } from './personTargetUtils';

export { ROLE_OPTIONS };

export const POSITION_NAME_OPTIONS = [
  'CEO',
  'CTO',
  'CFO',
  'HR Manager',
  'Engineering Manager',
  'Backend Lead',
  'Frontend Lead',
  'QA Lead',
  'Finance Manager'
] as const;

export interface PositionOption {
  id: string;
  name: string;
}

export interface EmployeeOption {
  id: string;
  name: string;
}

function resolvePositionName(
  positionId: string | undefined,
  positions: PositionOption[]
): string {
  return positions.find(p => p.id === positionId)?.name ?? '';
}

function resolveEmployeeName(
  employeeId: string | undefined,
  employees: EmployeeOption[]
): string {
  return employees.find(e => e.id === employeeId)?.name ?? '';
}

/** Normalize legacy assignTo values from older seed data */
export function normalizeAssignToType(config: StepConfig): TargetType | '' {
  if (config.assignToType) return config.assignToType as TargetType;
  const legacy = config.assignTo as string | undefined;
  if (legacy === 'Reporting Manager' || legacy === 'Department Head') return legacy;
  if (legacy === 'HR Admin' || legacy === 'Finance Admin' || legacy === 'Specific Role') {
    return 'Role';
  }
  return '';
}

export function normalizeAssignToRole(config: StepConfig): string {
  if (config.assignToRole) return String(config.assignToRole);
  const legacy = config.assignTo as string | undefined;
  if (legacy && ROLE_OPTIONS.includes(legacy as (typeof ROLE_OPTIONS)[number])) return legacy;
  return '';
}

export function formatTargetPhrase(
  type: TargetType | '' | undefined,
  config: StepConfig,
  positions: PositionOption[],
  employees: EmployeeOption[],
  prefix: 'assign' | 'escalate'
): string {
  const roleKey = prefix === 'assign' ? 'assignToRole' : 'escalationRole';
  const positionKey = prefix === 'assign' ? 'assignToPositionId' : 'escalationPositionId';
  const employeeKey = prefix === 'assign' ? 'assignToEmployeeId' : 'escalationEmployeeId';

  switch (type) {
    case 'Reporting Manager':
      return 'reporting manager';
    case 'Department Head':
      return 'department head';
    case 'Role': {
      const role = String(config[roleKey] ?? '');
      return role ? `${role} role` : 'role';
    }
    case 'Specific Position': {
      const name = resolvePositionName(String(config[positionKey] ?? ''), positions);
      return name ? `${name} position` : 'position';
    }
    case 'Specific Employee': {
      const name = resolveEmployeeName(String(config[employeeKey] ?? ''), employees);
      return name || 'employee';
    }
    default:
      return prefix === 'assign' ? 'assignee' : 'target';
  }
}

export function alertStepPreview(
  step: AutomationStep,
  positions: PositionOption[],
  employees: EmployeeOption[]
): string {
  const c = step.config;
  const assignType = (c.assignToType as TargetType | undefined) || normalizeAssignToType(c);
  const previewConfig: StepConfig = {
    ...c,
    assignToRole: c.assignToRole || normalizeAssignToRole(c)
  };
  const severity = c.severity ?? 'medium';
  const assignPhrase = formatTargetPhrase(assignType, previewConfig, positions, employees, 'assign');
  let text = `Create ${severity} alert and assign to ${assignPhrase}`;

  if (c.escalate) {
    const escType = c.escalationTargetType as TargetType | undefined;
    const escPhrase = formatTargetPhrase(escType, previewConfig, positions, employees, 'escalate');
    const delay = c.sla ?? '24 hours';
    text += `. Escalate to ${escPhrase} after ${delay} if unresolved.`;
  }

  return text;
}

export function validateAlertAssignment(
  stepId: string,
  config: StepConfig
): { id: string; message: string }[] {
  const issues: { id: string; message: string }[] = [];
  const assignType = (config.assignToType as TargetType | undefined) || normalizeAssignToType(config);
  const assignRole = String(config.assignToRole ?? '') || normalizeAssignToRole(config);

  if (!assignType) {
    issues.push({ id: `alert-type-${stepId}`, message: 'Choose an Assign To type for the alert.' });
  } else if (assignType === 'Role' && !assignRole) {
    issues.push({ id: `alert-role-${stepId}`, message: 'Choose a role for Assign To.' });
  } else if (assignType === 'Specific Position' && !config.assignToPositionId) {
    issues.push({ id: `alert-pos-${stepId}`, message: 'Choose a position for Assign To.' });
  } else if (assignType === 'Specific Employee' && !config.assignToEmployeeId) {
    issues.push({ id: `alert-emp-${stepId}`, message: 'Choose an employee for Assign To.' });
  }

  if (config.escalate) {
    const escType = config.escalationTargetType as TargetType | undefined;
    if (!escType) {
      issues.push({ id: `alert-esc-type-${stepId}`, message: 'Choose an Escalation Target type.' });
    } else if (escType === 'Role' && !config.escalationRole) {
      issues.push({ id: `alert-esc-role-${stepId}`, message: 'Choose a role for Escalation Target.' });
    } else if (escType === 'Specific Position' && !config.escalationPositionId) {
      issues.push({ id: `alert-esc-pos-${stepId}`, message: 'Choose a position for Escalation Target.' });
    } else if (escType === 'Specific Employee' && !config.escalationEmployeeId) {
      issues.push({ id: `alert-esc-emp-${stepId}`, message: 'Choose an employee for Escalation Target.' });
    }
  }

  return issues;
}

export function filterPositionOptions(allPositions: PositionOption[]): PositionOption[] {
  return POSITION_NAME_OPTIONS.flatMap(name => {
    const match = allPositions.find(p => p.name === name);
    return match ? [match] : [];
  });
}
