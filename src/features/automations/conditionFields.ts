import type { AutomationStep, ConditionClause, StepConfig } from './automationTypes';
import type { EmployeeOption, PositionOption } from './alertAssignmentUtils';

export type ConditionFieldType = 'position' | 'department' | 'person' | 'enum' | 'boolean' | 'number';

export type ConditionOperator =
  | 'is'
  | 'is_not'
  | 'exists'
  | 'does_not_exist'
  | 'is_true'
  | 'is_false'
  | 'equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal';

export interface ConditionFieldDef {
  key: string;
  label: string;
  type: ConditionFieldType;
  valueOptions?: { value: string; label: string }[];
}

export interface ConditionOrgContext {
  positions: PositionOption[];
  employees: EmployeeOption[];
  departments: { id: string; name: string }[];
}

const OPERATORS_BY_TYPE: Record<ConditionFieldType, ConditionOperator[]> = {
  position: ['is', 'is_not'],
  department: ['is', 'is_not'],
  person: ['exists', 'does_not_exist', 'is', 'is_not'],
  enum: ['is', 'is_not'],
  boolean: ['is_true', 'is_false'],
  number: ['equals', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal']
};

export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  is: 'is',
  is_not: 'is not',
  exists: 'exists',
  does_not_exist: 'does not exist',
  is_true: 'is true',
  is_false: 'is false',
  equals: 'equals',
  greater_than: 'is greater than',
  less_than: 'is less than',
  greater_than_or_equal: 'is greater than or equal to',
  less_than_or_equal: 'is less than or equal to'
};

const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'active', label: 'active' },
  { value: 'onboarding', label: 'onboarding' },
  { value: 'inactive', label: 'inactive' }
];

const POSITION_ASSIGNMENT_CHANGED_FIELDS: ConditionFieldDef[] = [
  { key: 'new_position', label: 'New Position', type: 'position' },
  { key: 'previous_position', label: 'Previous Position', type: 'position' },
  { key: 'new_department', label: 'New Department', type: 'department' },
  { key: 'previous_department', label: 'Previous Department', type: 'department' },
  { key: 'reporting_manager', label: 'Reporting Manager', type: 'person' },
  { key: 'department_head', label: 'Department Head', type: 'person' }
];

const ATTENDANCE_LATE_FIELDS: ConditionFieldDef[] = [
  { key: 'late_count_in_period', label: 'Late Count in Period', type: 'number' },
  { key: 'department', label: 'Department', type: 'department' },
  { key: 'reporting_manager', label: 'Reporting Manager', type: 'person' }
];

const ATTENDANCE_CORRECTION_FIELDS: ConditionFieldDef[] = [
  { key: 'department', label: 'Department', type: 'department' },
  { key: 'employee_status', label: 'Employee Status', type: 'enum', valueOptions: EMPLOYEE_STATUS_OPTIONS },
  { key: 'reporting_manager', label: 'Reporting Manager', type: 'person' }
];

const LEAVE_FIELDS: ConditionFieldDef[] = [
  { key: 'leave_type', label: 'Leave Type', type: 'enum', valueOptions: [
    { value: 'annual', label: 'Annual leave' },
    { value: 'sick', label: 'Sick leave' },
    { value: 'unpaid', label: 'Unpaid leave' }
  ]},
  { key: 'leave_days', label: 'Leave Days', type: 'number' },
  { key: 'department', label: 'Department', type: 'department' },
  { key: 'reporting_manager', label: 'Reporting Manager', type: 'person' }
];

const EMPLOYEE_CREATED_FIELDS: ConditionFieldDef[] = [
  { key: 'department', label: 'Department', type: 'department' },
  { key: 'position', label: 'Position', type: 'position' },
  { key: 'reporting_manager', label: 'Reporting Manager', type: 'person' }
];

const EMPLOYEE_OFFBOARDING_FIELDS: ConditionFieldDef[] = [
  { key: 'department', label: 'Department', type: 'department' },
  { key: 'position', label: 'Position', type: 'position' },
  { key: 'reporting_manager', label: 'Reporting Manager', type: 'person' },
  { key: 'department_head', label: 'Department Head', type: 'person' }
];

const DEPARTMENT_CHANGED_FIELDS: ConditionFieldDef[] = [
  { key: 'department', label: 'Department', type: 'department' },
  { key: 'reporting_manager', label: 'Reporting Manager', type: 'person' }
];

const DEPARTMENT_HEAD_CHANGED_FIELDS: ConditionFieldDef[] = [
  { key: 'department', label: 'Department', type: 'department' },
  { key: 'department_head', label: 'Department Head', type: 'person' }
];

const REPORTING_MANAGER_MISSING_FIELDS: ConditionFieldDef[] = [
  { key: 'department', label: 'Department', type: 'department' },
  { key: 'position', label: 'Position', type: 'position' },
  { key: 'reporting_manager', label: 'Reporting Manager', type: 'person' }
];

const MONITORING_TRIGGER_FIELDS: ConditionFieldDef[] = [
  { key: 'severity', label: 'Severity', type: 'enum', valueOptions: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ]},
  { key: 'department', label: 'Department', type: 'department' },
  { key: 'reporting_manager', label: 'Reporting Manager', type: 'person' }
];

const TRIGGER_CONDITION_FIELDS: Record<string, ConditionFieldDef[]> = {
  employee_created: EMPLOYEE_CREATED_FIELDS,
  employee_offboarding_started: EMPLOYEE_OFFBOARDING_FIELDS,
  position_assignment_changed: POSITION_ASSIGNMENT_CHANGED_FIELDS,
  department_changed: DEPARTMENT_CHANGED_FIELDS,
  department_head_changed: DEPARTMENT_HEAD_CHANGED_FIELDS,
  reporting_manager_missing: REPORTING_MANAGER_MISSING_FIELDS,
  employee_checked_in_late: ATTENDANCE_LATE_FIELDS,
  attendance_correction_submitted: ATTENDANCE_CORRECTION_FIELDS,
  leave_request_submitted: LEAVE_FIELDS,
  app_usage_violation_detected: MONITORING_TRIGGER_FIELDS,
  idle_time_exceeded_threshold: MONITORING_TRIGGER_FIELDS,
  device_offline_too_long: MONITORING_TRIGGER_FIELDS,
  location_mismatch_detected: MONITORING_TRIGGER_FIELDS,
  monitoring_alert_manually_created: MONITORING_TRIGGER_FIELDS
};

export function getConditionFieldsForTrigger(triggerKey: string, allowedFieldKeys?: string[]): ConditionFieldDef[] {
  const all = TRIGGER_CONDITION_FIELDS[triggerKey] ?? EMPLOYEE_CREATED_FIELDS;
  if (!allowedFieldKeys || allowedFieldKeys.length === 0) return all;
  return all.filter(f => allowedFieldKeys.includes(f.key));
}

export function getConditionFieldDef(triggerKey: string, fieldKey: string, allowedFieldKeys?: string[]): ConditionFieldDef | undefined {
  return getConditionFieldsForTrigger(triggerKey, allowedFieldKeys).find(f => f.key === fieldKey);
}

export function getOperatorsForField(field: ConditionFieldDef): ConditionOperator[] {
  return OPERATORS_BY_TYPE[field.type];
}

export function operatorNeedsValue(operator: ConditionOperator, field: ConditionFieldDef): boolean {
  if (field.type === 'boolean') return false;
  if (operator === 'exists' || operator === 'does_not_exist') return false;
  return true;
}

export function isOperatorValidForField(operator: string, field: ConditionFieldDef): boolean {
  return getOperatorsForField(field).includes(operator as ConditionOperator);
}

export function createEmptyConditionClause(): ConditionClause {
  return {
    id: `cc-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    field: '',
    operator: '',
    value: ''
  };
}

export function getConditionClauses(config: StepConfig): ConditionClause[] {
  if (Array.isArray(config.conditions) && config.conditions.length > 0) {
    return config.conditions;
  }
  const field = String(config.field ?? '');
  if (field) {
    return [{
      id: 'legacy',
      field,
      operator: String(config.operator ?? ''),
      value: String(config.value ?? '')
    }];
  }
  return [createEmptyConditionClause()];
}

function resolveValueLabel(
  field: ConditionFieldDef,
  value: string,
  org: ConditionOrgContext
): string {
  if (!value) return '';
  switch (field.type) {
    case 'position':
      return org.positions.find(p => p.id === value)?.name ?? value;
    case 'department':
      return org.departments.find(d => d.id === value)?.name ?? value;
    case 'person':
      return org.employees.find(e => e.id === value)?.name ?? value;
    case 'enum':
      return field.valueOptions?.find(o => o.value === value)?.label ?? value;
    default:
      return value;
  }
}

export function conditionClausePreview(
  clause: ConditionClause,
  triggerKey: string,
  org: ConditionOrgContext,
  allowedFieldKeys?: string[]
): string {
  const field = getConditionFieldDef(triggerKey, clause.field, allowedFieldKeys);
  if (!field) return '…';

  const operator = clause.operator as ConditionOperator | undefined;
  if (!operator || !isOperatorValidForField(operator, field)) {
    return `${field.label}…`;
  }

  const opLabel = OPERATOR_LABELS[operator];
  const needsValue = operatorNeedsValue(operator, field);

  if (!needsValue) {
    return `${field.label} ${opLabel}`;
  }

  const valueLabel = resolveValueLabel(field, clause.value, org);
  if (!valueLabel) return `${field.label} ${opLabel}`;

  return `${field.label} ${opLabel} ${valueLabel}`;
}

export function conditionStepPreview(
  config: StepConfig,
  triggerKey: string,
  org: ConditionOrgContext,
  allowedFieldKeys?: string[]
): string {
  const clauses = getConditionClauses(config);
  const parts = clauses
    .map(c => conditionClausePreview(c, triggerKey, org, allowedFieldKeys))
    .filter(p => p && p !== '…');

  if (parts.length === 0) return 'If condition is not configured';
  return `If ${parts.join(' and ')}`;
}

export function conditionClausesMatchTrigger(
  config: StepConfig,
  triggerKey: string,
  allowedFieldKeys?: string[]
): boolean {
  const clauses = getConditionClauses(config);
  return clauses.every(clause => {
    if (!clause.field) return true;
    return Boolean(getConditionFieldDef(triggerKey, clause.field, allowedFieldKeys));
  });
}

export function validateConditionClauses(
  step: AutomationStep,
  triggerKey: string,
  allowedFieldKeys?: string[]
): { id: string; message: string }[] {
  const issues: { id: string; message: string }[] = [];
  const clauses = getConditionClauses(step.config);

  if (clauses.length === 0) {
    issues.push({ id: `cond-empty-${step.id}`, message: 'Add at least one condition.' });
    return issues;
  }

  clauses.forEach((clause, idx) => {
    const row = idx + 1;
    const field = getConditionFieldDef(triggerKey, clause.field, allowedFieldKeys);

    if (!clause.field || !field) {
      issues.push({ id: `cond-field-${step.id}-${clause.id}`, message: `Condition ${row}: choose a field.` });
      return;
    }

    if (allowedFieldKeys && !allowedFieldKeys.includes(clause.field)) {
      issues.push({ id: `cond-field-allowed-${step.id}-${clause.id}`, message: `Condition ${row}: field is not allowed for this trigger.` });
    }

    const operator = clause.operator as ConditionOperator;
    if (!operator) {
      issues.push({ id: `cond-op-${step.id}-${clause.id}`, message: `Condition ${row}: choose an operator.` });
      return;
    }

    if (!isOperatorValidForField(operator, field)) {
      issues.push({ id: `cond-op-invalid-${step.id}-${clause.id}`, message: `Condition ${row}: operator is not valid for ${field.label}.` });
    }

    if (operatorNeedsValue(operator, field) && !clause.value.trim()) {
      issues.push({ id: `cond-val-${step.id}-${clause.id}`, message: `Condition ${row}: enter or select a value.` });
    }
  });

  return issues;
}
