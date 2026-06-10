import type { AutomationStep, StepConfig } from './automationTypes';
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

const POSITION_TYPE_OPTIONS = [
  { value: 'unique', label: 'unique' },
  { value: 'pooled', label: 'pooled' }
];

const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'active', label: 'active' },
  { value: 'onboarding', label: 'onboarding' },
  { value: 'inactive', label: 'inactive' }
];

export const POSITION_CHANGED_FIELDS: ConditionFieldDef[] = [
  { key: 'new_position', label: 'New Position', type: 'position' },
  { key: 'previous_position', label: 'Previous Position', type: 'position' },
  { key: 'new_department', label: 'New Department', type: 'department' },
  { key: 'previous_department', label: 'Previous Department', type: 'department' },
  { key: 'reporting_manager', label: 'Reporting Manager', type: 'person' },
  { key: 'department_head', label: 'Department Head', type: 'person' },
  { key: 'position_type', label: 'Position Type', type: 'enum', valueOptions: POSITION_TYPE_OPTIONS },
  { key: 'is_department_head_position', label: 'Is Department Head Position', type: 'boolean' },
  { key: 'employee_status', label: 'Employee Status', type: 'enum', valueOptions: EMPLOYEE_STATUS_OPTIONS },
  { key: 'position_capacity', label: 'Position Capacity', type: 'number' }
];

const ATTENDANCE_FIELDS: ConditionFieldDef[] = [
  { key: 'late_count_in_period', label: 'Late Count in Period', type: 'number' },
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

const EMPLOYEE_FIELDS: ConditionFieldDef[] = [
  { key: 'department', label: 'Department', type: 'department' },
  { key: 'position', label: 'Position', type: 'position' },
  { key: 'employee_status', label: 'Employee Status', type: 'enum', valueOptions: EMPLOYEE_STATUS_OPTIONS },
  { key: 'reporting_manager', label: 'Reporting Manager', type: 'person' }
];

const DOCUMENT_FIELDS: ConditionFieldDef[] = [
  { key: 'document_type', label: 'Document Type', type: 'enum', valueOptions: [
    { value: 'contract', label: 'Contract' },
    { value: 'id', label: 'ID document' },
    { value: 'certification', label: 'Certification' }
  ]},
  { key: 'document_expiry_within_days', label: 'Document Expiry Within Days', type: 'number' },
  { key: 'department', label: 'Department', type: 'department' }
];

const MONITORING_FIELDS: ConditionFieldDef[] = [
  { key: 'alert_severity', label: 'Alert Severity', type: 'enum', valueOptions: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ]},
  { key: 'department', label: 'Department', type: 'department' }
];

const TRIGGER_CONDITION_FIELDS: Record<string, ConditionFieldDef[]> = {
  position_changed: POSITION_CHANGED_FIELDS,
  position_assignment_changed: POSITION_CHANGED_FIELDS,
  position_created: POSITION_CHANGED_FIELDS,
  employee_created: EMPLOYEE_FIELDS,
  employee_updated: EMPLOYEE_FIELDS,
  employee_status_changed: EMPLOYEE_FIELDS,
  employee_onboarding_started: EMPLOYEE_FIELDS,
  employee_offboarding_started: EMPLOYEE_FIELDS,
  employee_terminated: EMPLOYEE_FIELDS,
  employee_checked_in_late: ATTENDANCE_FIELDS,
  employee_missed_checkin: ATTENDANCE_FIELDS,
  attendance_correction_submitted: ATTENDANCE_FIELDS,
  overtime_request_submitted: ATTENDANCE_FIELDS,
  leave_request_submitted: LEAVE_FIELDS,
  leave_request_approved: LEAVE_FIELDS,
  leave_request_rejected: LEAVE_FIELDS,
  leave_balance_below_limit: LEAVE_FIELDS,
  document_uploaded: DOCUMENT_FIELDS,
  document_missing: DOCUMENT_FIELDS,
  document_expiring_soon: DOCUMENT_FIELDS,
  document_expired: DOCUMENT_FIELDS,
  monitoring_alert_created: MONITORING_FIELDS,
  idle_activity_exceeds: MONITORING_FIELDS,
  app_usage_violation: MONITORING_FIELDS,
  device_offline: MONITORING_FIELDS
};

export function getConditionFieldsForTrigger(triggerKey: string): ConditionFieldDef[] {
  return TRIGGER_CONDITION_FIELDS[triggerKey] ?? EMPLOYEE_FIELDS;
}

export function getConditionFieldDef(triggerKey: string, fieldKey: string): ConditionFieldDef | undefined {
  return getConditionFieldsForTrigger(triggerKey).find(f => f.key === fieldKey);
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

export function conditionStepPreview(
  config: StepConfig,
  triggerKey: string,
  org: ConditionOrgContext
): string {
  const fieldKey = String(config.field ?? '');
  const field = getConditionFieldDef(triggerKey, fieldKey);
  if (!field) return 'If condition is not configured';

  const operator = config.operator as ConditionOperator | undefined;
  if (!operator || !isOperatorValidForField(operator, field)) {
    return `If ${field.label}…`;
  }

  const opLabel = OPERATOR_LABELS[operator];
  const needsValue = operatorNeedsValue(operator, field);

  if (!needsValue) {
    return `If ${field.label} ${opLabel}`;
  }

  const valueLabel = resolveValueLabel(field, String(config.value ?? ''), org);
  if (!valueLabel) return `If ${field.label} ${opLabel}`;

  return `If ${field.label} ${opLabel} ${valueLabel}`;
}

export function validateConditionStep(
  step: AutomationStep,
  triggerKey: string
): { id: string; message: string }[] {
  const issues: { id: string; message: string }[] = [];
  const config = step.config;
  const fieldKey = String(config.field ?? '');
  const field = getConditionFieldDef(triggerKey, fieldKey);

  if (!fieldKey || !field) {
    issues.push({ id: `cond-field-${step.id}`, message: 'Choose a condition field.' });
    return issues;
  }

  const operator = String(config.operator ?? '');
  if (!operator) {
    issues.push({ id: `cond-op-${step.id}`, message: 'Choose a condition operator.' });
    return issues;
  }

  if (!isOperatorValidForField(operator, field)) {
    issues.push({ id: `cond-op-invalid-${step.id}`, message: `Operator "${OPERATOR_LABELS[operator as ConditionOperator] ?? operator}" is not valid for ${field.label}.` });
  }

  if (operatorNeedsValue(operator as ConditionOperator, field) && !String(config.value ?? '').trim()) {
    issues.push({ id: `cond-val-${step.id}`, message: 'Enter or select a value for this condition.' });
  }

  if (config.hasBranch) {
    // Branch step validation handled at automation level
  }

  return issues;
}
