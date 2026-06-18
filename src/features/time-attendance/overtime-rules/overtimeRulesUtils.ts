import type {
  OvertimeAppliesTo,
  OvertimeApprover,
  OvertimeRatePreset,
  OvertimeRule,
  OvertimeRuleFormValues,
  OvertimeTrigger
} from './overtimeRulesTypes';

interface ScopeLabelContext {
  departments: { id: string; name: string }[];
  positions: { id: string; name: string }[];
  employees: { id: string; firstName: string; lastName: string }[];
}

const TRIGGER_LABELS: Record<OvertimeTrigger, string> = {
  'after-scheduled-end': 'After scheduled end',
  'exceeds-scheduled-hours': 'Worked time exceeds scheduled hours',
  'non-working-day-holiday': 'Non-working day or holiday'
};

const APPROVER_LABELS: Record<OvertimeApprover, string> = {
  'reporting-manager': 'Reporting manager',
  'department-head': 'Department head',
  'specific-position': 'Specific position',
  'specific-employee': 'Specific employee'
};

export function ruleSpecificityRank(appliesTo: OvertimeAppliesTo): number {
  switch (appliesTo) {
    case 'employees':
      return 4;
    case 'positions':
      return 3;
    case 'departments':
      return 2;
    default:
      return 1;
  }
}

export function formatAppliesTo(rule: OvertimeRule, ctx: ScopeLabelContext): string {
  switch (rule.appliesTo) {
    case 'full-company':
      return 'Full company';
    case 'departments': {
      const names = rule.departmentIds
        .map(id => ctx.departments.find(d => d.id === id)?.name)
        .filter(Boolean);
      return names.length ? `Departments: ${names.join(', ')}` : 'Departments';
    }
    case 'positions': {
      const names = rule.positionIds
        .map(id => ctx.positions.find(p => p.id === id)?.name)
        .filter(Boolean);
      return names.length ? `Positions: ${names.join(', ')}` : 'Positions';
    }
    case 'employees': {
      const names = rule.employeeIds
        .map(id => {
          const e = ctx.employees.find(emp => emp.id === id);
          return e ? `${e.firstName} ${e.lastName}` : null;
        })
        .filter(Boolean);
      return names.length ? `Employees: ${names.join(', ')}` : 'Employees';
    }
  }
}

export function formatTrigger(rule: OvertimeRule): string {
  if (!rule.trackOvertime) return 'Overtime not tracked';
  return rule.trigger ? TRIGGER_LABELS[rule.trigger] : '—';
}

export function formatThreshold(rule: OvertimeRule): string {
  if (!rule.trackOvertime) return '—';
  if (rule.trigger === 'non-working-day-holiday' && (rule.minimumMinutes ?? 0) === 0) {
    return 'Any time';
  }
  const mins = rule.minimumMinutes ?? 0;
  if (mins === 0) return '0 minutes';
  return `${mins} minute${mins === 1 ? '' : 's'}`;
}

export function formatApproval(
  rule: OvertimeRule,
  ctx: Pick<ScopeLabelContext, 'positions' | 'employees'>
): string {
  if (!rule.trackOvertime || !rule.requiresApproval) return '—';
  if (!rule.approver) return '—';

  if (rule.approver === 'specific-position' && rule.approverPositionId) {
    const pos = ctx.positions.find(p => p.id === rule.approverPositionId);
    return pos ? `Position: ${pos.name}` : APPROVER_LABELS[rule.approver];
  }
  if (rule.approver === 'specific-employee' && rule.approverEmployeeId) {
    const emp = ctx.employees.find(e => e.id === rule.approverEmployeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : APPROVER_LABELS[rule.approver];
  }
  return APPROVER_LABELS[rule.approver];
}

export function formatPayrollRate(rule: OvertimeRule): string {
  if (!rule.trackOvertime || !rule.paidOvertime) return 'Not paid';
  if (!rule.ratePreset) return '—';
  if (rule.ratePreset === 'custom') {
    return rule.customRate != null ? `${rule.customRate}x` : 'Custom';
  }
  return rule.ratePreset;
}

export function validateOvertimeRuleForm(values: OvertimeRuleFormValues): string | null {
  if (!values.name.trim()) return 'Rule name is required.';
  if (!values.appliesTo) return 'Applies To must be selected.';

  if (values.appliesTo === 'departments' && values.departmentIds.length === 0) {
    return 'Select at least one department.';
  }
  if (values.appliesTo === 'positions' && values.positionIds.length === 0) {
    return 'Select at least one position.';
  }
  if (values.appliesTo === 'employees' && values.employeeIds.length === 0) {
    return 'Select at least one employee.';
  }

  if (values.trackOvertime) {
    if (!values.trigger) return 'Trigger is required when overtime is tracked.';
    if (values.minimumMinutes < 0) return 'Minimum overtime minutes must be 0 or greater.';
    if (values.requiresApproval) {
      if (!values.approver) return 'Approver is required when approval is enabled.';
      if (values.approver === 'specific-position' && !values.approverPositionId) {
        return 'Select a position for approval.';
      }
      if (values.approver === 'specific-employee' && !values.approverEmployeeId) {
        return 'Select an employee for approval.';
      }
    }
    if (values.paidOvertime) {
      if (!values.ratePreset) return 'Rate multiplier is required when paid overtime is enabled.';
      if (values.ratePreset === 'custom') {
        const rate = Number(values.customRate);
        if (!values.customRate.trim() || Number.isNaN(rate) || rate <= 0) {
          return 'Enter a valid custom rate multiplier.';
        }
      }
    }
  }

  return null;
}

export function formValuesToRule(
  values: OvertimeRuleFormValues,
  existingId?: string
): OvertimeRule {
  const base: OvertimeRule = {
    id: existingId ?? '',
    name: values.name.trim(),
    status: values.status,
    appliesTo: values.appliesTo,
    departmentIds: [...values.departmentIds],
    positionIds: [...values.positionIds],
    employeeIds: [...values.employeeIds],
    trackOvertime: values.trackOvertime
  };

  if (!values.trackOvertime) {
    return { ...base, paidOvertime: false };
  }

  return {
    ...base,
    trigger: values.trigger as OvertimeTrigger,
    minimumMinutes: values.minimumMinutes,
    rounding: values.rounding,
    requiresApproval: values.requiresApproval,
    approver: values.requiresApproval ? (values.approver as OvertimeApprover) : undefined,
    approverPositionId:
      values.requiresApproval && values.approver === 'specific-position'
        ? values.approverPositionId
        : undefined,
    approverEmployeeId:
      values.requiresApproval && values.approver === 'specific-employee'
        ? values.approverEmployeeId
        : undefined,
    paidOvertime: values.paidOvertime,
    ratePreset: values.paidOvertime ? (values.ratePreset as OvertimeRatePreset) : undefined,
    customRate:
      values.paidOvertime && values.ratePreset === 'custom'
        ? Number(values.customRate)
        : undefined
  };
}

export function ruleToFormValues(rule: OvertimeRule): OvertimeRuleFormValues {
  return {
    name: rule.name,
    status: rule.status,
    appliesTo: rule.appliesTo,
    departmentIds: [...rule.departmentIds],
    positionIds: [...rule.positionIds],
    employeeIds: [...rule.employeeIds],
    trackOvertime: rule.trackOvertime,
    trigger: rule.trigger ?? '',
    minimumMinutes: rule.minimumMinutes ?? 0,
    rounding: rule.rounding ?? 'exact',
    requiresApproval: rule.requiresApproval ?? false,
    approver: rule.approver ?? '',
    approverPositionId: rule.approverPositionId ?? '',
    approverEmployeeId: rule.approverEmployeeId ?? '',
    paidOvertime: rule.paidOvertime ?? false,
    ratePreset: rule.ratePreset ?? '',
    customRate: rule.customRate != null ? String(rule.customRate) : ''
  };
}
