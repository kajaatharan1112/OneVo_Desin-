import type { OvertimeRule } from './overtimeRulesTypes';

export const SEED_OVERTIME_RULES: OvertimeRule[] = [
  {
    id: 'ot-rule-standard',
    name: 'Standard Overtime',
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
    paidOvertime: true,
    ratePreset: '1.5x'
  },
  {
    id: 'ot-rule-weekend',
    name: 'Weekend / Holiday Overtime',
    status: 'active',
    appliesTo: 'full-company',
    departmentIds: [],
    positionIds: [],
    employeeIds: [],
    trackOvertime: true,
    trigger: 'non-working-day-holiday',
    minimumMinutes: 0,
    rounding: 'exact',
    requiresApproval: true,
    approver: 'reporting-manager',
    paidOvertime: true,
    ratePreset: '2x'
  },
  {
    id: 'ot-rule-executive',
    name: 'Executive Exemption',
    status: 'active',
    appliesTo: 'positions',
    departmentIds: [],
    positionIds: ['pos-ceo', 'pos-cto'],
    employeeIds: [],
    trackOvertime: false,
    paidOvertime: false
  }
];
