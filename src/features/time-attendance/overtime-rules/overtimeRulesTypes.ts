export type OvertimeAppliesTo = 'full-company' | 'departments' | 'positions' | 'employees';

export type OvertimeTrigger =
  | 'after-scheduled-end'
  | 'exceeds-scheduled-hours'
  | 'non-working-day-holiday';

export type OvertimeRounding = 'exact' | 'nearest-15' | 'nearest-30';

export type OvertimeApprover =
  | 'reporting-manager'
  | 'department-head'
  | 'specific-position'
  | 'specific-employee';

export type OvertimeRatePreset = '1x' | '1.5x' | '2x' | 'custom';

export type OvertimeRuleStatus = 'active' | 'inactive';

export interface OvertimeRule {
  id: string;
  name: string;
  status: OvertimeRuleStatus;
  appliesTo: OvertimeAppliesTo;
  departmentIds: string[];
  positionIds: string[];
  employeeIds: string[];
  trackOvertime: boolean;
  trigger?: OvertimeTrigger;
  minimumMinutes?: number;
  rounding?: OvertimeRounding;
  requiresApproval?: boolean;
  approver?: OvertimeApprover;
  approverPositionId?: string;
  approverEmployeeId?: string;
  paidOvertime?: boolean;
  ratePreset?: OvertimeRatePreset;
  customRate?: number;
}

export interface OvertimeRuleFormState {
  open: boolean;
  mode: 'create' | 'edit';
  ruleId: string | null;
}

export interface OvertimeRuleFormValues {
  name: string;
  status: OvertimeRuleStatus;
  appliesTo: OvertimeAppliesTo;
  departmentIds: string[];
  positionIds: string[];
  employeeIds: string[];
  trackOvertime: boolean;
  trigger: OvertimeTrigger | '';
  minimumMinutes: number;
  rounding: OvertimeRounding;
  requiresApproval: boolean;
  approver: OvertimeApprover | '';
  approverPositionId: string;
  approverEmployeeId: string;
  paidOvertime: boolean;
  ratePreset: OvertimeRatePreset | '';
  customRate: string;
}

export const EMPTY_OVERTIME_RULE_FORM = (): OvertimeRuleFormValues => ({
  name: '',
  status: 'active',
  appliesTo: 'full-company',
  departmentIds: [],
  positionIds: [],
  employeeIds: [],
  trackOvertime: true,
  trigger: 'after-scheduled-end',
  minimumMinutes: 30,
  rounding: 'exact',
  requiresApproval: true,
  approver: 'reporting-manager',
  approverPositionId: '',
  approverEmployeeId: '',
  paidOvertime: true,
  ratePreset: '1.5x',
  customRate: ''
});
