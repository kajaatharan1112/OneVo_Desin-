import type { StepConfig } from './automationTypes';
import type { EmployeeOption, PositionOption } from './alertAssignmentUtils';

export type PersonTargetType =
  | 'Employee'
  | 'Reporting Manager'
  | 'Department Head'
  | 'Specific Position'
  | 'Specific Employee'
  | 'Role';

export const PERSON_TARGET_TYPES: PersonTargetType[] = [
  'Employee',
  'Reporting Manager',
  'Department Head',
  'Specific Position',
  'Specific Employee',
  'Role'
];

export const ROLE_OPTIONS = [
  'HR Admin',
  'Finance Admin',
  'Payroll Admin',
  'Compliance Admin',
  'IT Admin',
  'Department Manager'
] as const;

export type TargetFieldPrefix = 'approver' | 'recipient' | 'assignTo' | 'escalation';

export function targetTypeKey(prefix: TargetFieldPrefix): keyof StepConfig {
  if (prefix === 'approver') return 'approverType';
  if (prefix === 'recipient') return 'recipientType';
  if (prefix === 'assignTo') return 'assignToType';
  return 'escalationTargetType';
}

export function targetRoleKey(prefix: TargetFieldPrefix): keyof StepConfig {
  if (prefix === 'approver') return 'approverRole';
  if (prefix === 'recipient') return 'recipientRole';
  if (prefix === 'assignTo') return 'assignToRole';
  return 'escalationRole';
}

export function targetPositionKey(prefix: TargetFieldPrefix): keyof StepConfig {
  if (prefix === 'approver') return 'approverPositionId';
  if (prefix === 'recipient') return 'recipientPositionId';
  if (prefix === 'assignTo') return 'assignToPositionId';
  return 'escalationPositionId';
}

export function targetEmployeeKey(prefix: TargetFieldPrefix): keyof StepConfig {
  if (prefix === 'approver') return 'approverEmployeeId';
  if (prefix === 'recipient') return 'recipientEmployeeId';
  if (prefix === 'assignTo') return 'assignToEmployeeId';
  return 'escalationEmployeeId';
}

export function formatPersonTargetPhrase(
  type: PersonTargetType | '' | undefined,
  config: StepConfig,
  prefix: TargetFieldPrefix,
  positions: PositionOption[],
  employees: EmployeeOption[]
): string {
  const roleKey = targetRoleKey(prefix);
  const posKey = targetPositionKey(prefix);
  const empKey = targetEmployeeKey(prefix);

  switch (type) {
    case 'Employee':
      return 'employee';
    case 'Reporting Manager':
      return 'reporting manager';
    case 'Department Head':
      return 'department head';
    case 'Role':
      return config[roleKey] ? `${config[roleKey]} role` : 'role';
    case 'Specific Position': {
      const name = positions.find(p => p.id === config[posKey])?.name;
      return name ? `${name} position` : 'position';
    }
    case 'Specific Employee': {
      const name = employees.find(e => e.id === config[empKey])?.name;
      return name || 'employee';
    }
    default:
      return 'recipient';
  }
}

export function validatePersonTarget(
  stepId: string,
  config: StepConfig,
  prefix: TargetFieldPrefix,
  label: string
): { id: string; message: string }[] {
  const issues: { id: string; message: string }[] = [];
  const type = config[targetTypeKey(prefix)] as PersonTargetType | undefined;
  if (!type) {
    issues.push({
      id: `${prefix}-type-${stepId}`,
      message: prefix === 'approver' ? 'Approval step requires approver type.' : `${label} type is required.`
    });
    return issues;
  }
  if (type === 'Role' && !config[targetRoleKey(prefix)]) {
    issues.push({
      id: `${prefix}-role-${stepId}`,
      message: prefix === 'approver' ? 'Role requires selected role.' : `Choose a role for ${label}.`
    });
  }
  if (type === 'Specific Position' && !config[targetPositionKey(prefix)]) {
    issues.push({
      id: `${prefix}-pos-${stepId}`,
      message: prefix === 'approver' ? 'Specific Position requires selected position.' : `Choose a position for ${label}.`
    });
  }
  if (type === 'Specific Employee' && !config[targetEmployeeKey(prefix)]) {
    issues.push({
      id: `${prefix}-emp-${stepId}`,
      message: prefix === 'approver' ? 'Specific Employee requires selected employee.' : `Choose an employee for ${label}.`
    });
  }
  return issues;
}
